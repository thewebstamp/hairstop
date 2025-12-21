// app/admin/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  FileImage,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  product_slug: string;
  quantity: number;
  price: number;
  selected_length?: string;
  selected_color?: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

interface PaymentProof {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  status: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  payment_method: string;
  notes?: string;
  proof_of_payment_url?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment_proof: PaymentProof | null;
}

// Helper function to normalize status (convert to lowercase and handle spaces/underscores)
const normalizeStatus = (status: string): string => {
  return status.toLowerCase().replace(/\s+/g, '_');
};

// Status colors based on normalized status
const getStatusColor = (status: string): string => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'pending':
    case 'payment_pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Status icons based on normalized status
const getStatusIcon = (status: string): React.ReactNode => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'pending':
    case 'payment_pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // useParams() returns a Promise in App Router
    if (params && params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setOrderId(id);
    }
  }, [params]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      console.log('Fetching from URL:', `/api/admin/orders/${orderId}`);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      setOrder(data.order);
      setNewStatus(data.order.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || !orderId || newStatus === order.status) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Show success message
      alert('Order status updated successfully! Customer will be notified via email.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format status for display (capitalize and replace underscores)
  const formatStatusForDisplay = (status: string): string => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // Handle initial loading state
  if (loading && !orderId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">No order ID provided</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-600">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{formatStatusForDisplay(order.status)}</span>
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Last updated: {formatDate(order.updated_at)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Order Status
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === order.status}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Customer will receive an email notification when status changes.
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-start">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product_slug}`}
                          className="font-medium text-gray-900 hover:text-primary"
                          target="_blank"
                        >
                          {item.product_name}
                        </Link>
                        {(item.selected_length || item.selected_color) && (
                          <div className="mt-1 text-sm text-gray-500">
                            {item.selected_length && (
                              <span>Length: {item.selected_length}</span>
                            )}
                            {item.selected_length && item.selected_color && ' • '}
                            {item.selected_color && (
                              <span>Color: {item.selected_color}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Proof */}
          {(order.payment_proof || order.proof_of_payment_url) && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileImage className="h-5 w-5 mr-2" />
                  Payment Proof
                </h2>
              </div>
              <div className="p-6">
                {order.payment_proof ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{order.payment_proof.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(order.payment_proof.file_size)} • {order.payment_proof.file_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(order.payment_proof.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={order.payment_proof.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View File
                      </a>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      {order.payment_proof.file_type.startsWith('image/') ? (
                        <img
                          src={order.payment_proof.file_url}
                          alt="Payment proof"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <div className="p-8 text-center">
                          <FileImage className="h-16 w-16 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500">
                            Preview not available for this file type
                          </p>
                          <a
                            href={order.payment_proof.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block text-primary hover:underline"
                          >
                            Download file
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : order.proof_of_payment_url ? (
                  <div>
                    <a
                      href={order.proof_of_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Payment Proof
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer & Order Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="text-gray-900 hover:text-primary"
                    >
                      {order.customer_email}
                    </a>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-gray-900 hover:text-primary"
                      >
                        {order.customer_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.shipping_address.fullName}</p>
                      <p className="text-gray-600">{order.shipping_address.address}</p>
                      <p className="text-gray-600">
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                      <p className="text-gray-600">{order.shipping_address.country}</p>
                      {order.shipping_address.postalCode && (
                        <p className="text-gray-600">Postal Code: {order.shipping_address.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium capitalize">
                  {order.payment_method?.replace('_', ' ') || 'Bank Transfer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                  {formatStatusForDisplay(order.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}