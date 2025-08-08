'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentInfo {
  uuid: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const uuid = params.uuid as string;
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const description = searchParams.get('description');

  useEffect(() => {
    if (uuid && amount && currency && description) {
      setPaymentInfo({
        uuid,
        amount: parseFloat(amount),
        currency,
        description,
        status: 'PENDING'
      });
    }
    setLoading(false);
  }, [uuid, amount, currency, description]);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update payment status to COMPLETED (in a real app, this would call Yappy API)
    if (paymentInfo) {
      setPaymentInfo({ ...paymentInfo, status: 'COMPLETED' });
    }
    
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center glass-effect rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.192 2.5 1.731 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The payment link is invalid or has expired.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">Yappy Payment</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                paymentInfo.status === 'COMPLETED' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
              }`}>
                {paymentInfo.status}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="glass-effect rounded-2xl p-8 text-center">
            {paymentInfo.status === 'COMPLETED' ? (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Your payment has been processed successfully.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirm Payment</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Review your payment details below</p>
              </>
            )}

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${paymentInfo.amount} {paymentInfo.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Description:</span>
                  <span className="font-medium text-slate-900 dark:text-white text-right max-w-48 truncate">
                    {paymentInfo.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Payment ID:</span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {paymentInfo.uuid}
                  </span>
                </div>
              </div>
            </div>

            {paymentInfo.status === 'PENDING' && (
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed mb-4"
              >
                {processing ? 'Processing Payment...' : 'Pay with Yappy'}
              </button>
            )}

            <Link 
              href="/" 
              className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}