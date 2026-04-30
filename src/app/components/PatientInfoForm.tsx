import { useState } from 'react';
// import toast from 'react-hot-toast';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface PatientInfo {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    ssn: string; // Required for Alphaeon account lookup
    address: {
        zipCode: string;
    };
}

interface PatientInfoFormProps {
    patientInfo?: PatientInfo;
    onUpdate: (info: PatientInfo) => void;
    onNext: (info: PatientInfo) => void;
    onBack?: () => void;
    isSubmitting?: boolean;
}

export function PatientInfoForm({
    patientInfo,
    onUpdate,
    onNext,
    onBack,
    isSubmitting,
}: PatientInfoFormProps) {
    const [formData, setFormData] = useState<PatientInfo>(
        patientInfo || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            ssn: '',
            address: {
                zipCode: '',
            },
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        const ssnDigits = (formData.ssn || '').replace(/\D/g, '');
        if (!ssnDigits) {
            newErrors.ssn = 'SSN is required';
        } else if (ssnDigits.length !== 9) {
            newErrors.ssn = 'SSN must be 9 digits';
        }

        if (!formData.address.zipCode.trim()) {
            newErrors['address.zipCode'] = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
            newErrors['address.zipCode'] = 'Please enter a valid ZIP code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onUpdate(formData);
            onNext(formData);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Patient Information</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Please provide your SSN and ZIP code to identify your Alphaeon account or proceed to pre-qualification.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-12 py-10">
                <div className="space-y-8">
                    {/* Identification Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Lookup</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ssn" className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">
                                    Social Security Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="ssn"
                                        type="text"
                                        value={formData.ssn || ''}
                                        onChange={(e) => handleChange('ssn', e.target.value.replace(/\D/g, ''))}
                                        placeholder="9 digits"
                                        maxLength={9}
                                        className={`h-11 rounded-lg border-slate-200 focus:ring-blue-500 transition-all pl-10 ${errors.ssn ? 'border-red-500 bg-red-50/30' : 'hover:border-slate-300'}`}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                                {errors.ssn && (
                                    <p className="text-[11px] font-medium text-red-500 ml-1 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.ssn}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zipCode" className="text-xs font-bold text-slate-600 uppercase tracking-tight ml-1">ZIP Code</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.address.zipCode}
                                    onChange={(e) => handleChange('address.zipCode', e.target.value)}
                                    placeholder="90210"
                                    maxLength={5}
                                    className={`h-11 rounded-lg border-slate-200 focus:ring-blue-500 transition-all text-center font-mono ${errors['address.zipCode'] ? 'border-red-500 bg-red-50/30' : 'hover:border-slate-300'}`}
                                />
                                {errors['address.zipCode'] && (
                                    <p className="text-[11px] font-medium text-red-500 ml-1 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {errors['address.zipCode']}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Contact Info (Critical for Receipt Signing) */}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-100">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full sm:w-auto h-12 px-6 sm:px-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 min-h-12 px-4 bg-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm leading-tight shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center whitespace-normal"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Checking Account...
                            </>
                        ) : (
                            'Find Account or Pre-qualify with Alphaeon'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
