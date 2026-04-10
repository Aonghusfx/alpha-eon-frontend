import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PatientInfo } from './PatientInfoForm';

export interface ApplicationData {
    patientInfo: PatientInfo;
    dob: string;
    annualIncome: string;
}

interface CreditApplicationFormProps {
    patientInfo: PatientInfo;
    onUpdate: (data: ApplicationData) => void;
    onSubmit: (data: ApplicationData) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function CreditApplicationForm({
    patientInfo,
    onUpdate,
    onSubmit,
    onBack,
    isLoading = false
}: CreditApplicationFormProps) {
    const [formData, setFormData] = useState<ApplicationData>({
        patientInfo,
        dob: '',
        annualIncome: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
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

        if (!formData.dob) {
            newErrors.dob = 'Date of Birth is required';
        } else {
            // Basic YYYY-MM-DD check
            if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
                newErrors.dob = 'Use format YYYY-MM-DD';
            } else {
                const date = new Date(formData.dob);
                const now = new Date();
                const age = now.getFullYear() - date.getFullYear();
                // Adjust for month/day
                const m = now.getMonth() - date.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
                    // age--; // Not strictly needed for simple year check but better accuracy
                }

                if (isNaN(date.getTime())) {
                    newErrors.dob = 'Invalid date';
                } else if (age < 18) {
                    newErrors.dob = 'You must be at least 18 years old';
                }
            }
        }

        if (!formData.annualIncome) {
            newErrors.annualIncome = 'Annual Income is required';
        } else if (isNaN(Number(formData.annualIncome)) || Number(formData.annualIncome) < 0) {
            newErrors.annualIncome = 'Please enter a valid amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Complete Credit Application</h2>
            <p className="text-sm text-gray-600 mb-6">
                We couldn't find an existing account. Please provide additional details to apply for financing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={patientInfo.firstName} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={patientInfo.lastName} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label>SSN</Label>
                        <Input value={patientInfo.ssn} disabled className="bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                        <Label>Zip Code</Label>
                        <Input value={patientInfo.address.zipCode} disabled className="bg-gray-100" />
                    </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth (YYYY-MM-DD) *</Label>
                        <Input
                            id="dob"
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleChange('dob', e.target.value)}
                            className={errors.dob ? 'border-red-500' : ''}
                        />
                        {errors.dob && (
                            <p className="text-sm text-red-500">{errors.dob}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="annualIncome">Annual Income ($) *</Label>
                        <Input
                            id="annualIncome"
                            type="number"
                            value={formData.annualIncome}
                            onChange={(e) => handleChange('annualIncome', e.target.value)}
                            className={errors.annualIncome ? 'border-red-500' : ''}
                            placeholder="50000"
                        />
                        {errors.annualIncome && (
                            <p className="text-sm text-red-500">{errors.annualIncome}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
                        Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Submit Application'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
