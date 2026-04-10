import { PaymentWorkflow } from './components/PaymentWorkflow';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentWorkflow />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
