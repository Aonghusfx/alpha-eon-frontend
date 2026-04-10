
import { AlertTriangle, RotateCcw, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface FailureStepProps {
    error: string;
    onRetry: () => void;
}

export function FailureStep({ error, onRetry }: FailureStepProps) {
    return (
        <div className="space-y-6">
            <Card className="p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <h2 className="text-2xl mb-2 text-red-700">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                    We were unable to process your transaction.
                </p>

                <Alert variant="destructive" className="mb-6 text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error || "An unknown error occurred during payment processing."}
                    </AlertDescription>
                </Alert>

                <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        If you continue to experience issues, please contact our support team or your bank/lender.
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                        Support: (855) 497-8176
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button onClick={onRetry} className="w-full gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                        Return to Store
                    </Button>
                </div>
            </Card>
        </div>
    );
}
