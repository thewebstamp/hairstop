/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  TooltipProps,
} from 'recharts';

interface StatsData {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    item_count: number;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    image: string;
    total_sold: number;
    revenue: number;
  }>;
  salesChart: Array<{
    date: string;
    order_count: number;
    revenue: number;
  }>;
}

// Custom Tooltip components with correct typing
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
        <p className="text-sm font-medium text-gray-900">
          {label ? new Date(label).toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
          }) : ''}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Revenue' 
              ? new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                }).format(entry.value || 0)
              : entry.value || 0}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stats?range=${timeRange}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      setData(result.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const COLORS = ['#8B5A2B', '#D4A76A', '#F5DEB3', '#8B4513', '#A0522D', '#CD853F'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
        <button
          onClick={fetchStats}
          className="ml-4 text-sm text-red-500 hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        No data available
      </div>
    );
  }

  // Ensure salesChart data exists
  const chartData = data.salesChart || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of your store performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'sales'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <LineChartIcon className="h-4 w-4 inline mr-2" />
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'customers'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Customers
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-500 bg-opacity-10 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {data.todayRevenue > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={data.todayRevenue > 0 ? 'text-green-600' : 'text-red-600'}>
                    Today: {formatCurrency(data.todayRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.totalOrders}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 bg-opacity-10 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {data.todayOrders > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={data.todayOrders > 0 ? 'text-green-600' : 'text-red-600'}>
                    Today: {data.todayOrders} orders
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.totalCustomers}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 bg-opacity-10 rounded-full">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">
                    Active users
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.totalProducts}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 bg-opacity-10 rounded-full">
                  <Package className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-red-600">
                  {data.lowStockProducts} low stock
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Revenue Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5A2B"
                      fill="#8B5A2B"
                      fillOpacity={0.1}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Orders Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="order_count"
                      fill="#D4A76A"
                      radius={[4, 4, 0, 0]}
                      name="Orders"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Analytics Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Performance */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Monthly Performance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5A2B"
                      strokeWidth={2}
                      dot={{ stroke: '#8B5A2B', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="order_count"
                      stroke="#D4A76A"
                      strokeWidth={2}
                      dot={{ stroke: '#D4A76A', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Average Order Value</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      data.totalOrders > 0
                        ? data.totalRevenue / data.totalOrders
                        : 0
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Daily Average Revenue</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(chartData.length > 0 ? data.totalRevenue / chartData.length : 0)}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Monthly Growth</div>
                  <div className="text-xl font-bold text-green-600 mt-1">
                    +{formatCurrency(data.monthlyRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Top Performing Products
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.topProducts.map((product) => {
                    const maxRevenue = Math.max(...data.topProducts.map(p => p.revenue));
                    const percentage = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <tr key={product.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.total_sold}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(product.revenue)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Customer Overview
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Total Customers</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                      {data.totalCustomers}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">New This Month</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                      {/* Calculate new customers based on recent activity */}
                      {data.recentOrders.filter(order => 
                        new Date(order.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Customer Lifetime Value</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      data.totalCustomers > 0
                        ? data.totalRevenue / data.totalCustomers
                        : 0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Recent Customer Orders
              </h3>
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Order #{order.order_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}