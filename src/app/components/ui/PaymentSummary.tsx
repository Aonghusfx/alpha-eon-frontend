import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface PaymentSummaryProps {
  amount: number;
  paymentMethod: string;
  feeRate?: number;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  amount,
  paymentMethod,
  feeRate = 0.0399
}) => {
  const processingFee = amount * feeRate;
  const totalWithFee = amount + processingFee;

  const renderDetails = () => {
    if (paymentMethod === 'card') {
      return (
        <div className="bg-[#f0f7ff] p-4 rounded-b-lg border-t border-gray-100">
          <div className="text-[10px] font-bold text-[#2b4c9b] uppercase tracking-wider mb-2">
            CREDIT CARD PROCESSING FEE:
          </div>
          <div className="space-y-1 text-sm text-[#2b4c9b]">
            <div className="flex justify-between">
              <span>Invoice Amount:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee ({(feeRate * 100).toFixed(2)}%):</span>
              <span>+ ${processingFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="h-[1px] bg-[#d0e4ff] my-3" />
          <div className="flex justify-between items-center text-[#1a365d] font-bold text-lg">
            <span>Total to Charge:</span>
            <span>${totalWithFee.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#2b4c9b] italic">
            <Lightbulb size={12} className="text-yellow-400 fill-yellow-400" />
            <span>Tip: Select "Bank Transfer" to avoid this fee</span>
          </div>
        </div>
      );
    } else if (paymentMethod === 'bank') {
      return (
        <div className="bg-[#f2faf5] p-4 rounded-b-lg border-t border-gray-100">
          <div className="flex items-center gap-2 text-[#2d6a4f] text-sm font-medium mb-3">
            <CheckCircle2 size={16} />
            <span>No processing fees for bank transfers</span>
          </div>
          <div className="flex justify-between items-center text-[#1b4332] font-bold text-lg">
            <span>Total to Charge:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-100">
          <div className="flex justify-between items-center text-gray-800 font-bold text-lg">
            <span>Financing Total:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Subject to Alphaeon credit approval.</p>
        </div>
      );
    }
  };

  if (paymentMethod === 'finance') return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white mb-6">
      <div className="p-3 flex justify-between items-center bg-white border-b border-gray-100">
        <span className="text-[20px] font-bold text-gray-800">Amount Due:</span>
        <span className="text-[20px] font-bold text-gray-800">
          ${amount.toFixed(2)}
        </span>
      </div>
      {renderDetails()}
    </div>
  );
};
