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
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No test results to visualize</p>
      </div>
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Test Results Visualization</h3>
        <div className="flex gap-2">
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

      <div className="mt-4">
        {renderChart()}
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-xl font-bold text-green-600">
            {results.successRate || 0}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Avg Latency</p>
          <p className="text-xl font-bold text-blue-600">
            {(results.latency?.mean || 0).toFixed(2)} ms
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-xl font-bold text-purple-600">
            {(results.requests?.total || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Errors</p>
          <p className="text-xl font-bold text-red-600">
            {results.errors || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
