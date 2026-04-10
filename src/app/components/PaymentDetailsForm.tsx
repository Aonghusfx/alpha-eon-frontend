import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { PaymentData } from './PaymentWorkflow';

interface PaymentDetailsFormProps {
  paymentData: PaymentData;
  onUpdate: (updates: Partial<PaymentData>) => void;
  onNext: () => void;
  onBack: () => void;
  isEmbedded?: boolean;
}

export function PaymentDetailsForm({
  paymentData,
  onUpdate,
  onNext,
  onBack,
  isEmbedded = false,
}: PaymentDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
      onUpdate({ cardNumber: formatCardNumber(cleaned) });
      if (errors.cardNumber) {
        setErrors((prev) => ({ ...prev, cardNumber: '' }));
      }
    }
  };

  const handleExpiryDateChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      onUpdate({ expiryDate: formatExpiryDate(cleaned) });
      if (errors.expiryDate) {
        setErrors((prev) => ({ ...prev, expiryDate: '' }));
      }
    }
  };

  const handleCvvChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      onUpdate({ cvv: value });
      if (errors.cvv) {
        setErrors((prev) => ({ ...prev, cvv: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.cardName.trim()) {
      newErrors.cardName = 'Please enter the cardholder name';
    }

    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date';
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.billingZip || paymentData.billingZip.length < 5) {
      newErrors.billingZip = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className={isEmbedded ? "" : "p-6 bg-white rounded-xl border border-slate-200 shadow-sm"}>
      {!isEmbedded && (
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6 text-slate-900" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Payment Details</h2>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Number */}
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={paymentData.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            className={errors.cardNumber ? 'border-red-500' : ''}
          />
          {errors.cardNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <Label htmlFor="cardName">Cardholder Name</Label>
          <Input
            id="cardName"
            type="text"
            placeholder="John Doe"
            value={paymentData.cardName}
            onChange={(e) => {
              onUpdate({ cardName: e.target.value });
              if (errors.cardName) {
                setErrors((prev) => ({ ...prev, cardName: '' }));
              }
            }}
            className={errors.cardName ? 'border-red-500' : ''}
          />
          {errors.cardName && (
            <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Expiry Date */}
          <div className="col-span-1">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="text"
              placeholder="MM/YY"
              value={paymentData.expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              className={errors.expiryDate ? 'border-red-500' : ''}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-500 mt-1">{errors.expiryDate}</p>
            )}
          </div>

          {/* CVV */}
          <div className="col-span-1">
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              placeholder="123"
              value={paymentData.cvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              className={errors.cvv ? 'border-red-500' : ''}
            />
            {errors.cvv && (
              <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
            )}
          </div>

          {/* Billing ZIP */}
          <div className="col-span-1">
            <Label htmlFor="billingZip">Billing ZIP</Label>
            <Input
              id="billingZip"
              type="text"
              placeholder="12345"
              value={paymentData.billingZip}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                onUpdate({ billingZip: value });
                if (errors.billingZip) {
                  setErrors((prev) => ({ ...prev, billingZip: '' }));
                }
              }}
              className={errors.billingZip ? 'border-red-500' : ''}
            />
            {errors.billingZip && (
              <p className="text-sm text-red-500 mt-1">{errors.billingZip}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Lock className="w-4 h-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>

        {/* Action Buttons - only show if NOT embedded */}
        {!isEmbedded && (
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-black font-black uppercase tracking-widest text-xs h-12">
              Submit Sale
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
