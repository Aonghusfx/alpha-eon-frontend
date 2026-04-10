import { DollarSign, AlertCircle } from 'lucide-react';
import type { Plan } from './PaymentWorkflow';

interface FinancePlanSelectorProps {
  selectedPlanId?: number;
  onPlanChange: (plan: Plan) => void;
  orderAmount: number;
  upfrontPayment?: number;
  onUpfrontPaymentChange: (amount: number | undefined) => void;
  availablePlans: Plan[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function FinancePlanSelector({
  selectedPlanId,
  onPlanChange,
  orderAmount,
  upfrontPayment,
  onUpfrontPaymentChange,
  availablePlans,
  isLoading = false,
  children
}: FinancePlanSelectorProps) {
  const total = orderAmount;
  const remainingAmount = total - (upfrontPayment || 0);

  const handleUpfrontPaymentChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(cleaned);

    if (cleaned === '' || isNaN(numValue)) {
      onUpfrontPaymentChange(undefined);
    } else {
      const cappedValue = Math.min(numValue, total - 100);
      onUpfrontPaymentChange(cappedValue);
    }
  };


  return (
    <div className="space-y-6">
      {/* Upfront Payment Section */}
      <div className="bg-[#f2fbf9] border border-[#dcf2ed] rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-[#e6f6f2] rounded-lg">
            <DollarSign className="w-5 h-5 text-[#2d9d78]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-tight mb-1">Upfront Payment</h4>

            
            <div className="max-w-[240px] relative h-14 group">
               <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none z-10">
                 <span className="text-slate-400 font-black text-lg group-focus-within:text-[#2d9d78] transition-colors">$</span>
               </div>
               <input
                  type="text"
                  placeholder="0.00"
                  value={upfrontPayment !== undefined ? upfrontPayment : ''}
                  onChange={(e) => handleUpfrontPaymentChange(e.target.value)}
                  className="w-full h-full pl-10 pr-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-[#2d9d78] focus:ring-4 focus:ring-[#2d9d78]/10 transition-all font-black text-slate-700 bg-white placeholder:text-slate-200 text-lg"
               />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3 ml-1 uppercase tracking-tight">
                Max Budget: ${(Math.max(0, total - 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            {children && (
              <div className="mt-6 pt-6 border-t border-[#dcf2ed]">
                {children}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Finance Plans Box */}
      <div className="bg-white border-2 border-slate-100 rounded-[32px] p-8 md:p-12 shadow-sm space-y-10">
        {/* Remaining Amount to Finance Section */}
        <div className="flex flex-col items-center">
          <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-tight mb-4 text-center">
            REMAINING AMOUNT TO FINANCE WITH ALPHAEON CREDIT CARD
          </h4>
          <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
            ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Plan Grid */}
        <div className="relative">
          {!isLoading && availablePlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-black uppercase tracking-tight text-sm">No financing plans available</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
              {availablePlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => onPlanChange(plan)}
                    className={`relative flex flex-col p-6 rounded-2xl border-2 text-left transition-all duration-300 bg-white group ${isSelected
                      ? 'border-red-600 ring-1 ring-red-600 shadow-xl scale-[1.02]'
                      : 'border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                  >
                    <div className="flex-1 text-center w-full flex flex-col items-center">
                      <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-tight leading-4 mb-6 min-h-[32px] flex items-center justify-center">
                        {plan.term_months} MONTHS DEFERRED INTEREST
                      </h3>

                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                        ESTIMATED PAYMENT
                      </p>

                      <div className="flex justify-center items-baseline gap-1 mb-4 text-slate-900">
                        <span className="text-xl font-bold font-serif">$</span>
                        <span className="text-5xl font-black tracking-tighter">
                          {plan.monthly_payment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <div className="flex items-baseline mb-1">
                          <span className="text-sm font-bold">/mo</span>
                          <sup className="text-[9px] font-bold text-slate-400 ml-0.5">4</sup>
                        </div>
                      </div>

                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-8">
                        TOTAL ESTIMATED COST : <span className="text-slate-700 font-extrabold">${(plan.total_cost || total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </p>
                    </div>

                    <div
                      className={`w-full py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 text-center ${isSelected
                        ? 'bg-[#C41E3A] text-white shadow-lg shadow-red-100'
                        : 'bg-red-50/50 text-[#C41E3A] hover:bg-red-50'
                        }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Disclosures */}
      {selectedPlanId && availablePlans.find(p => p.id === selectedPlanId) && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-4">
            {(() => {
              const selectedPlan = availablePlans.find(p => p.id === selectedPlanId);
              if (!selectedPlan) return null;
              return (
                <div className="text-[11px] leading-relaxed text-slate-500">
                   <div 
                    className="prose prose-slate prose-sm max-w-none space-y-4"
                    dangerouslySetInnerHTML={{ __html: selectedPlan.description || '' }} 
                  />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* No Hidden Fees Banner */}
       <div className="p-4 bg-[#fffced] rounded-xl border border-[#fff5cc] shadow-sm">
        <p className="text-[13px] font-bold text-[#856404] text-center">
          <span className="font-black uppercase mr-2 tracking-tighter">No hidden fees:</span> 
          Your monthly payment will never change, and there are no penalties for early payment.
        </p>
      </div>
    </div>

  );
}
