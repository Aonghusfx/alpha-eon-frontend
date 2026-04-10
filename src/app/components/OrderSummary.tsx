import { ShoppingBag, Tag, Truck, DollarSign, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { Card } from './ui/card';
import { useState } from 'react';
import type { PaymentMethod, Plan } from './PaymentWorkflow';

interface OrderSummaryProps {
  amount: number;
  paymentMethod: PaymentMethod;
  financePlan?: string;
  selectedPlanObject?: Plan;
  upfrontPayment?: number;
  productName?: string;
  description?: string;
  tax?: number;
  shipping?: number;
  accountData?: {
    accountNumber?: string | null;
    creditLimit?: number;
    availableCredit?: number;
    firstName?: string;
    lastName?: string;
    ssn?: string;
  };
}

export function OrderSummary({
  amount,
  paymentMethod,
  financePlan,
  selectedPlanObject,
  upfrontPayment,
  productName,
  description,
  tax: propTax,
  shipping: propShipping,
  accountData,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tax = propTax || 0;
  const shipping = propShipping || 0;
  const total = amount + tax + shipping;
  const remainingAmount = total - (upfrontPayment || 0);


  const isRevolving = selectedPlanObject
    ? selectedPlanObject.term_months >= 1000
    : (financePlan === 'REVOLVING');

  return (
    <Card className={`transition-all duration-300 overflow-hidden lg:sticky lg:top-8 ${isExpanded ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-sm'}`}>
      {/* Mobile Header */}
      <div
        className="lg:hidden p-4 flex items-center justify-between cursor-pointer bg-slate-50 border-b border-slate-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Order</p>
              <Pencil className="w-2.5 h-2.5 text-slate-400" />
            </div>
            <p className="text-lg font-black text-slate-900 leading-none mt-0.5">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
            {isExpanded ? 'Hide Details' : 'View Details'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Main Content (Always visible on LG, collapsible on mobile) */}
      <div className={`p-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="hidden lg:flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Order Summary</h2>
          {/* <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors group" title="Edit Order">
            <Pencil className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button> */}
        </div>

        {/* Product Item */}
        <div className="mb-8 flex gap-5 items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
            <ShoppingBag className="w-8 h-8 text-slate-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-black text-slate-800 leading-tight mb-0.5">{productName || 'Breast Augmentation'}</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{description || 'Consultation included'}</p>
            <p className="text-[11px] font-black text-slate-600 uppercase mt-1">Procedure: 1</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4 mb-8 pb-8 border-b border-slate-100">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-slate-500 font-bold uppercase tracking-tight">Procedure Cost</span>
            <span className="text-slate-800 font-black">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {paymentMethod === 'finance' && upfrontPayment && upfrontPayment > 0 && (
            <div className="flex justify-between items-center text-[13px]">
              <span className="flex items-center gap-1.5 text-green-600 font-black uppercase tracking-tight">
                <DollarSign className="w-3.5 h-3.5" />
                Upfront Payment
              </span>
              <span className="text-green-600 font-black">-${upfrontPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div className="space-y-4 mb-8">
           <div className="flex justify-between items-center text-[13px]">
            <span className="text-slate-500 font-bold uppercase tracking-tight">Total Cost</span>
            <span className="text-slate-800 font-black">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-end">
             <span className="text-[15px] font-black text-slate-800 uppercase tracking-tighter">Amount to Finance</span>
             <span className="text-2xl font-black text-slate-900 tracking-tighter">
                ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
          </div>
        </div>

        {/* Selected Plan Details Box */}
        {paymentMethod === 'finance' && (financePlan || selectedPlanObject) && (
          <div className="mb-8 p-6 bg-[#ebf5ff] rounded-2xl border border-[#d6eaff] transition-all animate-in zoom-in-95 duration-500">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                 <Tag className="w-3.5 h-3.5 text-blue-500" />
                 <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Finance Plan</span>
              </div>
              
              <p className="text-[13px] font-black text-blue-800 uppercase tracking-tight">
                {isRevolving ? 'REVOLVING' : `${selectedPlanObject?.term_months || financePlan} MONTHLY PAYMENTS`}
              </p>
              
              <div className="flex items-baseline gap-1 py-1">
                <span className="text-2xl font-black text-blue-600">
                  ${(selectedPlanObject?.monthly_payment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[13px] font-black text-blue-600">/mo</span>
              </div>
              
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">
                {selectedPlanObject?.apr === 0 ? '0% APR' : `${((selectedPlanObject?.apr || 0) * 100).toFixed(0)}% APR`}
              </p>
            </div>
          </div>
        )}

        {/* Alphaeon Account Details */}
        {accountData && accountData.accountNumber && (
          <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-200 transition-all animate-in zoom-in-95 duration-500">
             <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">Account Details</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Account Number</span>
                    <span className="font-mono font-bold text-sm tracking-widest text-green-900 bg-white/60 px-2 py-1 rounded border border-green-100 w-fit">
                      {accountData.accountNumber ? `${accountData.accountNumber.slice(0, 4)}********${accountData.accountNumber.slice(-4)}` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Cardholder Name</span>
                    <span className="font-bold text-[13px] text-green-900 uppercase">
                      {accountData.firstName} {accountData.lastName}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Credit Limit</span>
                    <span className="font-bold text-sm text-green-900">
                      ${accountData.creditLimit?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? '0'}
                    </span>
                  </div>
                  
                  {accountData.availableCredit !== undefined && (
                    <div className="flex flex-col border-l pl-2 border-green-200">
                      <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Available</span>
                      <span className="font-bold text-sm text-green-900">
                        ${accountData.availableCredit?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col col-span-2 mt-1">
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">SSN (Linked)</span>
                    <span className="font-mono font-bold text-xs text-green-900">
                      ***-**-{accountData.ssn?.slice(-4) || 'N/A'}
                    </span>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Benefits Footer */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Pre-op consultation included</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Post-op care & follow-ups</span>
          </div>
        </div>
      </div>

    </Card>
  );
}
