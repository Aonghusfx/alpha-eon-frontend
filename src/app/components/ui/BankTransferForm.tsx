import React from 'react';

interface BankTransferFormProps {
  data: {
    bankAccountName?: string;
    bankRoutingNumber?: string;
    bankAccountNumber?: string;
  };
  onUpdate: (updates: any) => void;
  showSubmit?: boolean;
  submitText?: string;
  onSubmit?: () => void;
}

export const BankTransferForm: React.FC<BankTransferFormProps> = ({
  data,
  onUpdate,
  showSubmit = true,
  submitText = "Submit Bank Payment",
  onSubmit
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Account Holder Name</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="John Doe"
          value={data.bankAccountName || ''}
          onChange={(e) => onUpdate({ bankAccountName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Routing Number</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="9-digit routing number"
            value={data.bankRoutingNumber || ''}
            onChange={(e) => onUpdate({ bankRoutingNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Your account number"
            value={data.bankAccountNumber || ''}
            onChange={(e) => onUpdate({ bankAccountNumber: e.target.value })}
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
