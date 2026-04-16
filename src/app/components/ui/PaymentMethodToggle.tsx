import React from 'react';
import FinanceIcon from "../../../assets/icons/finance_logo.png";

interface PaymentMethodToggleProps {
  paymentMethod: string;
  onMethodChange: (method: string) => void;
  showFinance?: boolean;
}

export const PaymentMethodToggle: React.FC<PaymentMethodToggleProps> = ({
  paymentMethod,
  onMethodChange,
  showFinance = true,
}) => {
  return (
    <div className={`grid grid-cols-1 ${showFinance ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200`}>
      {/* Card */}
      <button
        onClick={() => onMethodChange('card')}
        className={`flex flex-col items-center justify-center py-4 px-4 rounded-lg transition-all ${paymentMethod === 'card'
          ? 'bg-white text-gray-900 border border-gray-100 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <div className="text-2xl mb-2">💳</div>
        <div className="text-xs sm:text-sm font-bold">Credit /</div>
        <div className="text-xs sm:text-sm font-bold">Debit Card</div>
      </button>

      {/* Bank */}
      <button
        onClick={() => onMethodChange('bank')}
        className={`flex flex-col items-center justify-center py-4 px-4 rounded-lg transition-all ${paymentMethod === 'bank'
          ? 'bg-white text-gray-900 border border-gray-100 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <div className="text-2xl mb-2">🏦</div>
        <div className="text-xs sm:text-sm font-bold">Bank</div>
        <div className="text-xs sm:text-sm font-bold">Transfer</div>
      </button>

      {/* Finance */}
      {showFinance && (
        <button
          onClick={() => onMethodChange('finance')}
          className={`flex flex-col items-center justify-center py-4 px-4 rounded-lg transition-all ${paymentMethod === 'finance'
            ? 'bg-white text-gray-900 border border-gray-100 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center gap-1 mb-2">
            <img src={FinanceIcon} alt="" className="w-6 h-6" />
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-gray-700">Finance with</div>
          <div className="text-[11px] sm:text-xs font-bold text-gray-700">Alphaeon</div>
          <div className="text-[10px] text-gray-400 mt-2">As low as $0.48/mo</div>
        </button>
      )}
    </div>
  );
};
