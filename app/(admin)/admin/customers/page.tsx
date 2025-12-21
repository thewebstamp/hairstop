//app/(admin)/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Package,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  AlertCircle,
  RefreshCw,
  EyeIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
  order_count: number;
  total_spent: number;
  verification_token?: string | null;
  reset_token?: string | null;
  provider?: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchCustomers = async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      setCustomers(data.customers || []);
      setPagination(data.pagination || {
        page: page,
        limit: 20,
        total: data.customers?.length || 0,
        totalPages: 1,
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers(1);
  }, []);

  // Debounced search and filter updates
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchCustomers(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search, roleFilter, sortBy]);

  const handleRoleUpdate = async (customerId: number, newRole: string) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: customerId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Update customer in state
      setCustomers(customers.map(customer =>
        customer.id === customerId ? { ...customer, role: newRole } : customer
      ));

      alert('Role updated successfully!');
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err instanceof Error ? err.message : 'Failed to update role');
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
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysSinceLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';

    try {
      const lastLoginDate = new Date(lastLogin);
      if (isNaN(lastLoginDate.getTime())) return 'Never';

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return 'Never';
    }
  };

  const getDisplayName = (customer: Customer) => {
    if (customer.name) return customer.name;
    if (customer.email) return customer.email.split('@')[0];
    return 'Unnamed Customer';
  };

  // Calculate stats
  const totalCustomers = pagination.total;
  const activeToday = customers.filter(c => {
    if (!c.last_login) return false;
    try {
      const lastLoginDate = new Date(c.last_login);
      return lastLoginDate.toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  }).length;

  const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);

  const customersWithOrders = customers.filter(c => (c.order_count || 0) > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={() => fetchCustomers(1, true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Active Today</div>
          <div className="text-2xl font-bold text-green-600">{activeToday}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_spent">Highest Spent</option>
              <option value="most_orders">Most Orders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-gray-500">Loading customers...</div>
          </div>
        ) : error && customers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">Error loading customers</div>
            <button
              onClick={() => fetchCustomers(1, true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No customers found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getDisplayName(customer)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined {formatDate(customer.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900 mb-1">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-gray-500">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900 mb-1">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.order_count || 0} order(s)
                          </div>
                          <div className="flex items-center text-gray-900">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            {formatCurrency(customer.total_spent || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900 mb-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Joined {formatDate(customer.created_at)}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            Last active: {getDaysSinceLastLogin(customer.last_login)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${customer.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                            {customer.role === 'admin' ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              'Customer'
                            )}
                          </span>
                          {customer.provider && (
                            <div className="text-xs text-gray-500">
                              Via {customer.provider}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.totalPages} • {pagination.total} total customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchCustomers(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.page}
                    </span>
                    <button
                      onClick={() => fetchCustomers(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers by Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Customers by Revenue
          </h3>
          <div className="space-y-4">
            {customers
              .filter(c => (c.total_spent || 0) > 0)
              .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
              .slice(0, 5)
              .map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName(customer)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.order_count || 0} order(s)
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(customer.total_spent || 0)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Customer Signups
          </h3>
          <div className="space-y-4">
            {customers
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName(customer)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(customer.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${customer.email_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {customer.email_verified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}