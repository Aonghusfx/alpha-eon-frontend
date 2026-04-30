import React, { useState } from 'react';
import { CheckCircle, Ban, Check, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { PaymentData } from './PaymentWorkflow';
import { alphaeonApi } from '../../services/alphaeonApi';
import toast from 'react-hot-toast';

import { AlphaeonIframeHost, type AlphaeonPortalEvent } from './AlphaeonIframeHost';
import { PlaidIframeHost } from './PlaidIframeHost';

interface SuccessStepProps {
  paymentData: PaymentData;
  updatePaymentData: (newData: Partial<PaymentData>) => void;
  productName?: string;
  onComplete: () => void;
}

export function SuccessStep({ paymentData, updatePaymentData, onComplete }: SuccessStepProps) {
  const [plaidUrl, setPlaidUrl] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [canCloseSignatureModal, setCanCloseSignatureModal] = useState(false);

  const signingFlowLooksFailed = (e: AlphaeonPortalEvent): boolean => {
    const et = (e.eventType || '').toLowerCase();
    if (
      /(fail|error|declin|reject|abort|cancel|unverif|unable|not_approv|denied|blocked)/.test(et) &&
      !/not_failed|no_error/.test(et)
    ) {
      return true;
    }
    const p = e.payload;
    if (p && typeof p === 'object') {
      const o = p as Record<string, unknown>;
      const status = String(o.status ?? '').toLowerCase();
      if (['failed', 'error', 'declined', 'canceled', 'rejected', 'aborted', 'denied'].some((s) => status.includes(s))) {
        return true;
      }
    }
    const blob = (() => {
      try {
        return JSON.stringify(e.payload).toLowerCase();
      } catch {
        return '';
      }
    })();
    if (/(unable to verify|verification failed|did not verify|not approve|identity could not|retry verification)/.test(blob)) {
      return true;
    }
    return false;
  };

  // POLLING FALLBACK: If signature is pending, check transaction status periodically
  React.useEffect(() => {
    let pollInterval: any;

    if (paymentData.isSignaturePending && paymentData.transactionId) {
      console.log("⏱ Starting polling for signature status...");
      const txnId: string | number = paymentData.transactionId; // Guaranteed by if condition

      pollInterval = setInterval(async () => {
        try {
          console.log("🔄 Background polling for signature: ", txnId);
          const details = await alphaeonApi.getTransactionV2(String(txnId));

          if (details.status === 'signed' || details.status === 'completed' || details.status === 'funded') {
            console.log("✨ Background poll CONFIRMED signature!", details.status);
            updatePaymentData({
              transactionId: details.transaction_id || paymentData.transactionId
            });
            setIsSigned(true);
            toast.success("Signature confirmed!");
            // The iframe should not be auto closed. The Patient should initiate the closing.
            // onComplete(); // Move to next step
            clearInterval(pollInterval);
          }
        } catch (e) {
          console.warn("Signature polling error (silent):", e);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (pollInterval) {
        console.log("🛑 Stopping signature polling.");
        clearInterval(pollInterval);
      }
    };
  }, [paymentData.isSignaturePending, paymentData.transactionId, updatePaymentData]);

  const closeSignatureModal = () => {
    updatePaymentData({ isSignaturePending: false });
    setCanCloseSignatureModal(false);
    toast('Signature window closed. You can return if your care team sends a new signing link.');
  };

  const orderNumber = React.useMemo(() => {
    return paymentData.transactionId || paymentData.cardAuthId || `ORD-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }, [paymentData.transactionId, paymentData.cardAuthId]);
  const confirmationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });




  return (
    <div className="space-y-6">
      <Card className="p-8 text-center print:shadow-none print:border-none">
        <div className="flex justify-center mb-6 print:hidden">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl mb-2">
          {paymentData.isSignaturePending
            ? "Action Required: Sign Your Receipt"
            : (paymentData.paymentMethod === 'finance' ? "Signature Complete!" : "Payment Successful!")
          }
        </h2>
        <p className="text-gray-600 mb-6 print:hidden">
          {paymentData.isSignaturePending
            ? "Please complete the secure signature below to finalize your financing."
            : (paymentData.paymentMethod === 'finance'
              ? "Thank you. Your signature has been recorded. Moving to final receipt..."
              : "Thank you for your purchase. Your order has been confirmed.")
          }
        </p>

        {paymentData.paymentMethod === 'full' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg print:bg-white print:border">
            <p className="text-sm text-gray-600 mb-1">Order Ref / Authorization Number</p>
            <p className="text-xl font-bold break-all px-2">{orderNumber}</p>
            <p className="text-sm text-gray-500 mt-1">{confirmationDate}</p>
          </div>
        )}

        {paymentData.isSignaturePending && paymentData.signatureLink && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-0 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:max-w-5xl md:h-[85vh] flex flex-col relative overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-white shadow-sm z-10 gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                    <Check className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">Review & Sign</h2>
                    <p className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest">Digital Receipt Signature</p>
                  </div>
                </div>
                {canCloseSignatureModal && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-slate-500 hover:text-slate-900"
                    onClick={closeSignatureModal}
                    aria-label="Close signature window"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Iframe Body */}
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                <AlphaeonIframeHost
                  overrideUrl={paymentData.signatureLink}
                  partnerTrackingGuid={`ADV_SIGN_${paymentData.transactionId}`}
                  onAnyAlphaeonEvent={(e) => {
                    if (signingFlowLooksFailed(e)) {
                      setCanCloseSignatureModal(true);
                    }
                  }}
                  onReceiptSigned={(payload) => {
                    console.log("📥 Receipt signed via iframe:", payload);
                    updatePaymentData({
                      transactionId: payload.transaction_id || paymentData.transactionId
                    });
                    setIsSigned(true);
                    toast.success('Receipt signed successfully!');
                    // The iframe should not be auto closed. The Patient should initiate the closing.
                    // onComplete(); // Move to next step
                  }}
                />
              </div>

              {/* Footer */}
              <div className="px-4 md:px-6 py-4 border-t bg-white flex flex-col md:flex-row items-center gap-4 md:justify-between">
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                  Secure Encryption Active
                </div>
                <div className="flex w-full md:w-auto gap-3 items-center flex-wrap justify-center md:justify-end">
                  {!isSigned ? (
                    <>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase text-center md:text-right">
                        Please sign above to finalize your payment
                      </div>
                      {!canCloseSignatureModal && (
                        <button
                          type="button"
                          className="text-[10px] md:text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-800"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Use this only if signing failed or you cannot keep going. Close this window? You may need a new signing link to finish later.'
                              )
                            ) {
                              closeSignatureModal();
                            }
                          }}
                        >
                          {`Can't continue?`}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        updatePaymentData({ isSignaturePending: false });
                        onComplete();
                      }}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 animate-in zoom-in-95 duration-300"
                    >
                      Finish & View Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!paymentData.isSignaturePending && (
          <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200" onClick={onComplete}>
            Continue
          </Button>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg mb-4">What's Next?</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-blue-600">1</span>
            </div>
            <div>
              <p className="text-sm mb-1">Order Confirmation</p>
              <p className="text-xs text-gray-600">
                You'll receive an email confirmation shortly with your order details.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-blue-600">2</span>
            </div>
            <div>
              <p className="text-sm mb-1">Consultation Scheduling</p>
              <p className="text-xs text-gray-600">
                Our team will contact you within 1-2 business days to schedule your pre-op consultation.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-blue-600">3</span>
            </div>
            <div>
              <p className="text-sm mb-1">Pre-Operative Preparation</p>
              <p className="text-xs text-gray-600">
                You'll receive detailed instructions on how to prepare for your procedure.
              </p>
            </div>
          </div>
          {paymentData.paymentMethod === 'finance' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-blue-600">4</span>
              </div>
              <div>
                <p className="text-sm mb-1">Payment Reminders</p>
                <p className="text-xs text-gray-600">
                  We'll send you email reminders before each monthly payment is due.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Plaid Verification Overlay */}
      {plaidUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">Identity Verification</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase">Fallback</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPlaidUrl(null)}>
                <Ban className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1">
              <PlaidIframeHost
                idvSessionUrl={plaidUrl}
                onSuccess={() => {
                  toast.success("Identity verified! Returning to sign document.");
                  setPlaidUrl(null);
                }}
                onExit={() => setPlaidUrl(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
