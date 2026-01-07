'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Package,
    MapPin,
    ShoppingBag,
    Clock,
    ArrowLeft,
    Shield,
    CheckCircle,
    XCircle,
    ExternalLink,
} from 'lucide-react';

interface CustomerDetails {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    email_verified: boolean;
    provider: string | null;
    image: string | null;
    created_at: string;
    last_login: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    address: any;
    stats: {
        order_count: number;
        total_spent: number;
        avg_order_value: number;
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
}

export default function CustomerDetailsPage() {
    const params = useParams();
    const customerId = params.id;

    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerId) {
            fetchCustomerDetails();
        }
    }, [customerId]);

    const fetchCustomerDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/customers/${customerId}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.details || `HTTP ${response.status}`);
            }

            setCustomer(data.customer);
            setOrders(data.recent_orders || []);
        } catch (err) {
            console.error('Error fetching customer details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getOrderStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            shipped: 'bg-purple-100 text-purple-800',
            cancelled: 'bg-red-100 text-red-800',
            payment_pending: 'bg-orange-100 text-orange-800',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'
                }`}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const handleAdminAction = async (action: string) => {
        // These are placeholder functions - they don't actually work
        // You would need to implement the backend API for these

        if (action === 'password_reset') {
            alert(`Password reset email functionality requires backend implementation.\n\nTo implement:\n1. Create API endpoint: POST /api/admin/customers/${customerId}/reset-password\n2. Generate reset token\n3. Send email using your email service`);
            return;
        }

        if (action === 'resend_verification') {
            alert(`Resend verification email functionality requires backend implementation.\n\nTo implement:\n1. Create API endpoint: POST /api/admin/customers/${customerId}/resend-verification\n2. Check if user is already verified\n3. Send verification email using your email service`);
            return;
        }

        if (action === 'send_message') {
            const message = prompt('Enter message to send to customer (this is a demo - no actual message will be sent):');
            if (message) {
                alert(`[DEMO] Message would be sent to ${customer?.email}:\n\n${message}\n\nTo implement:\n1. Create API endpoint: POST /api/admin/customers/${customerId}/send-message\n2. Integrate with email service or SMS gateway\n3. Log message in admin panel`);
            }
            return;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-500">Loading customer details...</div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center">
                    <Link
                        href="/admin/customers"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Customers
                    </Link>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="shrink-0">
                            <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error || 'Customer not found'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        href="/admin/customers"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-500">ID</div>
                    <div className="text-lg font-semibold text-gray-900">#{customer.id}</div>
                </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="h-20 w-20 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary" />
                        </div>

                        <div className="ml-6 flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {customer.name || customer.email.split('@')[0]}
                                        {customer.name && (
                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                ({customer.email.split('@')[0]})
                                            </span>
                                        )}
                                    </h2>

                                    <div className="flex items-center mt-1 space-x-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${customer.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                            {customer.role === 'admin' ? (
                                                <>
                                                    <Shield className="h-4 w-4 mr-1" />
                                                    Admin
                                                </>
                                            ) : (
                                                'Customer'
                                            )}
                                        </span>

                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.email_verified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {customer.email_verified ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Unverified
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                                        <div className="flex items-center text-gray-900">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                            {customer.email}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Phone Number</div>
                                        <div className="flex items-center text-gray-900">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            {customer.phone || 'Not provided'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Account Created</div>
                                        <div className="flex items-center text-gray-900">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                            {formatDate(customer.created_at)}
                                        </div>
                                    </div>

                                    {customer.last_login && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-500 mb-1">Last Login</div>
                                            <div className="flex items-center text-gray-900">
                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                {formatDate(customer.last_login)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {customer.address && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-2">Shipping Address</div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                                <div className="text-sm">
                                                    {customer.address.fullName && (
                                                        <div className="font-medium text-gray-900">{customer.address.fullName}</div>
                                                    )}
                                                    {customer.address.address && <div className="text-gray-700">{customer.address.address}</div>}
                                                    {(customer.address.city || customer.address.state) && (
                                                        <div className="text-gray-700">
                                                            {customer.address.city}
                                                            {customer.address.city && customer.address.state && ', '}
                                                            {customer.address.state}
                                                        </div>
                                                    )}
                                                    {customer.address.country && <div className="text-gray-700">{customer.address.country}</div>}
                                                    {customer.address.postalCode && <div className="text-gray-700">{customer.address.postalCode}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-600">Total Orders</div>
                            <div className="text-2xl font-bold text-gray-900">{customer.stats.order_count}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-600">Total Spent</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatCurrency(customer.stats.total_spent)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-600">Avg. Order Value</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatCurrency(customer.stats.avg_order_value)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <div>No orders found</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {order.order_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.items_count} item(s)
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getOrderStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}