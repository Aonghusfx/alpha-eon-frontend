
import { Card } from './ui/card';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';

interface FailedStepProps {
    onRetry: () => void;
}

export function FailedStep({ onRetry }: FailedStepProps) {
    return (
        <div className="space-y-6">
            <Card className="p-8 text-center print:shadow-none print:border-none">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <h2 className="text-2xl mb-6 text-red-600 font-bold">Payment Failed</h2>

                <Button onClick={onRetry} variant="outline" className="w-full h-12 text-sm font-bold border-gray-300">
                    Try a Different Payment Method
                </Button>
            </Card>
        </div>
    );
}
