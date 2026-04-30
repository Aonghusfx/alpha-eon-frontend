import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import type { PaymentMethod, Plan } from './PaymentWorkflow';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onNext: () => void;
  orderAmount: number;
  availablePlans: Plan[];
  isLoadingPlans?: boolean;
}
const AlphaeonLogo = () => (
  <svg width="30  " height="30  " viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 0C60.8397 0 66.4666 0.910576 71.7471 2.59668C69.3893 2.20592 66.9686 2 64.5 2C40.1995 2 20.5 21.6995 20.5 46C20.5 70.3005 40.1995 90 64.5 90C88.8005 90 108.5 70.3005 108.5 46C108.5 44.3414 108.404 42.7047 108.226 41.0938C109.383 45.5356 110 50.1957 110 55C110 85.3757 85.3757 110 55 110C24.6243 110 0 85.3757 0 55C0 24.6243 24.6243 0 55 0Z" fill="#D22F27" />
    <path d="M68.1055 82.4183C64.0864 82.6131 60.1834 82.1732 56.4924 81.1901C58.1259 81.3794 59.7963 81.4396 61.4927 81.3574C78.2362 80.5456 91.1516 66.3142 90.3399 49.5706C89.5281 32.8271 75.2967 19.9118 58.5531 20.7235C41.8097 21.5353 28.8943 35.7667 29.706 52.5102C29.7613 53.6511 29.8824 54.7738 30.0588 55.876C29.1141 52.8558 28.5328 49.6678 28.3724 46.3596C27.3577 25.4301 43.5017 7.6411 64.4311 6.62643C85.3605 5.61185 103.15 21.7558 104.164 42.6851C105.179 63.6144 89.0348 81.4035 68.1055 82.4183Z" fill="#F37D21" />
    <path d="M57.2971 26.3127C59.821 26.0674 62.2911 26.2247 64.6444 26.7308C63.6104 26.6615 62.557 26.6747 61.4916 26.7782C50.9775 27.8001 43.2828 37.1525 44.3047 47.6667C45.3267 58.1807 54.6781 65.8756 65.1922 64.8537C75.7062 63.8318 83.4009 54.4802 82.3792 43.9662C82.3096 43.2497 82.1993 42.5464 82.0546 41.8579C82.7415 43.7302 83.205 45.7194 83.4069 47.7969C84.6841 60.9395 75.0653 72.6294 61.9227 73.9068C48.7801 75.184 37.0903 65.5651 35.8128 52.4225C34.5355 39.2799 44.1544 27.59 57.2971 26.3127Z" fill="#793694" />
    <path d="M66.6864 59.8558C65.1102 60.0865 63.5555 60.0626 62.0636 59.8159C62.7156 59.8283 63.3773 59.7884 64.0439 59.6909C70.6013 58.7312 75.1393 52.6372 74.1796 46.0796C73.2198 39.522 67.1257 34.9842 60.5683 35.9439C54.011 36.9037 49.4728 42.9976 50.4326 49.5552C50.4981 50.003 50.5889 50.4412 50.7009 50.8691C50.2131 49.716 49.8621 48.4828 49.6723 47.1862C48.4726 38.9892 54.1452 31.3718 62.3419 30.1721C70.5387 28.9724 78.1564 34.6447 79.3561 42.8417C80.5558 51.0387 74.8832 58.6562 66.6864 59.8558Z" fill="#9AAF3B" />
  </svg>

);

export function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  onNext,
  orderAmount,
  availablePlans,
  isLoadingPlans = false,
}: PaymentMethodSelectorProps) {
  const canProceed =
    paymentMethod === 'full' || paymentMethod === 'finance';

  // Dynamically find the lowest monthly payment from available plans
  const lowestMonthlyPayment = availablePlans.length > 0
    ? Math.min(...availablePlans.map(p => p.monthly_payment))
    : orderAmount / 24;

  return (
    <div className="space-y-6">
      <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Choose Payment Method</h2>
        <p className="text-sm font-medium text-slate-500 mb-8">
          Select how you'd like to pay for your order
        </p>

        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => onPaymentMethodChange(value as PaymentMethod)}
          className="space-y-4"
        >
          {/* Pay in Full */}
          {/* <div
            className={`group relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${paymentMethod === 'full'
              ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100'
              : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            onClick={() => onPaymentMethodChange('full')}
          >
            <div className="flex items-center gap-5">
              <RadioGroupItem value="full" id="full" className="w-5 h-5 border-2 text-blue-600 focus-visible:ring-blue-600" />
              <div className="flex-1">
                <Label
                  htmlFor="full"
                  className="flex items-center gap-3 cursor-pointer mb-1"
                >
                  <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-lg font-bold text-slate-900">Pay in Full</span>
                </Label>
                <div className="flex flex-col pl-8">
                  <p className="text-sm font-medium text-slate-500">
                    Pay the entire amount now with your credit or debit card
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900">
                    ${orderAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest text-[10px]">one-time</span>
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Finance Option */}
          {orderAmount >= 250 && (
            <div
              className={`group relative border-2 rounded-2xl p-6 transition-all duration-300 ${paymentMethod === 'finance'
                  ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-100 cursor-pointer'
                  : 'border-slate-100 hover:border-slate-200 bg-white cursor-pointer'
                }`}
              onClick={() => onPaymentMethodChange('finance')}
            >
              <div className="flex items-start gap-5">
                <div className="mt-1">
                  <RadioGroupItem
                    value="finance"
                    id="finance"
                    className="w-5 h-5 border-2 text-red-600 focus-visible:ring-red-600"
                  />
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="finance"
                    className="flex items-center gap-3 mb-1 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <AlphaeonLogo />
                    </div>
                    <span className="text-xl font-bold text-slate-900 uppercase tracking-tight">Finance With Alphaeon</span>
                  </Label>
                  <div className="mt-1">
                    {isLoadingPlans ? (
                      <div className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest pl-10">Calculating your offers...</div>
                    ) : (
                      <p className="text-lg font-black text-slate-900 pl-10">
                        As low as <span className="text-red-600">${lowestMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>/mo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </RadioGroup>
        {paymentMethod === 'finance' && (
          <p className="text-center text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mt-6">
            No processing fees for Alphaeon
          </p>
        )}
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-xl active:scale-95 ${canProceed
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
