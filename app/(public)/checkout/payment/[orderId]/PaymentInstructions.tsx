// app/(public)/checkout/payment/[orderId]/PaymentInstructions.tsx
'use client';

import { useState } from 'react';

interface PaymentInstructionsProps {
  bankDetails: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  amount: number;
  orderNumber: string;
  hasStartedPayment: boolean;
  onStartPayment: () => void;
}

export default function PaymentInstructions({
  bankDetails,
  amount,
  orderNumber,
  hasStartedPayment,
  onStartPayment
}: PaymentInstructionsProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 md:p-8 border border-[#f5c8c8]/30">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#800020]">Payment Instructions</h2>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-[#faf9f6] text-[#800020] font-semibold rounded-xl hover:bg-[#f7e7ce] transition-colors duration-300 flex items-center"
        >
          {showDetails ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Show
            </>
          )}
        </button>
      </div>
      
      {showDetails && (
        <div className="space-y-8">
          {/* Bank Details Card */}
          <div className="bg-linear-to-br from-[#faf9f6] to-[#f7e7ce] rounded-2xl overflow-hidden border border-[#f5c8c8]">
            <div className="bg-linear-to-r from-[#800020] to-[#a00030] p-4 md:p-5">
              <h3 className="font-bold text-white text-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Bank Transfer Details
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-sm text-gray-600 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-[#800020] rounded-full mr-2"></div>
                  Account Number
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-mono font-bold text-[#800020] tracking-wider">
                    {bankDetails.accountNumber}
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                    className="px-2 md:px-4 py-2 bg-linear-to-r from-[#800020] to-[#a00030] text-sm text-white rounded-xl hover:shadow-lg hover:shadow-[#800020]/20 transition-all duration-300 active:scale-95 font-semibold"
                  >
                    {copiedField === 'account' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-[#800020] rounded-full mr-2"></div>
                    Account Name
                  </div>
                  <div className="font-bold text-gray-800 text-lg flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                    {bankDetails.accountName}
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                      className="text-gray-400 hover:text-[#800020] transition-colors p-1 hover:bg-[#faf9f6] rounded-lg"
                      title="Copy name"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-[#800020] rounded-full mr-2"></div>
                    Bank Name
                  </div>
                  <div className="font-bold text-gray-800 text-lg bg-white p-3 rounded-xl border border-gray-200">
                    {bankDetails.bankName}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-linear-to-r from-[#f5c8c8]/30 to-[#f7e7ce]/30 rounded-xl border border-[#f5c8c8]">
                <div className="text-sm text-gray-600 mb-2">Amount to Transfer</div>
                <div className="font-bold text-2xl text-[#800020]">
                  ₦{amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-3">
                  <span className="font-medium">Reference:</span>
                  <div className="flex items-center mt-1">
                    <div className="font-mono bg-white px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-800">
                      {orderNumber}
                    </div>
                    <button
                      onClick={() => copyToClipboard(orderNumber, 'reference')}
                      className="ml-3 px-3 py-2 bg-[#800020] text-white rounded-xl hover:bg-[#a00030] transition-colors"
                      title="Copy reference"
                    >
                      {copiedField === 'reference' ? '✅' : '📋'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center">
              <div className="w-8 h-8 bg-[#800020] text-white rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Step-by-Step Guide:
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Copy the bank details above' },
                { step: 2, text: `Open your banking app and transfer ₦${amount.toLocaleString()}` },
                { step: 3, text: 'Take a screenshot of successful transfer' },
                { step: 4, text: 'Upload the screenshot or proof of payment' }
              ].map((item) => (
                <div key={item.step} className="flex items-start group hover:scale-[1.01] transition-transform duration-300">
                  <div className="shrink-0 w-8 h-8 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] text-[#800020] font-bold rounded-full flex items-center justify-center text-sm mr-4 group-hover:from-[#800020] group-hover:to-[#a00030] group-hover:text-white transition-all duration-300">
                    {item.step}
                  </div>
                  <span className="pt-1.5 text-gray-700 group-hover:text-gray-900 transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Start Payment Button */}
          {!hasStartedPayment && (
            <button
              onClick={onStartPayment}
              className="w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
            >
              <span className="mr-3 text-xl">✅</span>
              I&apos;ve Started the Bank Transfer
            </button>
          )}
          
          {hasStartedPayment && (
            <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg mr-3">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-emerald-800">Payment started!</div>
                  <p className="text-emerald-700 text-sm">You can now upload proof</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Important Notes */}
          <div className="p-4 bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <div className="shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                ⚠️
              </div>
              <div>
                <h4 className="font-bold text-red-800 mb-2">Important Notes:</h4>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                    Transfer the <strong className="mx-1">exact amount</strong> shown above
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                    Keep your transfer receipt/screenshot
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                    Upload proof immediately after transfer
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 shrink-0"></div>
                    Your order will process after verification (1min - 24 hrs)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}