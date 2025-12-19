import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = {
  success: '#10b981',
  error: '#ef4444',
  timeout: '#f59e0b',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
};

export default function ResultsChart({ results }) {
  const [chartType, setChartType] = useState('latency');

  if (!results) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No test results to visualize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for different chart types
  const latencyData = [
    { name: 'Min', value: results.latency?.min || 0 },
    { name: 'P50', value: results.latency?.p50 || 0 },
    { name: 'P90', value: results.latency?.p90 || 0 },
    { name: 'P95', value: results.latency?.p95 || 0 },
    { name: 'P99', value: results.latency?.p99 || 0 },
    { name: 'Max', value: results.latency?.max || 0 },
  ];

  const successData = [
    { 
      name: 'Successful', 
      value: results.requests?.total - (results.errors || 0) - (results.timeouts || 0) || 0 
    },
    { name: 'Errors', value: results.errors || 0 },
    { name: 'Timeouts', value: results.timeouts || 0 },
  ];

  const requestsData = [
    { name: 'Total', value: results.requests?.total || 0 },
    { name: 'Average', value: results.requests?.average || 0 },
    { name: 'Sent', value: results.requests?.sent || 0 },
  ];

  const throughputData = [
    { name: 'Average (bytes/sec)', value: results.throughput?.average || 0 },
    { name: 'Total (bytes)', value: results.throughput?.total || 0 },
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'latency':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)} ms`} />
              <Legend />
              <Bar dataKey="value" fill={COLORS.primary} name="Latency (ms)" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'success':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {successData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Successful' 
                        ? COLORS.success 
                        : entry.name === 'Errors' 
                        ? COLORS.error 
                        : COLORS.timeout
                    } 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'requests':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS.secondary} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'throughput':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                name="Throughput"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Test Results Visualization
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChartType('latency')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'latency'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Latency
            </button>
            <button
              onClick={() => setChartType('success')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'success'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Success Rate
            </button>
            <button
              onClick={() => setChartType('requests')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => setChartType('throughput')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                chartType === 'throughput'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Throughput
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          {renderChart()}
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Success Rate</p>
            <p className="text-xl font-bold text-emerald-600">
              {results.successRate || 0}%
            </p>
          </div>
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Avg Latency</p>
            <p className="text-xl font-bold text-blue-600">
              {(results.latency?.mean || 0).toFixed(2)} ms
            </p>
          </div>
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Requests</p>
            <p className="text-xl font-bold text-purple-600">
              {(results.requests?.total || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Errors</p>
            <p className="text-xl font-bold text-red-600">
              {results.errors || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
