'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PaymentResult {
  uuid: string;
  amount: number;
  description: string;
  status: string;
  currency: string;
  created_at: string;
  payment_date: string | null;
  cut_off_date: string;
  qr_code_data?: string;
}

export default function CreatePaymentPage() {
  const [amount, setAmount] = useState('1.00');
  const [description, setDescription] = useState('Test payment - $1 USD');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string>('');

  const createPayment = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Crear un pago en la base de datos local
      const paymentData = {
        uuid: `payment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        amount: parseFloat(amount),
        description,
        status: 'PENDING',
        currency: 'USD',
        created_at: new Date().toISOString(),
        payment_date: null,
        cut_off_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 horas
      };

      // Simular creación en la base de datos
      const response = await fetch('/api/internal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const data: PaymentResult = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error creating payment');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
              <span className="text-xl font-semibold text-slate-900 dark:text-white">Yappy API</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                Create Payment
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Create Test Payment
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Create a payment record that Yappy can query through the APIs
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment description"
                />
              </div>

              <button
                onClick={createPayment}
                disabled={loading}
                className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Payment...' : 'Create Payment'}
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    Payment Created Successfully!
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                      <p><strong>UUID:</strong> {result.uuid}</p>
                      <p><strong>Amount:</strong> ${result.amount} {result.currency}</p>
                      <p><strong>Status:</strong> {result.status}</p>
                      <p><strong>Description:</strong> {result.description}</p>
                    </div>
                    
                    {result.qr_code_data && (
                      <div className="flex flex-col items-center">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Payment QR Code
                        </h4>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <img 
                            src={result.qr_code_data} 
                            alt="Payment QR Code" 
                            className="w-32 h-32"
                          />
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                          Scan with Yappy app to pay
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> This payment is now available for Yappy to query through the integration APIs.
                      Yappy can access it via <code>/v1/movement/history</code> or <code>/v1/movement/{result.uuid}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
