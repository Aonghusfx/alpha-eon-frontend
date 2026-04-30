import { useState } from 'react';
import {
    CreditCard,
    DollarSign,
    Clock,
    Download,
    FileText,
    LogOut,
    User,
    ShieldCheck,
    Loader2,
    CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { alphaeonApi } from '../../services/alphaeonApi';

// Types for our portal data
interface AccountData {
    accountNumber: string;
    creditLimit: number;
    availableCredit: number;
    balance: number;
    nextPaymentDue: string;
    minPaymentDue: number;
    apr: number;
    promoExpiration?: string;
    firstName: string;
    lastName: string;
    division: string;
    lenderName: string;
    productType: string;
    accountId: string;
    available_credit_limit?: number; // Adding this to match user's manual change intent
}

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'posted' | 'pending';
    type: 'purchase' | 'payment';
}

export function CustomerPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Login form state
    const [loginMethod, setLoginMethod] = useState<'ssn' | 'account'>('ssn');
    const [ssn, setSsn] = useState('');
    const [accountNumberInput, setAccountNumberInput] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Account data state
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        email: 'jose.abreau@example.com',
        phone: '(555) 123-4567',
        address: '325 CARRIAGE LN, HUDSON, WI 54016'
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // 1. Authenticate with Alphaeon (handled by service)
            await alphaeonApi.authenticate();

            let accountDataResult;

            if (loginMethod === 'ssn') {
                // 2a. Lookup Account by SSN using service method
                const accounts = await alphaeonApi.lookupAccount({
                    ssn: ssn,
                    zip: zipCode,
                    location_id: 6923 // Match the previous hardcoded ID for now
                });

                if (accounts && accounts.length > 0) {
                    accountDataResult = accounts[0];
                }
            } else {
                // 2b. Lookup Account by Account Number using service method
                accountDataResult = await alphaeonApi.lookupAccountByNumber(accountNumberInput, '6923');
            }

            if (accountDataResult && (accountDataResult.account_number || accountDataResult.alphaeon_account_number)) {
                const acc = accountDataResult;
                const limit = acc.credit_limit || 0;
                const available = acc.available_credit_limit || acc.available_credit || 0;

                // Extract Name
                const firstName = acc.name?.first_name || 'Valued';
                const lastName = acc.name?.last_name || 'Customer';

                setAccountData({
                    accountNumber: acc.alphaeon_account_number || acc.account_number,
                    creditLimit: acc?.available_credit_limit,
                    availableCredit: available,
                    available_credit_limit: acc?.available_credit_limit,
                    balance: limit - available,
                    nextPaymentDue: '2024-03-15',
                    minPaymentDue: Math.max(25, (limit - available) * 0.03),
                    apr: 26.99, // Standard Alphaeon APR
                    promoExpiration: '2025-02-15',
                    firstName: firstName,
                    lastName: lastName,
                    division: acc.division || 'N/A',
                    lenderName: acc.lender_name || 'N/A',
                    productType: acc.program_product_type || 'N/A',
                    accountId: acc.account_id || 'N/A'
                });

                // Update settings form with real name (if we had email/phone in response we'd use it too)
                setSettingsForm(prev => ({
                    ...prev,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`, // Mock email based on real name
                    // address: ... (Account address not fully exposed in lite object sometimes, checking...)
                }));

                // Mock transactions based on the found account
                setTransactions([
                    {
                        id: 'txn_latest',
                        date: new Date().toLocaleDateString(),
                        description: 'Medical Procedure - Payment',
                        amount: 1200.00,
                        status: 'pending',
                        type: 'purchase'
                    },
                    {
                        id: 'txn_123',
                        date: '2024-01-15',
                        description: 'Monthly Payment',
                        amount: 150.00,
                        status: 'posted',
                        type: 'payment'
                    }
                ]);

                setIsAuthenticated(true);
            } else {
                setError('No account found with these details.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setAccountData(null);
        setSsn('');
        setZipCode('');

        // Reset modal states
        setIsPaymentModalOpen(false);
        setPaymentAmount('');
        setPaymentSuccess(false);
        setIsSettingsModalOpen(false);
        setSettingsSuccess(false);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessingPayment(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsProcessingPayment(false);
        setPaymentSuccess(true);

        // Update balance locally for demo effect
        if (accountData) {
            const amount = parseFloat(paymentAmount);
            setAccountData({
                ...accountData,
                balance: accountData.balance - amount,
                availableCredit: accountData.availableCredit + amount
            });

            // Add transaction
            setTransactions(prev => [{
                id: `txn_pay_${Date.now()}`,
                date: new Date().toLocaleDateString(),
                description: 'Online Payment - Thank You',
                amount: amount,
                status: 'pending',
                type: 'payment'
            }, ...prev]);
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSavingSettings(false);
        setSettingsSuccess(true);
        setTimeout(() => {
            setSettingsSuccess(false);
            setIsSettingsModalOpen(false);
        }, 1500);
    };

    const handleDownloadStatement = (date: string) => {
        // Simulate download
        alert(`Downloading statement for ${date}...`);
    };



    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-blue-900">Patient Portal</CardTitle>
                        <CardDescription>
                            Access your Alphaeon Credit account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-center mb-4">
                                <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'ssn' | 'account')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="ssn">SSN</TabsTrigger>
                                        <TabsTrigger value="account">Account Number</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {loginMethod === 'ssn' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="ssn">Social Security Number</Label>
                                    <Input
                                        id="ssn"
                                        placeholder="Enter full SSN (for demo)"
                                        value={ssn}
                                        onChange={(e) => setSsn(e.target.value)}
                                        type="password"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Demo User: Use <strong>666210584</strong>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        placeholder="Enter 16-digit Account Number"
                                        value={accountNumberInput}
                                        onChange={(e) => setAccountNumberInput(e.target.value.replace(/\D/g, ''))}
                                        maxLength={16}
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Demo: Use your created account number
                                    </p>
                                </div>
                            )}

                            {loginMethod === 'ssn' && (
                                <div className="space-y-2">
                                    <Label htmlFor="zip">Zip Code</Label>
                                    <Input
                                        id="zip"
                                        placeholder="e.g. 54016"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Demo User: Use <strong>54016</strong>
                                    </p>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Secure Connection by Alphaeon
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-blue-900">Alphaeon Credit</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{accountData?.firstName} {accountData?.lastName}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account ID: {accountData?.accountId}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Account Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Balance */}
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg border-none">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-blue-100">Current Balance</CardDescription>
                            <CardTitle className="text-3xl font-bold flex items-baseline gap-1">
                                <span className="text-xl">$</span>
                                {accountData?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-blue-100 mt-2 border-t border-blue-500/30 pt-3">
                                <span>Available Credit</span>
                                <span>${accountData?.availableCredit?.toLocaleString('en-US') ?? '0'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-blue-100 mt-1">
                                <span className="opacity-70">Credit Limit</span>
                                <span className="font-bold">${accountData?.creditLimit?.toLocaleString('en-US') ?? '0'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-blue-200 mt-3 pt-2 border-t border-blue-500/10 uppercase font-black tracking-widest">
                                <span>{accountData?.lenderName} • {accountData?.division}</span>
                                <span>{accountData?.productType === 'ac_card' ? 'Alphaeon Card' : accountData?.productType}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Next Payment Due</CardDescription>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                {accountData?.nextPaymentDue}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Due Soon
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500">Minimum Due</p>
                                    <p className="text-lg font-semibold">${accountData?.minPaymentDue.toFixed(2)}</p>
                                </div>
                                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            Pay Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Make a Payment</DialogTitle>
                                            <DialogDescription>
                                                Pay towards your Alphaeon Credit balance.
                                            </DialogDescription>
                                        </DialogHeader>

                                        {!paymentSuccess ? (
                                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Current Balance:</span>
                                                        <span className="font-medium">${accountData?.balance.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Minimum Due:</span>
                                                        <span className="font-medium">${accountData?.minPaymentDue.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="amount">Payment Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            id="amount"
                                                            className="pl-9"
                                                            placeholder="0.00"
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                            type="number"
                                                            min="1"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="source">Payment Source</Label>
                                                    <div className="flex items-center gap-3 p-3 border rounded-md">
                                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">Chase Checking (...4589)</p>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-6 text-xs" type="button">Change</Button>
                                                    </div>
                                                </div>

                                                <DialogFooter className="sm:justify-start">
                                                    <Button type="submit" className="w-full bg-blue-600" disabled={isProcessingPayment}>
                                                        {isProcessingPayment ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            'Confirm Payment'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        ) : (
                                            <div className="text-center py-6 space-y-4">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
                                                <p className="text-gray-500">
                                                    Your payment of ${parseFloat(paymentAmount).toFixed(2)} has been processed successfully.
                                                </p>
                                                <Button onClick={() => {
                                                    setPaymentSuccess(false);
                                                    setIsPaymentModalOpen(false);
                                                    setPaymentAmount('');
                                                }} className="w-full">
                                                    Done
                                                </Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Quick Actions</CardDescription>
                            <CardTitle className="text-lg font-semibold text-gray-900">Manage Account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-2"
                                onClick={() => document.getElementById('tab-statements')?.click()}
                            >
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">View Statements</span>
                                    <span className="text-xs text-gray-500">Download PDF statements</span>
                                </div>
                            </Button>

                            <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left h-auto py-2">
                                        <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">Account Settings</span>
                                            <span className="text-xs text-gray-500">Update personal info</span>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Account Settings</DialogTitle>
                                        <DialogDescription>
                                            Update your personal contact information.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleSettingsSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={settingsForm.email}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={settingsForm.phone}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Mailing Address</Label>
                                            <Input
                                                id="address"
                                                value={settingsForm.address}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button type="submit" disabled={isSavingSettings}>
                                                {isSavingSettings ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : settingsSuccess ? (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Saved
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="activity" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="plans">My Plans</TabsTrigger>
                        <TabsTrigger value="statements" id="tab-statements">Statements</TabsTrigger>
                    </TabsList>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Activity</CardTitle>
                                        <CardDescription>Your recent transactions and payments</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {transactions.map((txn) => (
                                                <tr key={txn.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-600">{txn.date}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{txn.description}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${txn.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {txn.status === 'posted' ? 'Posted' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-medium ${txn.type === 'payment' ? 'text-green-600' : 'text-gray-900'
                                                        }`}>
                                                        {txn.type === 'payment' ? '+' : ''}${txn.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {transactions.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">No recent activity found.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Plans Tab */}
                    <TabsContent value="plans">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Financing Plans</CardTitle>
                                <CardDescription>Details of your current promo plans</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 border rounded-lg bg-blue-50 border-blue-100 mb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-blue-900">Standard Plan Purchase</h3>
                                            <p className="text-sm text-blue-700">Promotional Financing</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Active</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                        <div>
                                            <span className="text-blue-600 block text-xs">Interest Rate</span>
                                            <span className="font-medium">{accountData?.apr}% APR</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 block text-xs">Promo Balance</span>
                                            <span className="font-medium">${accountData?.balance.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 block text-xs">Promo Expiration</span>
                                            <span className="font-medium">{accountData?.promoExpiration}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Statements Tab */}
                    <TabsContent value="statements">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Statements</CardTitle>
                                <CardDescription>View and download past statements</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded text-gray-500">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Statement - {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                                    <p className="text-xs text-gray-500">Available since {new Date(2024, i, 5).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadStatement(new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))}
                                            >
                                                <Download className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
