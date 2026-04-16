import { Toaster } from 'react-hot-toast';
import LandingPage from './LandingPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingPage />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
