import { CheckCircle, ArrowRight, Printer } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { PaymentData } from './PaymentWorkflow';

interface CongratulationsStepProps {
  paymentData: PaymentData;
  orderAmount: number;
  onClose: () => void;
  onViewReceipt: () => void;
}

export function CongratulationsStep({ paymentData, orderAmount, onClose, onViewReceipt }: CongratulationsStepProps) {
  return (
    <div className="min-h-[600px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-2xl p-12 text-center border-none shadow-2xl bg-white/90 backdrop-blur-xl relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic">
            Congratulations!
          </h1>
          
          <p className="text-lg font-bold text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
            Your payment has been successfully processed
          </p>

          <div className="bg-slate-50 rounded-3xl p-8 mb-12 border border-slate-100 text-left">
             <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Summary</span>
                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">Approved</span>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-600">Total Amount</span>
                   <span className="text-xl font-black text-slate-900">
                     ${orderAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                   </span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-600">Payment Method</span>
                   <span className="text-sm font-black text-blue-600 uppercase">
                     {paymentData.paymentMethod === 'finance' ? 'Alphaeon Financing' : 'Credit Card'}
                   </span>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onViewReceipt}
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              View Receipt
            </Button>
            
            <Button 
              onClick={onClose}
              className="flex-[1.5] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              Finish & Close
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            A confirmation email has been sent to {paymentData.patientInfo?.email}
          </p> */}
        </div>
      </Card>
    </div>
  );
}
