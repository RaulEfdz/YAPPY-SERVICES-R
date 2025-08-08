import Link from 'next/link';

export default function DocumentationPage() {
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
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                Documentation
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Complete guide to integrating Yappy payments into your application
            </p>
          </div>

          {/* Overview */}
          <section className="glass-effect rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              This API enables secure Yappy payment processing with QR code generation and real-time status tracking. 
              All endpoints are protected by token-based authentication to ensure enterprise-grade security.
            </p>
          </section>

          {/* Authentication */}
          <section className="glass-effect rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Authentication
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All API requests must include an Authorization header with your security token:
            </p>
            <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-green-400 text-sm">
                Authorization: Bearer your_strong_internal_security_token
              </code>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Note:</strong> Replace <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">your_strong_internal_security_token</code> with your actual token from the environment variables.
              </p>
            </div>
          </section>

          {/* Endpoints */}
          <section className="glass-effect rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              API Endpoints
            </h2>

            {/* Create Payment */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mr-3">POST</span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Create Payment QR Code</h3>
              </div>
              
              <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 mb-4">
                <code className="text-blue-400">/api/yappy/create</code>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Headers</h4>
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4">
                    <code className="text-sm text-slate-300">
                      Content-Type: application/json<br/>
                      Authorization: Bearer your_strong_internal_security_token
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4">
                    <pre className="text-sm text-slate-300">
{`{
  "amount": 10.50,
  "description": "Payment for order #123"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Response</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    Returns the Yappy API response with payment details, including <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">uuid</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">hash</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Check Status */}
            <div className="mb-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium mr-3">POST</span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Check Payment Status</h3>
              </div>
              
              <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 mb-4">
                <code className="text-blue-400">/api/yappy/status</code>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Headers</h4>
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4">
                    <code className="text-sm text-slate-300">
                      Content-Type: application/json<br/>
                      Authorization: Bearer your_strong_internal_security_token
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Request Body</h4>
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4">
                    <pre className="text-sm text-slate-300">
{`{
  "uuid": "the-uuid-from-create-response"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Response</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Returns the current payment status and transaction details.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Postman Guide */}
          <section className="glass-effect rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Testing with Postman
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Environment Setup</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create environment variables in Postman for <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">SECURITY_TOKEN</code> with your actual token value.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Request Configuration</h3>
                  <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Set method to <strong>POST</strong></li>
                    <li>• Enter endpoint URL (localhost:3000 or your deployment URL)</li>
                    <li>• Add headers: Content-Type and Authorization</li>
                    <li>• Include JSON payload in request body</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Send Request</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Click <strong>Send</strong> to execute the API call and view the response.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <div className="text-center">
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
