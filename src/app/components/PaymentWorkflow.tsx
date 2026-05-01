import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentDetailsForm } from './PaymentDetailsForm';
import { PatientInfoForm, type PatientInfo } from './PatientInfoForm';
import { FinancePlanSelector, type UpfrontPaymentMethod } from './FinancePlanSelector';
import { CardPaymentForm } from './ui/CardPaymentForm';
import { BankTransferForm } from './ui/BankTransferForm';
import { PaymentSummary } from './ui/PaymentSummary';
import { SuccessStep } from './SuccessStep';
import { ReceiptStep } from './ReceiptStep';
import { FailedStep } from './FailedStep';
import { useAlphaeon } from '../../hooks/useAlphaeon';
import { alphaeonApi } from '../../services/alphaeonApi';
import { AlphaeonIframeHost } from './AlphaeonIframeHost';
import { PlaidIframeHost } from './PlaidIframeHost';
import { Alert, AlertDescription } from './ui/alert';

export type PaymentMethod = 'full' | 'finance' | '';
export type FinancePlan = any;
interface PaymentWorkflowProps {
  initialStep?: number;
  initialPaymentMethod?: PaymentMethod;
  externalParams?: {
    amount: number;
    advitalUpfrontAmount?: number;
    advitalTransactionId?: string;
    contactId?: string;
    locationId?: string;
  };
}

export interface Plan {
  id: number;
  name: string;
  term_months: number;
  apr: number;
  monthly_payment: number;
  total_cost?: number;
  description?: string;
  plan_name_label?: string;
}

export interface PaymentData {
  paymentMethod: PaymentMethod;
  financePlan?: string; // We'll store the plan name or ID
  selectedPlanObject?: Plan;
  upfrontPayment?: number;
  upfrontPaymentMethod?: UpfrontPaymentMethod;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  billingZip: string;
  bankAccountName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  patientInfo?: PatientInfo;
  accountNumber?: string;
  consumerCreditInstrumentId?: string;
  accountMemberId?: string;
  alphaeonAccountIdentifier?: string;
  creditLimit?: number;
  availableCredit?: number;
  available_credit_limit?: number;
  transactionId?: string;
  isSignaturePending?: boolean;
  signatureLink?: string;
  cardAuthId?: string;
  advitalUpfrontPaid?: boolean;
  advitalChargeId?: string;
  advitalCustomerVaultId?: string;
}


const steps = [
  { id: 1, name: 'Payment Method' },
  { id: 2, name: 'Patient Info' },
  { id: 3, name: 'Payment Details' },
  { id: 4, name: 'Review & Sign' },
  { id: 5, name: 'Receipt' },
];

export function PaymentWorkflow({
  initialStep = 1,
  initialPaymentMethod = '',
  externalParams,
}: PaymentWorkflowProps = {}) {
  const advitalAllowedOrigin = import.meta.env.VITE_ADVITAL_ALLOWED_ORIGIN || 'https://adv-dev.vercel.app';
  const advitalPortalBaseUrl = import.meta.env.VITE_ADVITAL_PORTAL_BASE_URL || 'https://adv-dev.vercel.app';
  const advitalPublishableKey = import.meta.env.VITE_ADVITAL_PUBLISHABLE_KEY || 'jYjfEW-aZG66e-w8a28d-Z6F5zB';
  const isAdvitalUpfrontApplied = !!externalParams?.advitalTransactionId;
  const safeInitialStep = Math.min(Math.max(initialStep, 1), steps.length);
  const [currentStep, setCurrentStep] = useState(safeInitialStep);
  const [maxStepReached, setMaxStepReached] = useState(safeInitialStep);
  const [iframeTrackingGuid, setIframeTrackingGuid] = useState<string | null>(null);
  const locationId = import.meta.env.VITE_ALPHAEON_LOCATION_ID || '15470';
  const advitalLocationId = import.meta.env.VITE_ADVITAL_LOCATION_ID || 'test123';

  const [paymentData, setPaymentData] = useState<any>({
    paymentMethod: initialPaymentMethod,
    upfrontPaymentMethod: 'card' as UpfrontPaymentMethod,
    upfrontPayment: externalParams?.advitalUpfrontAmount || 0,
    transactionId: externalParams?.advitalTransactionId || undefined,
    advitalUpfrontPaid: !!externalParams?.advitalTransactionId,
    advitalChargeId: externalParams?.advitalTransactionId || undefined,
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingZip: '',
  });

  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [orderData, setOrderData] = useState<any>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [isSearchingAccount, setIsSearchingAccount] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [plaidVerificationUrl, setPlaidVerificationUrl] = useState<string | null>(null);
  const [iframeApplicationStatus, setIframeApplicationStatus] = useState<string | null>(null);
  const [showAdvitalUpfrontIframe, setShowAdvitalUpfrontIframe] = useState(false);

  // Use refs to avoid stale closures in the postMessage event listener
  const paymentDataRef = useRef(paymentData);
  const orderAmountRef = useRef(orderAmount);
  const locationIdRef = useRef(locationId);
  const advitalLocationIdRef = useRef(advitalLocationId);

  console.log(paymentDataRef?.current?.upfrontPayment, "paymentDataRef.current")

  useEffect(() => {
    paymentDataRef.current = paymentData;
    orderAmountRef.current = orderAmount;
    locationIdRef.current = locationId;
    advitalLocationIdRef.current = advitalLocationId;
  }, [paymentData, orderAmount, locationId, advitalLocationId]);

  const updatePaymentData = (updates: Partial<PaymentData>) => {
    setPaymentData((prev: any) => ({ ...prev, ...updates }));
  };

  // Fetch initial order amount
  useEffect(() => {
    if (externalParams?.amount) {
      console.log(`💰 Using external amount: ${externalParams.amount}`);
      setOrderAmount(externalParams.amount);
      setIsOrderLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const baseUrl = import.meta.env.VITE_ALPHAEON_API_URL;
        const response = await fetch(`${baseUrl.trim()}/api/orders/latest`);

        if (!response.ok) {
          console.warn(`Orders endpoint returned ${response.status}, using default amount`);
          setOrderAmount(802);
          setIsOrderLoading(false);
          return;
        }

        const data = await response.json();
        if (data && (data.total || data.amount)) {
          // Use total for financing, fallback to amount
          const finalTotal = data.total || data.amount;
          setOrderAmount(finalTotal);
          setOrderData(data);
          console.log(`💰 Dynamic order loaded:`, data);
        } else {
          setOrderAmount(802);
        }
      } catch (err) {
        console.error('Failed to fetch order amount:', err);
        // Fallback to a default if API fails
        setOrderAmount(802);
      } finally {
        setIsOrderLoading(false);
      }
    };
    fetchOrder();
  }, [externalParams]);

  // Alphaeon integration
  const {
    isLoading: alphaeonLoading,
    error: alphaeonError,
    setError: setAlphaeonError,
    getFinancingPlans,
    clearError,
  } = useAlphaeon({
    onSuccess: (response) => {
      console.log('Payment successful:', response);
    },
    onError: (error) => {
      console.error('Payment error:', error);
    },
  });

  useEffect(() => {
    if (orderAmount === 0) return;
    const remainingToFinance = orderAmount - (paymentData.upfrontPayment || 0);

    const fetchPlans = async () => {
      try {
        const response = await getFinancingPlans(remainingToFinance, locationId);
        const plansSource = response?.eligible_plans || response?.plans;
        if (response && Array.isArray(plansSource)) {
          // Deduplicate plans based on ID and Name
          const seen = new Set();
          const transformedPlans = plansSource
            .filter((p: any) => {
              const key = `${p.id}-${p.name}`;
              if (seen.has(key)) return false;
              seen.add(key);

              // Exclude the default Revolving plan
              const isRevolving = p.name?.toUpperCase().includes('REVOLVING') || p.max_term_months >= 1000;
              return !isRevolving;
            })
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              term_months: (p.term_months || p.max_term_months) ||
                (parseInt(p.name?.match(/(\d+)\s*MONTHS/i)?.[1] || "0")),
              apr: p.max_customer_apr !== undefined ? p.max_customer_apr : (p.apr || 0),
              monthly_payment: p.estimated_monthly_payment || p.conservative_monthly_payment_amount || p.monthly_payment || 0,
              total_cost: p.estimated_total_cost || p.total_cost || remainingToFinance,
              description: [
                ...(p.promotional_terms || []),
                ...(p.terms || []),
                ...(p.location_plan_settings?.location_plan_terms || [])
              ].map(t => t.text).filter(Boolean).join('<br/><br/>') || p.description || p.name,
              plan_name_label: p.plan_name_label || p.name
            }));
          setAvailablePlans(transformedPlans);
          console.log(`✅ Dynamic plans loaded for $${remainingToFinance}:`, transformedPlans);

          // If a plan was already selected, update its details from the new fetched list
          setPaymentData((prev: any) => {
            if (prev.selectedPlanObject) {
              const updatedPlan = transformedPlans.find((p: Plan) => p.id === prev.selectedPlanObject?.id);
              if (updatedPlan) {
                return {
                  ...prev,
                  selectedPlanObject: updatedPlan
                };
              }
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to fetch dynamic plans:', err);
      }
    };

    fetchPlans();
  }, [getFinancingPlans, orderAmount, paymentData.upfrontPayment]);

  // POLLING FALLBACK: If iframe is open, check for account existence periodically
  useEffect(() => {
    let pollInterval: any;

    if (iframeTrackingGuid && paymentData.patientInfo?.ssn) {
      console.log("⏱ Starting polling for account status...");
      pollInterval = setInterval(async () => {
        try {
          // If we already have the IDs from a postMessage, stop polling
          if (paymentData.accountNumber && paymentData.consumerCreditInstrumentId) {
            console.log("🛑 Account IDs found via postMessage, stopping poll.");
            clearInterval(pollInterval);
            return;
          }

          console.log("🔄 Background polling for account: ", paymentData.patientInfo?.ssn);
          const accounts = await alphaeonApi.lookupAccount({
            ssn: paymentData.patientInfo?.ssn,
            zip: paymentData.patientInfo?.address.zipCode,
            location_id: locationId
          });

          if (accounts && accounts.length > 0) {
            const acc = accounts[0];
            console.log("✨ Background poll FOUND account!", acc);

            // Auto-close iframe and update data
            setIframeTrackingGuid(null);

            updatePaymentData({
              accountNumber: acc.alphaeon_account_number,
              consumerCreditInstrumentId: acc.consumer_credit_instrument_id ? String(acc.consumer_credit_instrument_id) : undefined,
              accountMemberId: acc.account_member_id ? String(acc.account_member_id) : undefined,
              alphaeonAccountIdentifier: acc.alphaeon_account_identifier,
              creditLimit: acc.credit_limit,
              available_credit_limit: acc.available_credit_limit,
              availableCredit: acc.available_credit_limit || acc.available_credit,
              patientInfo: {
                ...paymentData.patientInfo,
                firstName: (acc.name?.first_name || acc.first_name || acc.firstName || paymentData.patientInfo?.firstName || '').trim(),
                lastName: (acc.name?.last_name || acc.last_name || acc.lastName || paymentData.patientInfo?.lastName || '').trim(),
                email: acc.email || acc.contact_email || paymentData.patientInfo?.email,
                phone: acc.phone || acc.mobile_phone || acc.primary_phone || paymentData.patientInfo?.phone,
              }
            });

            toast.success("Account confirmed! You're ready to proceed.");
            setCurrentStep(3);
            setMaxStepReached(m => Math.max(m, 3));
            clearInterval(pollInterval);
          }
        } catch (e) {
          console.warn("Polling error (silent):", e);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (pollInterval) {
        console.log("🛑 Stopping account polling.");
        clearInterval(pollInterval);
      }
    };
  }, [iframeTrackingGuid, paymentData.patientInfo, paymentData.accountNumber, paymentData.consumerCreditInstrumentId]);

  useEffect(() => {
    const handleAdvitalMessage = (event: MessageEvent) => {
      console.log('📬 Message received in PaymentWorkflow:', {
        origin: event.origin,
        advitalAllowedOrigin: advitalAllowedOrigin,
        data: event.data
      });
      // Log all messages from the allowed origin for easier debugging
      if (event.origin === advitalAllowedOrigin) {

        console.log('📨 Advital Iframe Message:', event.data);
      } else {
        return;
      }

      const message = event.data;
      if (!message || typeof message !== 'object' || !message.type) return;

      const currentOrderAmount = orderAmountRef.current;
      const currentPaymentData = paymentDataRef.current;
      const currentAdvitalLocationId = advitalLocationIdRef.current;

      if (message.type === 'advital_payment_success') {
        console.log('✅ Advital Payment Success:', message.data);
        const data = message.data || {};

        const upfrontPaid = Number(data.upfrontAmount || 0);
        // const remaining = Number(data.remainingBalance || (currentOrderAmount - upfrontPaid));

        updatePaymentData({
          advitalUpfrontPaid: true,
          // upfrontPayment: upfrontPaid,
          advitalChargeId: data.chargeId || data.transactionId || '',
          advitalCustomerVaultId: data.customerVaultId || '',
        });

        setShowAdvitalUpfrontIframe(false);
        toast.success('Upfront payment received!');
      }

      if (message.type === 'advital_payment_error') {
        console.log("message.type", message.type, "hekfaemf;aefl;eamfl;emal;fma;lfm;l", message.error)
        console.error('❌ Advital Payment Error:', message.error);
        const errorMsg = message.error || 'Payment failed. Please try again.';

        toast.error(errorMsg);

      }

      if (message.type === 'advital_payment_skipped') {
        console.log('ℹ️ Advital Payment Skipped:', message.data);
        updatePaymentData({

          advitalUpfrontPaid: true,
          upfrontPayment: 0,
        });

        setShowAdvitalUpfrontIframe(false);
      }
    };

    window.addEventListener('message', handleAdvitalMessage);
    return () => window.removeEventListener('message', handleAdvitalMessage);
  }, [advitalAllowedOrigin, updatePaymentData, externalParams?.contactId]);

  useEffect(() => {
    const toastId = 'advital-upfront-required';
    if ((paymentData.upfrontPayment || 0) > 0 && !paymentData.advitalUpfrontPaid && currentStep === 3) {
      toast(
        `Complete upfront payment of $${Number(paymentData.upfrontPayment || 0).toFixed(2)} in the secure iframe first. Submit Sale will be enabled after payment confirmation.`,
        { id: toastId, icon: 'ℹ️' }
      );
      return;
    }
    toast.dismiss(toastId);
  }, [paymentData.upfrontPayment, paymentData.advitalUpfrontPaid, currentStep]);

  const handleFinalSubmit = async () => {
    setIsSearchingAccount(true);
    setTransactionError(null);
    clearError();

    try {
      const data = paymentData;
      const amount = orderAmount;

      if (
        data.paymentMethod === 'finance' &&
        (data.upfrontPayment || 0) > 0 &&
        !data.advitalUpfrontPaid
      ) {
        setShowAdvitalUpfrontIframe(true);
        setIsSearchingAccount(false);
        toast('Complete upfront payment in the secure iframe first.', { icon: '💳' });
        return;
      }

      const hasUpfrontPayment =
        data.paymentMethod === 'finance' &&
        data.upfrontPayment &&
        data.upfrontPayment > 0 &&
        !data.advitalUpfrontPaid &&
        !isAdvitalUpfrontApplied;
      let cardAuthId = "";

      // Safety check for minimum finance amount
      if (data.paymentMethod === 'finance') {
        const financedAmount = amount - (data.upfrontPayment || 0);
        if (financedAmount < 250) {
          toast.error("Finance is not possible for amounts less than $250.00.");
          return;
        }
      }

      // Phase 1: Upfront Card Payment (if applicable)
      if (data.paymentMethod === 'full' || hasUpfrontPayment) {
        const upfrontAmt = data.paymentMethod === 'full' ? amount : (data.upfrontPayment || 0);

        console.log(`🚀 Step 1: Processing ${data.paymentMethod === 'full' ? 'full' : 'upfront'} payment of $${upfrontAmt} via card...`);
        toast(`${data.paymentMethod === 'full' ? 'Processing full' : 'Step 1 of 2: Processing upfront'} payment...`, { icon: '💳' });

        // Use the same base URL as Alphaeon API, but point to the payments route
        const alphaeonBaseUrl = import.meta.env.VITE_ALPHAEON_API_URL || '';
        const apiBaseUrl = alphaeonBaseUrl.includes('/alphaeon')
          ? alphaeonBaseUrl.split('/alphaeon')[0]
          : '/api';

        console.log(`🔌 Using API Base for card charge: ${apiBaseUrl}`);

        // Call backend card payment endpoint
        const cardRes = await fetch(`${apiBaseUrl}/payments/card/charge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: upfrontAmt,
            currency: 'USD',
            card: {
              number: data.cardNumber,
              name: data.cardName,
              expiry: data.expiryDate,
              cvv: data.cvv,
              zip: data.billingZip,
            },
          }),
        }).then(async (r) => {
          if (!r.ok) {
            const e = await r.text();
            throw new Error(e || 'Card payment failed');
          }
          return r.json();
        });

        cardAuthId = cardRes.authorization_id;
        updatePaymentData({ cardAuthId });

        if (data.paymentMethod === 'full') {
          toast.success(`Full Payment Successful! (Auth: ${cardAuthId})`);
          setCurrentStep(5);
          setMaxStepReached(Math.max(maxStepReached, 5));
          return;
        }

        toast.success("Upfront payment processed!");
      }

      // Phase 2: Alphaeon Financing (for 'finance' method)
      if (data.paymentMethod === 'finance') {
        console.log('🚀 Step 2: Finalizing Alphaeon Transaction...');
        toast("Step 2 of 2: Finalizing financing...", { icon: '🏦' });

        // locationId is now defined at component level

        let instrumentId = paymentData.consumerCreditInstrumentId;
        let memberId = paymentData.accountMemberId;

        if (!instrumentId || instrumentId === "undefined" || !memberId || memberId === "undefined") {
          console.log('🔍 IDs missing or "undefined", performing secondary account lookup...');
          const lookup = await alphaeonApi.lookupAccountByNumber(paymentData.accountNumber || '', locationId);
          instrumentId = lookup.consumer_credit_instrument_id;
          memberId = lookup.account_member_id;
          console.log('✅ IDs re-synchronized from lookup:', { instrumentId, memberId });
          if (lookup.alphaeon_account_identifier) {
            updatePaymentData({ alphaeonAccountIdentifier: lookup.alphaeon_account_identifier });
          }
        }

        const totalPurchaseAmount = amount;
        const upfrontDownPayment = data.upfrontPayment || 0;
        const financedAmount = totalPurchaseAmount - upfrontDownPayment;

        const saleData = {
          amount: financedAmount,
          purchase_amount: totalPurchaseAmount,
          invoice_number:
            cardAuthId ||
            data.advitalChargeId ||
            externalParams?.advitalTransactionId ||
            `ORD-${Date.now()}`,
          down_payment: upfrontDownPayment,
          downpayment: upfrontDownPayment,
          downpayment_amount: upfrontDownPayment,
          location_id: parseInt(locationId),
          consumer_credit_instrument_id: instrumentId,
          account_member_id: memberId,
          plan_id: data.selectedPlanObject?.id || 1,
          identification_confirmation: { type: 'digital-receipt-embed' },
          comment: `Payment for ${orderData?.productName || 'services'} (Includes $${upfrontDownPayment} upfront - Ref: ${cardAuthId || data.advitalChargeId || externalParams?.advitalTransactionId || 'N/A'})`,
          consumer_email: data.patientInfo?.email,
          consumer_phone: data.patientInfo?.phone,
          alphaeon_account_identifier: data.alphaeonAccountIdentifier,
        };

        console.log('🚀 Sending SALE DATA to Alphaeon:', saleData);
        const resData = await alphaeonApi.createSale(saleData);

        if (resData.error_code || resData.status === 'error' || resData.status === 'declined' || resData.status === 'failed') {
          throw new Error(resData.message || 'Transaction was declined by the lender.');
        }

        const receiptUrl = resData.receipt_url || resData.contract_signature_url || resData.digital_receipt_url || resData.url;

        updatePaymentData({
          transactionId: resData.transaction_id || resData.id,
          isSignaturePending: true,
          signatureLink: receiptUrl || null
        });

        toast.success("Please complete the secure signature below!");
        setCurrentStep(4);
      }
    } catch (e: any) {
      console.error("Submission Error", e);
      const msg = e.message || 'Transaction failed';
      toast.error(msg);
      setCurrentStep(4); // Ensure we land on the final step to show error
      setTransactionError(msg);
    } finally {
      setIsSearchingAccount(false);
    }
  };


  const handleNext = () => {
    setCurrentStep((prev) => {
      const nextStep = Math.min(prev + 1, steps.length);
      setMaxStepReached((max) => Math.max(max, nextStep));
      return nextStep;
    });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (currentStep >= 4) {
      toast.error("You cannot modify previous steps while in review or receipt.", { id: 'step-locked-toast' });
      return;
    }
    if (stepId <= maxStepReached) {
      setCurrentStep(stepId);
    }
  };

  const handlePatientInfoNext = async (currentPatientInfo: PatientInfo) => {
    setIsSearchingAccount(true);
    clearError();

    // Update state for persistence, but use passed currentPatientInfo for immediate logic
    updatePaymentData({ patientInfo: currentPatientInfo });

    if (paymentData.paymentMethod === 'full') {
      setIsSearchingAccount(false);
      toast("Pay in Full selected. Skipping Alphaeon validation.", { icon: 'ℹ️' });
      handleNext();
      return;
    }

    if (!currentPatientInfo.ssn) {
      const msg = "SSN is required to look up your Alphaeon account.";
      setAlphaeonError(msg);
      toast.error(msg);
      setIsSearchingAccount(false);
      return;
    }

    // Lookup Account
    try {
      console.log('🔍 Looking up Alphaeon account...');
      // Use service method
      const accounts = await alphaeonApi.lookupAccount({
        ssn: currentPatientInfo.ssn,
        zip: currentPatientInfo.address.zipCode,
        location_id: locationId
      });

      if (accounts && accounts.length > 0) {
        console.log("🔍 Account lookup result:", accounts[0]);
        const acc = accounts[0];

        // Enforce derogatory_ind per integration guide
        if (acc.derogatory_ind && acc.derogatory_ind === 'Y') {
          console.warn('⚠️ Account is derogatory and cannot be transacted on.');
          const msg = 'This Alphaeon account is not in good standing and cannot be used for financing. Please choose another payment method.';
          setAlphaeonError(msg);
          toast.error(msg);
          return;
        }

        // Validate Account Status
        if (acc.status && acc.status.toLowerCase() !== 'active') {
          console.warn(`⚠️ Account found but status is ${acc.status}`);
          const msg = `This account is currently ${acc.status}. Please use a different payment method or contact Alphaeon support.`;
          setAlphaeonError(msg);
          toast.error(msg);
          return;
        }

        updatePaymentData({
          accountNumber: acc.alphaeon_account_number,
          consumerCreditInstrumentId: acc.consumer_credit_instrument_id, // Store for transaction
          accountMemberId: acc.account_member_id, // Store for transaction
          alphaeonAccountIdentifier: acc.alphaeon_account_identifier, // Needed for signing link delivery
          creditLimit: acc.credit_limit,
          availableCredit: acc.available_credit_limit,
          patientInfo: {
            ...currentPatientInfo,
            firstName: (acc.name?.first_name || acc.first_name || acc.firstName || '').trim(),
            lastName: (acc.name?.last_name || acc.last_name || acc.lastName || '').trim(),
            email: acc.email || acc.contact_email,
            phone: acc.phone || acc.mobile_phone || acc.primary_phone,
          }
        });
        toast.success(`Alphaeon account is ${acc.status || 'Active'} and ready!`);

        if (acc.alphaeon_account_number) {
          // Explicitly and unconditionally show the toast requested by the user
          toast.success(`Account number (${acc.alphaeon_account_number}) automatically copied to clipboard!`, {
            duration: 5000,
          });

          // Attempt copy, ignoring strict errors about user gestures which happen due to the async fetch
          try {
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(acc.alphaeon_account_number).catch(() => {
                // Ignore fallback error
              });
            } else {
              const textArea = document.createElement("textarea");
              textArea.value = acc.alphaeon_account_number;
              textArea.style.position = "fixed";
              textArea.style.left = "-999999px";
              textArea.style.top = "-999999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              textArea.remove();
            }
          } catch (err) {
            console.error("Silent fallback copy failed:", err);
          }
        }

        const finalizedData = {
          ...paymentData,
          accountNumber: acc.alphaeon_account_number || acc.account_number || paymentData.accountNumber,
          consumerCreditInstrumentId: (acc.consumer_credit_instrument_id || paymentData.consumerCreditInstrumentId) ? String(acc.consumer_credit_instrument_id || paymentData.consumerCreditInstrumentId) : undefined,
          accountMemberId: (acc.account_member_id || paymentData.accountMemberId) ? String(acc.account_member_id || paymentData.accountMemberId) : undefined,
          alphaeonAccountIdentifier: acc.alphaeon_account_identifier || paymentData.alphaeonAccountIdentifier,
          creditLimit: acc.credit_limit || paymentData.creditLimit,
          available_credit_limit: acc.available_credit_limit || paymentData.available_credit_limit,
          availableCredit: acc.available_credit_limit || acc.available_credit || paymentData.availableCredit,
          patientInfo: {
            ...currentPatientInfo,
            firstName: (acc.name?.first_name || acc.first_name || acc.firstName || currentPatientInfo.firstName || '').trim(),
            lastName: (acc.name?.last_name || acc.last_name || acc.lastName || currentPatientInfo.lastName || '').trim(),
            email: acc.email || acc.contact_email || currentPatientInfo.email,
            phone: acc.phone || acc.mobile_phone || acc.primary_phone || currentPatientInfo.phone,
          }
        };

        // Update state and move to next step
        setPaymentData(finalizedData);
        setMaxStepReached(Math.max(maxStepReached, 3));
        setCurrentStep(3); // Plan Selection / Payment Details

        console.log('✅ Account ready. Moving to finalization step...');
      } else {
        console.log('ℹ️ No existing accounts found. Opening application iframe...');
        openIframeApplication(currentPatientInfo);
      }
    } catch (err) {
      console.error("Lookup failed or account error:", err);
      // Fallback: If lookup fails but we are in sandbox/demo, we might want to allow them to try applied iframe
      openIframeApplication(currentPatientInfo);
    } finally {
      setIsSearchingAccount(false);
    }
  };

  const openIframeApplication = (_info: PatientInfo) => {
    console.log("⚠️ Opening Alphaeon Application Iframe...");
    toast("Preparing secure application...", { icon: 'ℹ️' });

    const trackingGuid = `ADV_TRANS_${Date.now()}`;
    console.log("🚀 Opening Alphaeon iframe with tracking GUID:", trackingGuid);
    setIframeTrackingGuid(trackingGuid);
    setIframeApplicationStatus(null);
  };

  const reverifyAccount = async (ssn: string, zip: string, expectedAccountNumber?: string) => {
    try {
      console.log('🔍 Re-verifying account match for SSN:', ssn);
      const accounts = await alphaeonApi.lookupAccount({ ssn, zip, location_id: locationId });

      if (!accounts || accounts.length === 0) {
        throw new Error("No Alphaeon account found matching the SSN provided. Please ensure the information entered matches your application.");
      }

      const acc = accounts[0];

      if (expectedAccountNumber && acc.alphaeon_account_number !== expectedAccountNumber) {
        console.error("Mismatch detected!", { expected: expectedAccountNumber, found: acc.alphaeon_account_number });
        throw new Error("Account mismatch: The approved account does not match the SSN provided in our records. Please restart the process with consistent information.");
      }

      return acc;
    } catch (err: any) {
      console.error("Re-verification failed:", err);
      throw err;
    }
  };

  const handleCloseIframe = async () => {
    setIsSearchingAccount(true);
    try {
      const ssn = paymentData.patientInfo?.ssn;
      const zip = paymentData.patientInfo?.address?.zipCode;

      if (ssn && zip) {
        // Try one last lookup to see if they finished but closed manually
        const accounts = await alphaeonApi.lookupAccount({ ssn, zip, location_id: locationId });
        if (accounts && accounts.length > 0) {
          const acc = accounts[0];
          updatePaymentData({
            accountNumber: acc.alphaeon_account_number,
            consumerCreditInstrumentId: acc.consumer_credit_instrument_id ? String(acc.consumer_credit_instrument_id) : undefined,
            accountMemberId: acc.account_member_id ? String(acc.account_member_id) : undefined,
            alphaeonAccountIdentifier: acc.alphaeon_account_identifier,
            creditLimit: acc.credit_limit,
            available_credit_limit: acc.available_credit_limit,
            availableCredit: acc.available_credit_limit || acc.available_credit,
            patientInfo: {
              ...paymentData.patientInfo,
              firstName: (acc.name?.first_name || acc.first_name || acc.firstName || paymentData.patientInfo?.firstName || '').trim(),
              lastName: (acc.name?.last_name || acc.last_name || acc.lastName || paymentData.patientInfo?.lastName || '').trim(),
              email: acc.email || acc.contact_email || paymentData.patientInfo?.email,
              phone: acc.phone || acc.mobile_phone || acc.primary_phone || paymentData.patientInfo?.phone,
            }
          });
          toast.success("Account confirmed!");
          setCurrentStep(3);
          setMaxStepReached(m => Math.max(m, 3));
        } else {
          console.log("No account found on manual close.");
        }
      }
    } catch (e) {
      console.warn("Silent failure during manual close lookup:", e);
    } finally {
      setIsSearchingAccount(false);
      setIframeTrackingGuid(null);
    }
  };

  // Let's re-write `handlePatientInfoNext` to store IDs.

  if (isOrderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Initializing secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex items-center min-w-[600px] md:min-w-0 justify-between">
            {steps.map((step, index) => {
              const isLocked = currentStep >= 4;
              const isClickable = step.id <= maxStepReached && !isLocked;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <button
                        onClick={() => handleStepClick(step.id)}
                        disabled={!isClickable}
                        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all ${currentStep > step.id
                          ? 'bg-green-500 border-green-500 text-white'
                          : currentStep === step.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white border-gray-200 text-gray-400'
                          } ${isClickable
                            ? 'cursor-pointer hover:scale-110 active:scale-95'
                            : isLocked && currentStep > step.id
                              ? 'cursor-not-allowed opacity-100' // Keep full opacity for locked past steps
                              : 'cursor-not-allowed opacity-50'
                          }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          <span className="text-xs md:text-sm font-bold">{step.id}</span>
                        )}
                      </button>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 md:mx-4 rounded-full transition-colors duration-500 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={!isClickable}
                      className={`mt-3 text-[10px] md:text-sm font-bold tracking-tight uppercase ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                        } ${isClickable
                          ? 'cursor-pointer hover:text-blue-600'
                          : 'cursor-not-allowed'
                        }`}
                    >
                      {step.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <OrderSummary
              amount={orderAmount}
              paymentMethod={paymentData.paymentMethod as PaymentMethod}
              financePlan={paymentData.financePlan}
              selectedPlanObject={paymentData.selectedPlanObject}
              upfrontPayment={paymentData.upfrontPayment}
              accountData={paymentData.accountNumber ? {
                accountNumber: paymentData.accountNumber,
                creditLimit: paymentData.creditLimit,
                availableCredit: paymentData.availableCredit,
                firstName: paymentData.patientInfo?.firstName,
                lastName: paymentData.patientInfo?.lastName,
                ssn: paymentData.patientInfo?.ssn
              } : undefined}
              productName="Breast Augmentation"
              description="Consultation included"
              tax={orderData?.tax}
              shipping={orderData?.shipping}
            />
          </div>

          <div className="lg:col-span-2">
            {alphaeonError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {alphaeonError}
                  <button
                    onClick={clearError}
                    className="ml-2 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </AlertDescription>
              </Alert>
            )}


            {currentStep === 1 && (
              <PaymentMethodSelector
                paymentMethod={paymentData.paymentMethod}
                onPaymentMethodChange={(method) =>
                  updatePaymentData({ paymentMethod: method })
                }
                onNext={handleNext}
                orderAmount={orderAmount}
                availablePlans={availablePlans}
                isLoadingPlans={alphaeonLoading}
              />
            )}

            {currentStep === 2 && (
              <PatientInfoForm
                patientInfo={paymentData.patientInfo}
                isSubmitting={isSearchingAccount}
                onUpdate={(info) => updatePaymentData({ patientInfo: info })}
                onNext={handlePatientInfoNext}
                onBack={handleBack}
              />
            )}

            {/* Success Banner for Account Found/Created */}
            {paymentData.accountNumber && currentStep > 2 && currentStep < 5 && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">Alphaeon Account Active</span>
                    {/* <button 
                      onClick={() => setCurrentStep(2)}
                      className="p-1.5 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                      title="Edit Patient Info"
                    >
                      <Pencil className="w-4 h-4" />
                    </button> */}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Account Number</span>
                      <span className="font-mono font-bold text-base tracking-widest text-green-900 bg-white/50 px-3 py-1 rounded-md border border-green-200 inline-block w-fit">
                        {paymentData.accountNumber ? `${paymentData.accountNumber.slice(0, 4)}********${paymentData.accountNumber.slice(-4)}` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Cardholder Name</span>
                      <span className="font-bold text-base text-green-900 py-1 uppercase italic">
                        {paymentData.patientInfo?.firstName} {paymentData.patientInfo?.lastName}
                      </span>
                    </div>

                    <div className="flex flex-col md:mt-1">
                      <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Credit Limit</span>
                      <span className="font-bold text-base text-green-900">
                        ${paymentData?.available_credit_limit?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {paymentData.availableCredit !== undefined && (
                      <div className="flex flex-col md:mt-1">
                        <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Available Credit</span>
                        <span className="font-bold text-base text-green-900">
                          ${paymentData.availableCredit?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col md:mt-1">
                      <span className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">SSN (Linked)</span>
                      <span className="font-mono font-bold text-green-900">***-**-{paymentData.patientInfo?.ssn?.slice(-4) || 'N/A'}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}



            {currentStep === 3 && (
              <div className="space-y-6">
                {!!externalParams?.advitalTransactionId && (
                  <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                    <Check className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Advital upfront payment applied: ${Number(externalParams.advitalUpfrontAmount || 0).toFixed(2)}
                      {externalParams.advitalTransactionId ? ` (Txn: ${externalParams.advitalTransactionId})` : ''}
                    </AlertDescription>
                  </Alert>
                )}
                {paymentData.paymentMethod === 'finance' ? (
                  <>
                    <FinancePlanSelector
                      selectedPlanId={paymentData.selectedPlanObject?.id}
                      onPlanChange={(plan) =>
                        updatePaymentData({
                          financePlan: plan.name,
                          selectedPlanObject: plan
                        })
                      }
                      orderAmount={orderAmount}
                      upfrontPayment={paymentData.upfrontPayment}
                      onUpfrontPaymentChange={(amount) =>
                        updatePaymentData({ upfrontPayment: amount })
                      }
                      upfrontPaymentMethod={paymentData.upfrontPaymentMethod || 'card'}
                      onUpfrontPaymentMethodChange={(method) =>
                        updatePaymentData({ upfrontPaymentMethod: method })
                      }
                      availablePlans={availablePlans}
                      isLoading={alphaeonLoading}
                      isUpfrontLocked={isAdvitalUpfrontApplied || paymentData.advitalUpfrontPaid}
                    >
                      {/* Payment Summary for upfront portion */}
                      <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                          Summary
                        </label>
                        <PaymentSummary
                          amount={paymentData.upfrontPayment || 0}
                          paymentMethod={paymentData.upfrontPaymentMethod || 'card'}
                        />
                      </div>

                      {/* Upfront Payment Action */}
                      {!paymentData.advitalUpfrontPaid && (paymentData.upfrontPayment || 0) > 0 && (
                        <div className="mt-8">
                          <button
                            type="button"
                            onClick={handleFinalSubmit}
                            className="w-full bg-[#5c67ff] hover:bg-[#4a54e1] text-white font-black uppercase tracking-widest text-xs h-14 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center"
                          >
                            Proceed to Upfront Payment
                          </button>
                        </div>
                      )}

                      {paymentData.advitalUpfrontPaid && (
                        <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-bold text-green-800 uppercase tracking-tight">
                            Upfront Payment Completed Successfully
                          </p>
                        </div>
                      )}
                    </FinancePlanSelector>

                    {/* Shared Finance Action Buttons */}
                    <div className="flex gap-4 pt-8 justify-end">
                      <button
                        onClick={handleBack}
                        className="px-8 h-12 rounded-xl border-2 border-slate-200 font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleFinalSubmit}
                        disabled={
                          !paymentData.selectedPlanObject ||
                          isSearchingAccount ||
                          (orderAmount - (paymentData.upfrontPayment || 0) < 250) ||
                          ((paymentData.upfrontPayment || 0) > 0 && !paymentData.advitalUpfrontPaid)
                        }
                        className={`px-10 h-12 rounded-lg font-black transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${paymentData.selectedPlanObject &&
                          !isSearchingAccount &&
                          (orderAmount - (paymentData.upfrontPayment || 0) >= 250) &&
                          !((paymentData.upfrontPayment || 0) > 0 && !paymentData.advitalUpfrontPaid)
                          ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        {isSearchingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Sale
                      </button>
                    </div>
                  </>
                ) : (
                  // If 'full' payment method, show the standalone form
                  <PaymentDetailsForm
                    paymentData={paymentData}
                    onUpdate={updatePaymentData}
                    onNext={handleFinalSubmit}
                    onBack={handleBack}
                  />
                )}
              </div>
            )}

            {currentStep === 4 && !transactionError && (
              <SuccessStep
                paymentData={paymentData}
                updatePaymentData={updatePaymentData}
                productName={orderData?.productName}
                onComplete={() => {
                  setCurrentStep(5);
                  setMaxStepReached(m => Math.max(m, 5));
                }}
              />
            )}



            {currentStep === 5 && (
              <ReceiptStep
                paymentData={paymentData}
                orderAmount={orderAmount}
                onBack={() => setCurrentStep(4)}
              />
            )}

            {(currentStep === 4 || currentStep === 5 || currentStep === 6) && transactionError && (
              <FailedStep
                onRetry={() => {
                  setTransactionError(null);
                  setCurrentStep(1);
                  setMaxStepReached(1);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Alphaeon Iframe Modal */}
      {iframeTrackingGuid && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-0 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:max-w-5xl md:h-[85vh] flex flex-col relative overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <Check className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">Alphaeon Application</h2>
                  <p className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest">Secure Portal</p>
                </div>
              </div>
              <button
                onClick={handleCloseIframe}
                className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
                title="Close"
              >
                <AlertCircle className="w-6 h-6 text-slate-400 rotate-45" />
              </button>
            </div>

            {/* Iframe Body */}
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <AlphaeonIframeHost
                partnerTrackingGuid={iframeTrackingGuid}
                patientInfo={paymentData.patientInfo}
                onApplicationCreated={(payload) => {
                  console.log("📥 application_created:", payload);
                }}
                onPrequalification={(payload) => {
                  console.log("📥 prequalification:", payload);
                  if (payload.status) setIframeApplicationStatus(payload.status);
                  if (payload.status === 'not_prequalified') {
                    toast.error('You were not prequalified for financing. Please choose another payment method.');
                    // The iframe should not be auto closed. The Patient should initiate the closing of the iframe.
                    // setIframeTrackingGuid(null);
                  }
                }}
                onCreditDecision={async (payload) => {
                  console.log("📥 credit_decision:", payload);
                  if (payload.status) setIframeApplicationStatus(payload.status);

                  if (payload.status === 'approved') {
                    try {
                      setIsSearchingAccount(true);
                      // Security Check: Re-verify that the account returned matches the SSN in our input field
                      const localSSN = paymentData.patientInfo?.ssn;
                      const localZip = paymentData.patientInfo?.address?.zipCode;

                      if (localSSN && localZip) {
                        const verifiedAcc = await reverifyAccount(localSSN, localZip, payload.acct_number);

                        updatePaymentData({
                          accountMemberId: verifiedAcc.account_member_id ? String(verifiedAcc.account_member_id) : undefined,
                          consumerCreditInstrumentId: verifiedAcc.consumer_credit_instrument_id ? String(verifiedAcc.consumer_credit_instrument_id) : undefined,
                          accountNumber: verifiedAcc.alphaeon_account_number,
                          availableCredit: verifiedAcc.available_credit_limit || verifiedAcc.available_credit,
                          available_credit_limit: verifiedAcc.available_credit_limit,
                          creditLimit: verifiedAcc.credit_limit,
                          alphaeonAccountIdentifier: verifiedAcc.alphaeon_account_identifier,
                          patientInfo: {
                            ...paymentData.patientInfo,
                            firstName: (verifiedAcc.name?.first_name || verifiedAcc.first_name || verifiedAcc.firstName || paymentData.patientInfo?.firstName || '').trim(),
                            lastName: (verifiedAcc.name?.last_name || verifiedAcc.last_name || verifiedAcc.lastName || paymentData.patientInfo?.lastName || '').trim(),
                            email: verifiedAcc.email || verifiedAcc.contact_email || paymentData.patientInfo?.email,
                            phone: verifiedAcc.phone || verifiedAcc.mobile_phone || verifiedAcc.primary_phone || paymentData.patientInfo?.phone,
                          }
                        });
                      } else {
                        // Fallback if local data is missing (shouldn't happen)
                        updatePaymentData({
                          accountMemberId: payload.account_member ? String(payload.account_member) : undefined,
                          consumerCreditInstrumentId: payload.consumer_credit_instrument ? String(payload.consumer_credit_instrument) : undefined,
                          accountNumber: payload.acct_number,
                          availableCredit: payload.available_credit,
                        });
                      }

                      toast.success('Credit approved! Information verified.');
                      setIframeTrackingGuid(null);
                      setCurrentStep(3);
                      setMaxStepReached((max) => Math.max(max, 3));
                    } catch (err: any) {
                      setAlphaeonError(err.message || "Account verification failed.");
                      toast.error(err.message || "Account verification failed.");
                      setIframeTrackingGuid(null);
                    } finally {
                      setIsSearchingAccount(false);
                    }
                  } else if (payload.status === 'pending_step_up') {
                    console.log("🔒 Identity verification step-up required!");
                    toast('Additional identity verification required...', { icon: '🔒' });
                    // If Alphaeon provides a Plaid IDV URL, we would set it here
                    if (payload.verification_url) {
                      setPlaidVerificationUrl(payload.verification_url);
                      setIframeTrackingGuid(null);
                    }
                  } else if (payload.status === 'declined') {
                    toast.error('Your credit application was declined. Please choose another payment method.');
                    // The iframe should not be auto closed. The Patient should initiate the closing of the iframe.
                    // setIframeTrackingGuid(null);
                  }
                }}
                onReceiptSigned={(payload) => {
                  console.log("📥 receipt_signed:", payload);
                  updatePaymentData({
                    isSignaturePending: false,
                  });
                  toast.success('Receipt signed successfully. Your financing is complete.');
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-4 md:px-6 py-4 border-t bg-white flex flex-col md:flex-row items-center gap-4 md:justify-between">
              <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                Secure Connection Active
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={handleCloseIframe}
                  className="flex-1 md:flex-none px-6 py-3 md:py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {['not_prequalified', 'declined', 'pending_step_up', 'pended'].includes(iframeApplicationStatus || '') ? 'Close' : 'Cancel'}
                </button>
                {/* <button
                  onClick={() => {
                    if (paymentData.patientInfo) {
                      handlePatientInfoNext(paymentData.patientInfo);
                    }
                    setIframeTrackingGuid(null);
                  }}
                  className="flex-[2] md:flex-none px-8 py-3 md:py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Finished Applying
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plaid Verification Modal/Overlay */}
      {plaidVerificationUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Identity Verification</h3>
                  <p className="text-xs text-slate-500 font-medium">Powered by Plaid</p>
                </div>
              </div>
              <button
                onClick={() => setPlaidVerificationUrl(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Iframe Body */}
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <PlaidIframeHost
                idvSessionUrl={plaidVerificationUrl}
                onSuccess={(payload) => {
                  console.log("📥 Plaid IDV Success:", payload);
                  toast.success("Identity verified successfully!");
                  setPlaidVerificationUrl(null);
                  // If we were waiting for verification to continue Alphaeon, trigger next step
                  setCurrentStep((prev) => Math.max(prev, 4));
                }}
                onExit={(error) => {
                  if (error) {
                    console.error("📥 Plaid IDV Exit with error:", error);
                    toast.error("Verification failed. Please try again or use another method.");
                  }
                  setPlaidVerificationUrl(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showAdvitalUpfrontIframe && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-0 md:p-6">
          <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:max-w-4xl md:h-[85vh] flex flex-col relative overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-white">
              <h2 className="text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight">Complete Upfront Payment</h2>
              <button
                onClick={() => setShowAdvitalUpfrontIframe(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                title="Close"
              >
                <AlertCircle className="w-6 h-6 text-slate-400 rotate-45" />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 relative overflow-hidden">
              <iframe
                src={`${advitalPortalBaseUrl}/finance-payment-portal?amount=${paymentData.upfrontPayment || 0}&locationId=${advitalLocationId}&contactId=${externalParams?.contactId || 'contact_demo'}&publishableKey=${advitalPublishableKey}`}
                className="w-full h-full border-0"
                title="Advital Upfront Payment"
              />
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
