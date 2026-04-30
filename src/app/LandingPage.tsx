import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import FinanceIcon from "../assets/icons/finance_logo.png";
import { PaymentWorkflow } from './components/PaymentWorkflow';
import { PaymentMethodToggle } from './components/ui/PaymentMethodToggle';
import { CardPaymentForm } from './components/ui/CardPaymentForm';
import { BankTransferForm } from './components/ui/BankTransferForm';
import { PaymentSummary } from './components/ui/PaymentSummary';

const PaymentCheckout = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [goToFinanceStep2, setGoToFinanceStep2] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const baseAmount = 802.00;

  const userName = "Aonghus O'Heocha";
  const userPhone = "+353879077030";

  const renderForm = () => {
    if (paymentMethod === 'card') {
      return (
        <CardPaymentForm
          data={formData}
          onUpdate={(updates) => setFormData({ ...formData, ...updates })}
          onSubmit={() => console.log("Card payment submitted", formData)}
        />
      );
    } else if (paymentMethod === 'bank') {
      return (
        <BankTransferForm
          data={formData}
          onUpdate={(updates) => setFormData({ ...formData, ...updates })}
          onSubmit={() => console.log("Bank transfer submitted", formData)}
        />
      );
    }
    return null;
  };

  if (goToFinanceStep2) {
    return <PaymentWorkflow initialStep={2} initialPaymentMethod="finance" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full py-4 sm:py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div
          className="bg-white rounded-2xl shadow-xl overflow-auto scrollbar-hide border border-gray-100 w-full max-w-[480px]"
          style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
              Complete Payment
            </h1>

            {/* User Info Card */}
            <div className="bg-[#f0f7ff] rounded-xl p-4 text-center mb-6 border border-[#e0efff]">
              <div className="text-[#3b5998] font-bold text-xl">{userName}</div>
              <div className="text-[#3b5998] text-base opacity-80">{userPhone}</div>
            </div>

            <div className="grid grid-cols-1 gap-10">

              {/* Left Column */}
              <div className="w-full space-y-4">

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Payment Method
                  </label>

                  <PaymentMethodToggle
                    paymentMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                    showFinance={true}
                  />

                </div>

                {paymentMethod === 'finance' && (
                  <button
                    onClick={() => setGoToFinanceStep2(true)}
                    className="w-full border-2 border-red-500 rounded-2xl p-5 bg-white hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src={FinanceIcon} alt="" className="w-8 h-8" />
                      <div>
                        <p className="text-2xl font-black text-slate-900 uppercase leading-none">
                          Finance With Alphaeon
                        </p>
                        <p className="text-lg font-extrabold text-slate-900 mt-2">
                          As low as <span className="text-red-600">$34</span>/mo
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Form */}
                <div className="pt-2">
                  {paymentMethod !== 'finance' && (
                    <div className="lg:col-span-5 mb-8">
                      <div className="sticky top-8">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                          Summary
                        </label>

                        <PaymentSummary
                          amount={baseAmount}
                          paymentMethod={paymentMethod}
                        />

                        <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <ShieldCheck size={18} className="text-yellow-600" />
                          <span>Your payment information is encrypted and secure</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {renderForm()}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <PaymentCheckout />;
}