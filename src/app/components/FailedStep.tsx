import { XCircle, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface FailedStepProps {
    errorMessage?: string;
    onRetry: () => void;
}

export function FailedStep({ errorMessage, onRetry }: FailedStepProps) {
    return (
        <div className="space-y-6">
            <Card className="p-8 text-center print:shadow-none print:border-none">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <h2 className="text-2xl mb-2 text-red-600 font-bold">Payment Failed</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {errorMessage || 'There was an issue processing your payment.'}
                </p>

                <div className="p-4 bg-red-50 text-red-800 rounded-lg mb-8 border border-red-200">
                    <p className="font-semibold text-lg flex items-center justify-center gap-2 mb-2">
                        <Phone className="w-5 h-5" />
                        Call Support Center
                    </p>
                    <p className="text-sm">
                        If the issue persists, please contact Alphaeon support at <strong>(855) 497-8176</strong> to resolve the issue to complete the transaction.
                    </p>
                </div>

                <Button onClick={onRetry} variant="outline" className="w-full h-12 text-sm font-bold border-gray-300">
                    Try a Different Payment Method
                </Button>
            </Card>
        </div>
    );
}
