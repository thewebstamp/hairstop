// app/(public)/checkout/payment/[orderId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getOrderDetails, uploadProofOfPayment } from '@/lib/checkout-actions';
import PaymentInstructions from './PaymentInstructions';
import UploadProofSection from './UploadProofSection';

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.orderId as string);

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [hasStartedPayment, setHasStartedPayment] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');

  // Restore from local storage on page load
  useEffect(() => {
    if (orderId) {
      const savedSession = localStorage.getItem(`payment_session_${orderId}`);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);

          setHasStartedPayment(sessionData.hasStartedPayment || false);
          setPaymentSessionId(sessionData.sessionId || '');

          if (sessionData.files && sessionData.files.length > 0) {
            console.log('Files found in localStorage, but they need to be re-uploaded');
          }
        } catch (error) {
          console.error('Error restoring session:', error);
        }
      }
    }
  }, [orderId]);

  // Save to local storage when state changes
  useEffect(() => {
    if (orderId) {
      const sessionData = {
        orderId,
        fileCount: uploadedFiles.length,
        hasStartedPayment,
        sessionId: paymentSessionId,
        timestamp: Date.now()
      };
      localStorage.setItem(`payment_session_${orderId}`, JSON.stringify(sessionData));
    }
  }, [orderId, uploadedFiles.length, hasStartedPayment, paymentSessionId]);

  useEffect(() => {
    async function loadOrder() {
      if (status === 'authenticated' && orderId) {
        setLoading(true);
        try {
          const orderData = await getOrderDetails(orderId);
          if (!orderData) {
            router.push('/orders');
            return;
          }

          if (orderData.status !== 'pending' && orderData.status !== 'payment_pending') {
            router.push(`/orders/${orderId}`);
            return;
          }

          setOrder(orderData);
        } catch (error) {
          console.error('Error loading order:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadOrder();
  }, [status, orderId, router]);

  const handleStartPayment = () => {
    setHasStartedPayment(true);
    const sessionId = `pay_${orderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setPaymentSessionId(sessionId);

    savePaymentAttempt(sessionId);
  };

  const savePaymentAttempt = async (sessionId: string) => {
    try {
      await fetch('/api/payment/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sessionId })
      });
    } catch (error) {
      console.error('Error saving payment session:', error);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmitProof = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one proof file');
      return;
    }

    setUploading(true);

    try {
      const file = uploadedFiles[0];
      console.log('Uploading payment proof for order:', order?.order_number || orderId);

      const base64Data = await convertFileToBase64(file);

      const payload = {
        fileData: base64Data,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        orderId: orderId
      };

      const response = await fetch('/api/upload/proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem(`payment_session_${orderId}`);

        alert(`✅ Payment proof uploaded successfully for order #${result.orderNumber}! 
      
Amount: ₦${result.totalAmount?.toLocaleString() || order?.total_amount.toLocaleString()}
Status: Payment Pending Verification
      
Our team will verify your payment within 1 min - 24 hours. You will receive an email confirmation.`);

        router.push(`/orders/${orderId}?payment_success=true`);

      } else {
        let errorMessage = result.error || 'Upload failed';

        if (errorMessage.includes('not found')) {
          errorMessage = `Order not found. Please check your order number and try again.`;
        } else if (errorMessage.includes('does not belong')) {
          errorMessage = `This order does not belong to your account.`;
        } else if (errorMessage.includes('already')) {
          errorMessage = `This order has already been processed.`;
        }

        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Upload error:', error);

      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('Trying debug fallback...');
          const file = uploadedFiles[0];

          const formData = new FormData();
          formData.append('file', file);
          formData.append('orderId', orderId.toString());

          const debugResponse = await fetch('/api/upload/debug', {
            method: 'POST',
            body: formData
          });

          const debugResult = await debugResponse.json();

          if (debugResult.success) {
            const updateResult = await uploadProofOfPayment(orderId, debugResult.fileUrl);

            if (updateResult.success) {
              localStorage.removeItem(`payment_session_${orderId}`);
              alert('✅ Proof uploaded successfully! (Debug mode)');
              router.push(`/orders/${orderId}?debug=true`);
              return;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);
        }
      }

      alert(`❌ ${error instanceof Error ? error.message : 'Failed to upload proof. Please try again.'}`);

    } finally {
      setUploading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file'));
        }
      };
      reader.onerror = reject;
    });
  };

  const handleMarkAsPaid = async () => {
    setUploading(true);

    try {
      const result = await uploadProofOfPayment(orderId, 'pending_review');

      if (result.success) {
        localStorage.removeItem(`payment_session_${orderId}`);
        router.push(`/orders/${orderId}?payment_marked=true`);
      } else {
        alert(result.error || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#800020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf9f6] to-[#f7e7ce]">
      <div className="container mx-auto max-w-350 px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with order info */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold font-heading text-[#800020]">Complete Payment</h1>
                    <p className="text-gray-600 mt-2">
                      Order #{order.order_number} • Total: <span className="font-bold text-[#800020]">₦{order.total_amount.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${hasStartedPayment ? 'bg-linear-to-r from-[#800020] to-[#a00030] text-white shadow-md' : 'bg-white text-gray-800 border border-gray-200'}`}>
                      1. Bank Details
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${hasStartedPayment ? 'bg-linear-to-r from-[#800020] to-[#a00030] text-white shadow-md' : 'bg-white text-gray-800 border border-gray-200'}`}>
                      2. Make Transfer
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${uploadedFiles.length > 0 ? 'bg-linear-to-r from-[#800020] to-[#a00030] text-white shadow-md' : 'bg-white text-gray-800 border border-gray-200'}`}>
                      3. Upload Proof
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-[#800020] to-[#a00030] rounded-full transition-all duration-500"
                      style={{ width: uploadedFiles.length > 0 ? '100%' : hasStartedPayment ? '66%' : '33%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Save & Exit Button */}
              <button
                onClick={() => router.push('/orders')}
                className="px-6 py-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 font-semibold rounded-xl border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex items-center justify-center whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Save & Exit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Instructions */}
            <div className="space-y-8">
              <PaymentInstructions
                bankDetails={{
                  accountNumber: '1028154357',
                  accountName: 'HAIR STOP',
                  bankName: 'UBA (United Bank for Africa)',
                }}
                amount={order.total_amount}
                orderNumber={order.order_number}
                hasStartedPayment={hasStartedPayment}
                onStartPayment={handleStartPayment}
              />

              {/* Return Reminder Banner */}
              {hasStartedPayment && (
                <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <div className="shrink-0 w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center text-xl mr-4">
                      🔔
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-800 text-lg mb-2">Remember to return!</h3>
                      <p className="text-blue-700">
                        After completing your bank transfer, come back here to upload your proof of payment.
                        Your progress is saved automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Upload Proof */}
            <div className="space-y-8">
              <UploadProofSection
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onSubmit={handleSubmitProof}
                onMarkAsPaid={handleMarkAsPaid}
                uploading={uploading}
                hasStartedPayment={hasStartedPayment}
              />

              {/* Session Info */}
              {paymentSessionId && (
                <div className="bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] border border-[#f5c8c8] rounded-2xl p-6">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 bg-[#800020] text-white rounded-full flex items-center justify-center text-sm mr-4">
                      💾
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 mb-2">Auto-save Enabled</div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>Payment session: <span className="font-mono text-xs bg-white px-2 py-1 rounded-lg">{paymentSessionId.slice(0, 16)}...</span></p>
                        <p>Your progress is saved locally. You can close this page and return later.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => router.push(`/orders/${orderId}`)}
                className="px-6 py-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-[#800020] font-semibold rounded-xl border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-md transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Order Details
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] text-gray-800 font-semibold rounded-xl border-2 border-[#f5c8c8] hover:border-[#800020]/30 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Bank Details
                </button>

                <button
                  onClick={() => {
                    const text = `Bank: UBA\nAccount: 1028154357\nName: HAIR STOP\nAmount: ₦${order.total_amount.toLocaleString()}\nReference: ${order.order_number}`;
                    navigator.clipboard.writeText(text);
                    alert('✅ Bank details copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-linear-to-r from-[#800020] to-[#a00030] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Bank Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}