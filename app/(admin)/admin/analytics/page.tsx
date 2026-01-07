//app/(admin)/admin/analytics/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
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
} from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  newCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  salesChart: Array<{
    date: string;
    revenue: number;
    order_count: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity_sold: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    revenue: number;
    order_count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#8B5A2B', '#D4A76A', '#F5DEB3', '#8B4513', '#A0522D', '#CD853F'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-red-600">
        {error || 'Failed to load analytics data'}
      </div>
    );
  }

  // Calculate total revenue for percentage calculation
  const totalRevenue = data.categoryDistribution.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

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
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">
              +{formatCurrency(data.todayRevenue)} today
            </span>
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
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{data.todayOrders} today</span>
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
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{data.newCustomers} new</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(data.averageOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500 bg-opacity-10 rounded-full">
              <Activity className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Conversion: {data.conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1 text-sm rounded-md ${chartType === 'revenue'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('orders')}
                className={`px-3 py-1 text-sm rounded-md ${chartType === 'orders'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Orders
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => chartType === 'revenue' ? `₦${(value / 1000).toFixed(0)}k` : value.toString()}
                />
                <Tooltip
                  formatter={(value: any) => [
                    chartType === 'revenue' ? formatCurrency(Number(value)) : value,
                    chartType === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-NG', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartType === 'revenue' ? 'revenue' : 'order_count'}
                  stroke="#8B5A2B"
                  strokeWidth={2}
                  dot={{ stroke: '#8B5A2B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name={chartType === 'revenue' ? 'Revenue' : 'Orders'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {data.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-primary bg-opacity-10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-37.5">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.quantity_sold} sold
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Orders by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [value, 'Orders']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Category: ${label}`;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="order_count" fill="#8B5A2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Performance Summary</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                <span>
                  Average daily revenue: {formatCurrency(data.totalRevenue / 30)}
                </span>
              </li>
              <li className="flex items-start">
                <ShoppingBag className="h-4 w-4 text-blue-500 mr-2 mt-0.5 shrink-0" />
                <span>
                  Average orders per day: {(data.totalOrders / 30).toFixed(1)}
                </span>
              </li>
              <li className="flex items-start">
                <Users className="h-4 w-4 text-purple-500 mr-2 mt-0.5 shrink-0" />
                <span>
                  Customer growth rate: {data.totalCustomers > 0
                    ? ((data.newCustomers / data.totalCustomers) * 100).toFixed(1)
                    : 0
                  }%
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <BarChart3 className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                <span>
                  Focus on promoting top-performing products to increase revenue
                </span>
              </li>
              <li className="flex items-start">
                <PieChart className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                <span>
                  Consider expanding popular categories based on customer demand
                </span>
              </li>
              <li className="flex items-start">
                <Activity className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                <span>
                  Monitor conversion rate and optimize checkout process if needed
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}