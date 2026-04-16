import React from 'react';

interface CardPaymentFormProps {
  data: {
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
  };
  onUpdate: (updates: any) => void;
  showSubmit?: boolean;
  submitText?: string;
  onSubmit?: () => void;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  data,
  onUpdate,
  showSubmit = true,
  submitText = "Submit Card Payment",
  onSubmit
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Card Number</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="•••• •••• •••• ••••"
          value={data.cardNumber || ''}
          onChange={(e) => onUpdate({ cardNumber: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Cardholder Name</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="John Doe"
          value={data.cardName || ''}
          onChange={(e) => onUpdate({ cardName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Expiration Date</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="MM/YY"
            value={data.expiryDate || ''}
            onChange={(e) => onUpdate({ expiryDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">CVV</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="123"
            value={data.cvv || ''}
            onChange={(e) => onUpdate({ cvv: e.target.value })}
          />
        </div>
      </div>
      {showSubmit && (
        <button
          onClick={onSubmit}
          className="w-full bg-[#5c67ff] hover:bg-[#4a54e1] text-white font-semibold py-4 rounded-lg transition-colors shadow-sm mt-2"
        >
          {submitText}
        </button>
      )}
    </div>
  );
};
