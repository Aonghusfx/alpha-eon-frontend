import React from 'react';
import { CheckCircle, RotateCcw, Ban } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { PaymentData } from './PaymentWorkflow';
import { alphaeonApi } from '../../services/alphaeonApi';
import toast from 'react-hot-toast';

interface ReceiptStepProps {
  paymentData: PaymentData;
  orderAmount: number;
  onBack?: () => void;
}

export function ReceiptStep({ paymentData, orderAmount, onBack }: ReceiptStepProps) {
  const [isTxnActionLoading, setIsTxnActionLoading] = React.useState(false);
  
  const total = orderAmount;
  const upfrontAmount = paymentData.upfrontPayment || 0;
  const remainingAmount = total - upfrontAmount;

  const orderNumber = React.useMemo(() => {
    return paymentData.transactionId || paymentData.cardAuthId || `ORD-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }, [paymentData.transactionId, paymentData.cardAuthId]);

  const confirmationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleVoid = async () => {
    if (!paymentData.transactionId) return;
    try {
      setIsTxnActionLoading(true);
      toast.loading('Voiding transaction...', { id: 'void-txn' });
      const res = await alphaeonApi.voidTransaction(String(paymentData.transactionId));
      toast.success('Transaction voided (if eligible).', { id: 'void-txn' });
      console.log('Void response:', res);
    } catch (err) {
      console.error('Void failed:', err);
      toast.error(err instanceof Error ? err.message : 'Void failed', { id: 'void-txn' });
    } finally {
      setIsTxnActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!paymentData.transactionId) return;
    const rawAmount = window.prompt('Refund amount (e.g. 100.00):', remainingAmount.toFixed(2));
    if (!rawAmount) return;
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Invalid refund amount');
      return;
    }

    try {
      setIsTxnActionLoading(true);
      toast.loading('Refunding transaction...', { id: 'refund-txn' });
      const res = await alphaeonApi.refundTransaction(
        String(paymentData.transactionId),
        amount,
        paymentData.accountMemberId || ''
      );
      toast.success('Refund submitted (if eligible).', { id: 'refund-txn' });
      console.log('Refund response:', res);
    } catch (err) {
      console.error('Refund failed:', err);
      toast.error(err instanceof Error ? err.message : 'Refund failed', { id: 'refund-txn' });
    } finally {
      setIsTxnActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 text-center print:shadow-none print:border-none overflow-hidden relative">
        {/* <div className="flex justify-center mb-6 print:hidden">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce-subtle">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div> */}

        {/* <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          Payment Complete
        </h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto print:hidden">
          Thank you for your purchase. Your payment has been processed and your order is now being prepared.
        </p> */}

        {/* The Receipt as shown in the user's image */}
        {paymentData.paymentMethod === 'finance' ? (
          <div className="mb-8 p-6 bg-[#ebf5ff] rounded-2xl border border-[#d6eaff] shadow-sm text-left relative overflow-hidden group">
            {/* <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Printer className="w-12 h-12 text-blue-900" />
            </div> */}
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-blue-200 shadow-sm">
                 <div className="w-3 h-3 bg-blue-600 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <svg width="30  " height="30  " viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M55 0C60.8397 0 66.4666 0.910576 71.7471 2.59668C69.3893 2.20592 66.9686 2 64.5 2C40.1995 2 20.5 21.6995 20.5 46C20.5 70.3005 40.1995 90 64.5 90C88.8005 90 108.5 70.3005 108.5 46C108.5 44.3414 108.404 42.7047 108.226 41.0938C109.383 45.5356 110 50.1957 110 55C110 85.3757 85.3757 110 55 110C24.6243 110 0 85.3757 0 55C0 24.6243 24.6243 0 55 0Z" fill="#D22F27"></path><path d="M68.1055 82.4183C64.0864 82.6131 60.1834 82.1732 56.4924 81.1901C58.1259 81.3794 59.7963 81.4396 61.4927 81.3574C78.2362 80.5456 91.1516 66.3142 90.3399 49.5706C89.5281 32.8271 75.2967 19.9118 58.5531 20.7235C41.8097 21.5353 28.8943 35.7667 29.706 52.5102C29.7613 53.6511 29.8824 54.7738 30.0588 55.876C29.1141 52.8558 28.5328 49.6678 28.3724 46.3596C27.3577 25.4301 43.5017 7.6411 64.4311 6.62643C85.3605 5.61185 103.15 21.7558 104.164 42.6851C105.179 63.6144 89.0348 81.4035 68.1055 82.4183Z" fill="#F37D21"></path><path d="M57.2971 26.3127C59.821 26.0674 62.2911 26.2247 64.6444 26.7308C63.6104 26.6615 62.557 26.6747 61.4916 26.7782C50.9775 27.8001 43.2828 37.1525 44.3047 47.6667C45.3267 58.1807 54.6781 65.8756 65.1922 64.8537C75.7062 63.8318 83.4009 54.4802 82.3792 43.9662C82.3096 43.2497 82.1993 42.5464 82.0546 41.8579C82.7415 43.7302 83.205 45.7194 83.4069 47.7969C84.6841 60.9395 75.0653 72.6294 61.9227 73.9068C48.7801 75.184 37.0903 65.5651 35.8128 52.4225C34.5355 39.2799 44.1544 27.59 57.2971 26.3127Z" fill="#793694"></path><path d="M66.6864 59.8558C65.1102 60.0865 63.5555 60.0626 62.0636 59.8159C62.7156 59.8283 63.3773 59.7884 64.0439 59.6909C70.6013 58.7312 75.1393 52.6372 74.1796 46.0796C73.2198 39.522 67.1257 34.9842 60.5683 35.9439C54.011 36.9037 49.4728 42.9976 50.4326 49.5552C50.4981 50.003 50.5889 50.4412 50.7009 50.8691C50.2131 49.716 49.8621 48.4828 49.6723 47.1862C48.4726 38.9892 54.1452 31.3718 62.3419 30.1721C70.5387 28.9724 78.1564 34.6447 79.3561 42.8417C80.5558 51.0387 74.8832 58.6562 66.6864 59.8558Z" fill="#9AAF3B"></path></svg>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Receipt with Alphaeon</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
              <div className="space-y-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Responsible Party</span>
                  <span className="text-[15px] font-bold text-slate-700">{paymentData.patientInfo?.firstName} {paymentData.patientInfo?.lastName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Transaction ID</span>
                  <span className="text-[15px] font-bold text-slate-700">{paymentData.transactionId || '3475'} (Sale)</span>
                </div>
                {/* <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Location</span>
                  <span className="text-[15px] font-bold text-slate-700">Sono Bello-Atlanta</span>
                </div> */}
              </div>

              <div className="space-y-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Account Number</span>
                  <span className="text-[15px] font-bold text-slate-700 tracking-wider">************{paymentData.accountNumber?.slice(-4) || '5555'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Amount Financed</span>
                  <span className="text-[18px] font-black text-blue-900">${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5">Authorization Code</span>
                  <span className="text-[15px] font-bold text-slate-700">{(paymentData.transactionId?.toString()?.slice(-4)) || '3437'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-blue-100 flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Confirmation Date</span>
                  <span className="text-xs font-medium text-slate-500">{confirmationDate}</span>
               </div>
               {/* <div className="flex gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-blue-600" title="Print Receipt">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-blue-600" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
               </div> */}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm text-left">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight uppercase">Order Summary</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference Number</div>
                <div className="text-slate-900 font-bold text-right font-mono">{orderNumber}</div>
                
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Cardholder</div>
                <div className="text-slate-900 font-bold text-right">{paymentData.cardName || 'N/A'}</div>
                
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Paid</div>
                <div className="text-slate-900 font-black text-right text-lg">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Date</div>
                <div className="text-slate-900 font-bold text-right">{confirmationDate}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {onBack && (
            <Button 
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95"
              onClick={onBack}
            >
              Back to Success
            </Button>
          )}
          <Button 
            className="flex-[1.5] h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 transition-all active:scale-95"
            onClick={() => window.location.reload()}
          >
            Finish & Reload
          </Button>
        </div>
      </Card>

      {/* <Card className="p-8 border-dashed bg-transparent border-2 border-slate-200 shadow-none">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xs font-black text-blue-600">01</span>
            </div>
            <p className="text-xs font-black text-slate-900 uppercase mb-2">Confirmation</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Email confirmation sent to your inbox shortly.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xs font-black text-blue-600">02</span>
            </div>
            <p className="text-xs font-black text-slate-900 uppercase mb-2">Scheduling</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Our team will call you within 24-48 hours.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xs font-black text-blue-600">03</span>
            </div>
            <p className="text-xs font-black text-slate-900 uppercase mb-2">Preparation</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">Prepare for your pre-op consultation.</p>
          </div>
        </div>
      </Card> */}
      
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
