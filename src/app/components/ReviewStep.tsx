import { CreditCard, Calendar, MapPin, AlertCircle, DollarSign, Pencil } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useState } from 'react';
import type { PaymentData } from './PaymentWorkflow';

interface ReviewStepProps {
  paymentData: PaymentData;
  orderAmount: number;
  onNext: () => void;
  onBack: () => void;
  onSubmitPayment?: (paymentData: PaymentData, orderAmount: number) => Promise<boolean | void>;
}

export function ReviewStep({
  paymentData,
  orderAmount,
  onNext,
  onBack,
  onSubmitPayment,
}: ReviewStepProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = orderAmount;
  const upfrontAmount = paymentData.upfrontPayment || 0;
  const remainingAmount = total - upfrontAmount;
  const selectedPlan = paymentData.selectedPlanObject;

  const monthlyPayment = selectedPlan ? selectedPlan.monthly_payment : 0;
  const apr = selectedPlan ? selectedPlan.apr : 0;
  const termMonths = selectedPlan ? (selectedPlan.term_months || 0) : 0;

  const maskCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  };

  const handleSubmit = async () => {
    if (!agreedToTerms || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let shouldProceed = true;
      // Call the payment submission function if provided
      if (onSubmitPayment) {
        const result = await onSubmitPayment(paymentData, orderAmount);
        if (result === false) {
          shouldProceed = false;
        }
      }

      // Move to success step only if we should proceed immediately
      if (shouldProceed) {
        onNext();
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      // Error is handled by the parent component (PaymentWorkflow)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl mb-6">Review Your Order</h2>

        {/* Payment Method */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm text-gray-600 font-bold uppercase tracking-wider">Payment Method</h3>
             <button className="text-blue-500 hover:text-blue-700 transition-colors" onClick={onBack}>
                <Pencil className="w-4 h-4" />
             </button>
          </div>
          <div className="flex items-start gap-3">
            {paymentData.paymentMethod === 'full' ? (
              <CreditCard className="w-5 h-5 mt-0.5" />
            ) : (
              <Calendar className="w-5 h-5 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="mb-1">
                {paymentData.paymentMethod === 'full'
                  ? 'Pay in Full'
                  : termMonths >= 1000 ? 'Finance Plan - REVOLVING' : `Finance Plan - ${termMonths} Months`}
              </p>
              {paymentData.paymentMethod === 'finance' && (
                <>
                  <p className="text-sm text-gray-600">
                    ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month at {apr * 100}% APR
                  </p>
                  {upfrontAmount > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        ${upfrontAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} upfront payment
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-sm text-gray-600 font-bold uppercase tracking-wider">Payment Details</h3>
             <button className="text-blue-500 hover:text-blue-700 transition-colors" onClick={onBack}>
                <Pencil className="w-4 h-4" />
             </button>
          </div>
          <div className="space-y-3">
            {paymentData.paymentMethod === 'full' ? (
              <>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <p className="text-sm">{maskCardNumber(paymentData.cardNumber)}</p>
                    <p className="text-xs text-gray-500">{paymentData.cardName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>ZIP Code: {paymentData.billingZip || 'Not provided'}</span>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Finance Account */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Alphaeon Credit (Financed Amount)</p>
                    <p className="text-xs text-gray-500">Account Ending in {paymentData.accountNumber?.slice(-4) || 'N/A'}</p>
                  </div>
                </div>

                {/* Upfront Card (if applicable) */}
                {upfrontAmount > 0 && (
                  <div className="flex items-center gap-3 pt-3 border-t border-dashed border-gray-200">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Credit Card (Upfront Payment)</p>
                      <p className="text-xs text-gray-500">{maskCardNumber(paymentData.cardNumber)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Total */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Cost</span>
            <span className="text-xl">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {paymentData.paymentMethod === 'finance' && upfrontAmount > 0 && (
            <div className="flex justify-between mb-2 text-sm text-green-600">
              <span>Upfront Payment</span>
              <span>-${upfrontAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          {paymentData.paymentMethod === 'finance' && (
            <div className="p-3 bg-blue-50 rounded-lg mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-900">
                  {termMonths >= 1000 ? 'REVOLVING' : `${termMonths} monthly payments of`}
                </span>
                <span className="text-lg text-blue-900">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">{apr * 100}% APR | No hidden fees</p>
              {upfrontAmount > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  Financing ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </Label>
              {paymentData.paymentMethod === 'finance' && (
                <p className="text-xs text-gray-600 mt-2">
                  By checking this box, you authorize us to charge your payment
                  method {upfrontAmount > 0 ? 'for the upfront payment today and ' : ''}monthly as per your selected finance plan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Important Notice */}
        {paymentData.paymentMethod === 'finance' && (
          <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                {upfrontAmount > 0 && (
                  <p className="mb-2">
                    Your upfront payment of ${upfrontAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} will be processed today.
                  </p>
                )}
                <p className="mb-2">
                  Your first monthly payment will be processed {upfrontAmount > 0 ? 'in 30 days' : 'today'}. Subsequent payments
                  will be charged on the same day each month.
                </p>
                <p>
                  You can pay off your balance early at any time without penalty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-1/3 h-12 rounded-xl font-bold border-slate-200 text-slate-600 order-2 sm:order-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!agreedToTerms || isSubmitting}
            className="w-full sm:flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 order-1 sm:order-2"
            size="lg"
          >
            {isSubmitting ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
