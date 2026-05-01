/**
 * Alphaeon Credit API Service
 * Handles all API interactions with Alphaeon payment financing system
 */

export interface AlphaeonAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

export interface AlphaeonApplicationRequest {
    merchantId: string;
    amount: number;
    patientInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address?: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
        };
    };
    financingOptions: {
        term: number; // 6, 12, or 24 months
        downPayment?: number;
    };
}

export interface AlphaeonApplicationResponse {
    applicationId: string;
    status: 'pending' | 'approved' | 'declined' | 'processing';
    approvedAmount?: number;
    terms?: {
        monthlyPayment: number;
        numberOfPayments: number;
        apr: number;
        totalAmount: number;
    };
    message?: string;
    redirectUrl?: string;
}

export interface AlphaeonPaymentRequest {
    applicationId: string;
    amount: number;
    paymentMethod: {
        cardNumber: string;
        cardholderName: string;
        expiryMonth: string;
        expiryYear: string;
        cvv: string;
        billingZipCode: string;
    };
}

export interface AlphaeonPaymentResponse {
    transactionId?: string;
    transaction_id?: string | number;
    status: 'success' | 'failed' | 'pending' | 'settled' | 'error' | 'declined' | 'pending_signature';
    amount: number;
    downpayment_amount?: number | null;
    message?: string;
    confirmationNumber?: string;
    location_name?: string;
    contract_signature_url?: string;
    digital_receipt_url?: string;
    [key: string]: any; // Allow for other Alphaeon response fields
}

class AlphaeonApiService {
    private baseUrl: string;
    private merchantId: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        // Note: Using import.meta.env for Vite (frontend) compatibility.
        // If running in Node context (tests), ensure process.env is polyfilled or use a different service.
        this.baseUrl = import.meta.env.VITE_ALPHAEON_API_URL;
        this.merchantId = import.meta.env.VITE_ALPHAEON_MERCHANT_ID || '';
        this.clientId = import.meta.env.VITE_ALPHAEON_CLIENT_ID || 'faB1X0qx8UgquO9hFlnmBP76orJRy7y3';
        this.clientSecret = import.meta.env.VITE_ALPHAEON_CLIENT_SECRET || 'd-z7nKFpqRwCT23vUdPVVnRDrC0PCeGmunzaOGLzmV4P5wJUZS8z6kTMJWLBn1Ph';
    }

    /**
     * Authenticate with Alphaeon API and get access token
     */
    async authenticate(): Promise<string> {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const audience = import.meta.env.VITE_ALPHAEON_AUDIENCE || 'https://api.alphaeon.com/';

            const response = await fetch(`${this.baseUrl}/api/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    audience: audience,
                    grant_type: 'client_credentials',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Authentication failed:', response.status, errorText);
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }

            const data: AlphaeonAuthResponse = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

            console.log('✅ Alphaeon authentication successful!');
            return this.accessToken;
        } catch (error) {
            console.error('Alphaeon authentication error:', error);
            throw new Error('Failed to authenticate with Alphaeon API');
        }
    }

    /**
     * Set access token manually (if you already have one)
     */
    setAccessToken(token: string, expiresIn?: number) {
        this.accessToken = token;
        if (expiresIn) {
            this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000;
        }
    }

    /**
     * Make authenticated API request
     */
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await this.authenticate();

        const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Merchant-ID': this.merchantId,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `API request failed: ${response.statusText}`
            );
        }

        return response.json();
    }

    /**
     * Create a financing application
     */
    async createApplication(
        request: any
    ): Promise<AlphaeonApplicationResponse> {
        return this.makeRequest<AlphaeonApplicationResponse>('/merchant_management/v2/credit_applications/apply', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /**
     * Get application status - Note: Endpoint not implemented in backend yet
     */
    async getApplicationStatus(applicationId: string): Promise<AlphaeonApplicationResponse> {
        return this.makeRequest<AlphaeonApplicationResponse>(
            `/v2/applications/${applicationId}`
        );
    }

    /**
     * Process payment / Create Sale
     */
    async processPayment(
        request: any
    ): Promise<AlphaeonPaymentResponse> {
        const response = await this.makeRequest<AlphaeonPaymentResponse>('/transactions/sale', {
            method: 'POST',
            body: JSON.stringify(request),
        });

        // NORMALIZATION: If Alphaeon (ac_card) doesn't echo back the downpayment, inject it here
        // so downstream UI/DB processes can still see it as part of the transaction record.
        // if (response && (response.downpayment_amount === null || response.downpayment_amount === undefined)) {
        //     response.downpayment_amount = request.down_payment || request.downpayment || 0;
        // }

        return response;
    }

    /**
     * Create a sale transaction (Alias for processPayment with better typing in future)
     */
    async createSale(saleData: any): Promise<any> {
        return this.processPayment(saleData);
    }

    /**
     * Get Transaction Details
     */
    async getTransactionDetails(transactionId: string, locationId: string = '15470'): Promise<any> {
        return this.makeRequest<any>(`/transactions/${transactionId}?location_id=${locationId}`, {
            method: 'GET'
        });
    }

    /**
     * Send signing link via Alphaeon identity verification
     */
    async sendSigningLink(data: {
        alphaeon_account_identifier: string;
        consumer_email?: string;
        consumer_phone?: string;
        location_id: number;
    }): Promise<any> {
        return this.makeRequest<any>('/send-signing-link', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Send receipt email via Alphaeon
     */
    async sendReceipt(transactionId: string, email?: string): Promise<any> {
        return this.makeRequest<any>('/send-receipt', {
            method: 'POST',
            body: JSON.stringify({
                transaction_id: transactionId,
                email
            })
        });
    }

    /**
     * Get available financing plans based on purchase amount
     */
    async getFinancingPlans(amount: number, locationId: string = '15470'): Promise<any> {
        // Backend route path is v1 for compatibility, but it proxies Alphaeon v2 and returns eligible_plans/ineligible_plans.
        return this.makeRequest(`/merchant_management/v2/locations/${locationId}/plans?amount=${amount}`);
    }

    /**
     * Validate merchant credentials
     */
    async validateCredentials(): Promise<boolean> {
        try {
            await this.authenticate();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Lookup an existing account via identity factors (SSN, Account Number, etc.)
     */
    async lookupAccount(
        params: {
            ssn?: string;
            zip?: string;
            account_number?: string;
            dob?: string;
            ssn_last_4?: string;
            location_id?: string | number;
        }
    ): Promise<any[]> {
        const response = await this.makeRequest<any>('/merchant_management/v2/lookups/all_ads_accounts', {
            method: 'POST',
            body: JSON.stringify({
                ssn: params.ssn,
                zip: params.zip,
                account_number: params.account_number,
                ssn_last_4: params.ssn_last_4,
                dob: params.dob,
                location_id: params.location_id || '15470'
            }),
        });
        return response.accounts || [];
    }

    /**
     * Lookup account by Account Number
     */
    async lookupAccountByNumber(accountNumber: string, locationId: string = '15470'): Promise<any> {
        return this.makeRequest<any>(`/lookups/accounts/${accountNumber}?location_id=${locationId}`, {
            method: 'GET'
        });
    }

    /**
     * Get terms and requirements for a new credit application
     */
    async getNewApplicationTerms(locationId: string = '15470'): Promise<any> {
        return this.makeRequest<any>(`/merchant_management/v2/credit_applications/new?location_id=${locationId}`, {
            method: 'GET',
        });
    }

    /**
     * Submit a new credit application
     */
    async submitCreditApplication(applicationData: any): Promise<any> {
        // Ensure location_id is present in applicationData
        if (!applicationData.location_id) {
            applicationData.location_id = '15470'; // Default production location
        }

        return this.makeRequest<any>('/merchant_management/v2/credit_applications/apply', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    /**
     * Get terms and requirements for consumer prequalification
     */
    async getConsumerPrequalificationTerms(locationId: string): Promise<any> {
        return this.makeRequest<any>(`/consumer_applications/v2/prequalifications/new?location_id=${locationId}`, {
            method: 'GET',
        });
    }

    /**
     * Create a new prequalification session
     */
    async createPrequalification(applicationData: any): Promise<any> {
        return this.makeRequest<any>('/consumer_applications/v2/prequalifications', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    /**
     * Void a transaction (V2)
     */
    async voidTransaction(transactionId: string | number, locationId: string = '15470'): Promise<any> {
        return this.makeRequest<any>('/v2/transactions/void', {
            method: 'PATCH',
            body: JSON.stringify({
                transaction_id: transactionId,
                location_id: locationId
            })
        });
    }

    /**
     * Process a refund (V2)
     */
    async refundTransaction(transactionId: string | number, amount: number, accountMemberId: string | number, locationId: string = '15470', comment?: string): Promise<any> {
        return this.makeRequest<any>('/v2/transactions/refund', {
            method: 'POST',
            body: JSON.stringify({
                transaction_id: transactionId,
                amount: amount,
                account_member_id: accountMemberId,
                location_id: locationId,
                comment: comment
            })
        });
    }

    /**
     * Get transaction details (V2)
     */
    async getTransactionV2(transactionId: string | number, locationId: string = '15470'): Promise<any> {
        return this.makeRequest<any>(`/v2/transactions/${transactionId}?location_id=${locationId}`, {
            method: 'GET'
        });
    }
}

// Export singleton instance
export const alphaeonApi = new AlphaeonApiService();

