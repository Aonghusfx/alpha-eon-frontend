import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type AdvitalMessage =
  | {
      type: 'advital_payment_success';
      data: {
        upfrontAmount?: number;
        totalAmount?: number;
        remainingBalance?: number;
        chargeId?: string;
        transactionId?: string;
        customerVaultId?: string;
        timestamp?: number;
      };
    }
  | { type: 'advital_payment_error'; error?: string }
  | {
      type: 'advital_payment_skipped';
      data: { upfrontAmount?: number; totalAmount?: number; remainingBalance?: number };
    };

type PortalParams = {
  amount: number;
  locationId: string;
  contactId: string;
  publishableKey?: string;
};

type PaymentResult = {
  upfrontAmount: number;
  totalAmount: number;
  remainingBalance: number;
  chargeId?: string;
  transactionId?: string;
  customerVaultId?: string;
};

const DEFAULT_ORIGIN = 'https://adv-dev.vercel.app';
const allowedOrigin = import.meta.env.VITE_ADVITAL_ALLOWED_ORIGIN || DEFAULT_ORIGIN;
const portalBaseUrl = import.meta.env.VITE_ADVITAL_PORTAL_BASE_URL || DEFAULT_ORIGIN;

function getParams(): PortalParams | null {
  const query = new URLSearchParams(window.location.search);
  const amount = Number(query.get('amount') || 0);
  
  const locationId = import.meta.env.VITE_ADVITAL_LOCATION_ID || '';
  const contactId = import.meta.env.VITE_ADVITAL_CONTACT_ID || '';
  const publishableKey = import.meta.env.VITE_ADVITAL_PUBLISHABLE_KEY || '';

  if (!Number.isFinite(amount) || amount <= 0 || !locationId || !contactId) {
    return null;
  }

  return { amount, locationId, contactId, publishableKey };
}



export function AdvitalPaymentPortal() {
  const [showIframe, setShowIframe] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const params = useMemo(() => getParams(), []);

  const iframeUrl = useMemo(() => {
    if (!params) return '';
    const q = new URLSearchParams({
      amount: String(params.amount),
      locationId: params.locationId,
      contactId: params.contactId,
    });
    if (params.publishableKey) {
      q.set('publishableKey', params.publishableKey);
    }
    return `${portalBaseUrl}/finance-payment-portal?${q.toString()}`;
  }, [params]);



  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      console.log('📬 Message received in AdvitalPaymentPortal:', {
        origin: event.origin,
        allowedOrigin: allowedOrigin,
        data: event.data
      });
      if (event.origin !== allowedOrigin) return;
      
      const message = event.data as AdvitalMessage;
      if (!message || typeof message !== 'object' || !('type' in message)) return;

      if (message.type === 'advital_payment_success') {
        console.log('✅ Advital Payment Success:', message.data);
        const payment = message.data || {};
        const normalized: PaymentResult = {
          upfrontAmount: Number(payment.upfrontAmount || 0),
          totalAmount: Number(payment.totalAmount || params?.amount || 0),
          remainingBalance: Number(
            payment.remainingBalance ??
              Number(payment.totalAmount || params?.amount || 0) - Number(payment.upfrontAmount || 0)
          ),
          chargeId: payment.chargeId,
          transactionId: payment.transactionId,
          customerVaultId: payment.customerVaultId,
        };
        setResult(normalized);
        setShowIframe(false);
        setIsCompleted(true);
        toast.success('Upfront payment received successfully.');
      } else if (message.type === 'advital_payment_error') {
        console.error('❌ Advital Payment Error:', message.error);
        const errorMessage = message.error || 'Payment failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (message.type === 'advital_payment_skipped') {
        console.log('ℹ️ Advital Payment Skipped:', message.data);
        const payment = message.data || {};
        const normalized: PaymentResult = {
          upfrontAmount: Number(payment.upfrontAmount || 0),
          totalAmount: Number(payment.totalAmount || params?.amount || 0),
          remainingBalance: Number(payment.remainingBalance || params?.amount || 0),
        };
        setResult(normalized);
        setShowIframe(false);
        setIsCompleted(true);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [params]);


  const continueToFinancing = () => {
    if (!params || !result) return;
    const query = new URLSearchParams({
      amount: String(result.remainingBalance),
      autoStartFinance: '1',
      contactId: params.contactId,
      locationId: params.locationId,
      advitalUpfrontAmount: String(result.upfrontAmount),
      advitalTransactionId: result.chargeId || result.transactionId || '',
    });
    window.location.href = `/?${query.toString()}`;
  };

  const handleSkip = async () => {
    if (!params) return;
    const skipped: PaymentResult = {
      upfrontAmount: 0,
      totalAmount: params.amount,
      remainingBalance: params.amount,
    };
    setResult(skipped);
    setIsCompleted(true);
  };

  if (!params) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-bold mb-3">Invalid payment link</h1>
          <p className="text-gray-600">
            This page requires valid `amount`, `locationId`, and `contactId` query parameters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Alphaeon Financing Application</h1>

      {!showIframe && !isCompleted && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upfront Payment (Optional)</h2>
          <p className="mb-4">
            Total Amount: <strong>${params.amount.toFixed(2)}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Would you like to make an upfront payment to reduce your financing amount?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowIframe(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Yes, Pay Upfront Deposit
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              No, Finance Full Amount
            </button>
          </div>
        </div>
      )}

      {showIframe && !isCompleted && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Make Upfront Payment</h2>
          <p className="text-sm text-gray-600 mb-4">Complete the payment below. You can adjust the amount.</p>
          <iframe
            src={iframeUrl}
            width="100%"
            height="800px"
            style={{ border: '1px solid #ddd', borderRadius: '8px' }}
            title="Advital Payment Form"
          />
          {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
        </div>
      )}

      {isCompleted && result && (
        <div className="bg-green-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">Ready to Continue</h2>
          {result.upfrontAmount > 0 ? (
            <div className="mb-4">
              <p className="text-green-800">
                Upfront Payment: <strong>${result.upfrontAmount.toFixed(2)}</strong>
              </p>
              <p className="text-green-800">
                Amount to Finance: <strong>${result.remainingBalance.toFixed(2)}</strong>
              </p>
              {result.chargeId && (
                <p className="text-sm text-gray-600 mt-2">Transaction ID: {result.chargeId}</p>
              )}
            </div>
          ) : (
            <p className="text-green-800 mb-4">
              Financing Full Amount: <strong>${result.totalAmount.toFixed(2)}</strong>
            </p>
          )}
          <button
            onClick={continueToFinancing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue to Financing Application
          </button>
        </div>
      )}
    </div>
  );
}
