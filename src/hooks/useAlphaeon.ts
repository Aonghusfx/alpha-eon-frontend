import { useState, useCallback } from 'react';
import {
    alphaeonApi,
    type AlphaeonApplicationRequest,
    type AlphaeonApplicationResponse,
    type AlphaeonPaymentRequest,
    type AlphaeonPaymentResponse,
} from '../services/alphaeonApi';

export interface UseAlphaeonOptions {
    onSuccess?: (response: AlphaeonPaymentResponse) => void;
    onError?: (error: Error) => void;
}

export function useAlphaeon(options?: UseAlphaeonOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<AlphaeonApplicationResponse | null>(null);

    /**
     * Create a financing application
     */
    const createApplication = useCallback(
        async (request: AlphaeonApplicationRequest) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await alphaeonApi.createApplication(request);
                setApplication(response);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create application';
                setError(errorMessage);
                options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options]
    );

    /**
     * Check application status
     */
    const checkApplicationStatus = useCallback(
        async (applicationId: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await alphaeonApi.getApplicationStatus(applicationId);
                setApplication(response);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to check application status';
                setError(errorMessage);
                options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options]
    );

    /**
     * Process payment
     */
    const processPayment = useCallback(
        async (request: AlphaeonPaymentRequest) => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('Processing payment... requestdddddddddddddddddd..........', request);
                const response = await alphaeonApi.processPayment(request);
                if (response.status === 'success') {
                    options?.onSuccess?.(response);
                }

                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
                setError(errorMessage);
                options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options]
    );

    /**
     * Set access token manually
     */
    const setAccessToken = useCallback((token: string, expiresIn?: number) => {
        alphaeonApi.setAccessToken(token, expiresIn);
    }, []);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Get financing plans
     */
    const getFinancingPlans = useCallback(
        async (amount: number, locationId?: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await alphaeonApi.getFinancingPlans(amount, locationId);
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financing plans';
                setError(errorMessage);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setApplication(null);
    }, []);

    return {
        isLoading,
        error,
        setError, // Expose setError
        application,
        createApplication,
        checkApplicationStatus,
        getFinancingPlans,
        processPayment,
        setAccessToken,
        clearError,
        reset,
    };
}
