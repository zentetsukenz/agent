import { useMemo } from 'react';
import { TestStatusBadge } from './TestStatusBadge';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';

export const TestComparison = ({ tests, onClose }) => {
  const comparisonData = useMemo(() => {
    return tests.map(test => {
      const results = test.results ? JSON.parse(test.results) : null;
      return {
        ...test,
        parsedResults: results,
        successRate: results ? ((results.summary.successfulRequests / results.summary.totalRequests) * 100).toFixed(2) : 'N/A',
        avgLatency: results?.summary.avgLatency ? results.summary.avgLatency.toFixed(2) : 'N/A',
        throughput: results?.summary.requestsPerSecond ? results.summary.requestsPerSecond.toFixed(2) : 'N/A',
      };
    });
  }, [tests]);

  const getComparisonColor = (values, index) => {
    if (values.every(v => v === 'N/A')) return 'text-gray-900';
    
    const numericValues = values
      .map((v, i) => ({ value: parseFloat(v), index: i }))
      .filter(v => !isNaN(v.value));
    
    if (numericValues.length === 0) return 'text-gray-900';
    
    const maxValue = Math.max(...numericValues.map(v => v.value));
    const minValue = Math.min(...numericValues.map(v => v.value));
    
    const currentValue = parseFloat(values[index]);
    if (isNaN(currentValue)) return 'text-gray-900';
    
    if (currentValue === maxValue) return 'text-green-600 font-semibold';
    if (currentValue === minValue) return 'text-red-600';
    return 'text-gray-900';
  };

  const getInverseComparisonColor = (values, index) => {
    if (values.every(v => v === 'N/A')) return 'text-gray-900';
    
    const numericValues = values
      .map((v, i) => ({ value: parseFloat(v), index: i }))
      .filter(v => !isNaN(v.value));
    
    if (numericValues.length === 0) return 'text-gray-900';
    
    const maxValue = Math.max(...numericValues.map(v => v.value));
    const minValue = Math.min(...numericValues.map(v => v.value));
    
    const currentValue = parseFloat(values[index]);
    if (isNaN(currentValue)) return 'text-gray-900';
    
    if (currentValue === minValue) return 'text-green-600 font-semibold';
    if (currentValue === maxValue) return 'text-red-600';
    return 'text-gray-900';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Test Comparison</h2>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>

        <div className="p-6">
          {/* Test Overview */}
          <Card className="mb-6">
            <CardTitle className="mb-4">Test Overview</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Property</th>
                    {comparisonData.map((test, index) => (
                      <th key={test.id} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Test {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Endpoint</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{test.endpoint?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {test.endpoint?.url || 'N/A'}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Date</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(test.createdAt)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Status</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3">
                        <TestStatusBadge status={test.status} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Configuration Comparison */}
          <Card className="mb-6">
            <CardTitle className="mb-4">Configuration</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Setting</th>
                    {comparisonData.map((test, index) => (
                      <th key={test.id} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Test {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Duration</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.duration}s
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Connections</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.connections}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Target RPS</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.rps || 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Results Comparison */}
          <Card>
            <CardTitle className="mb-4">Performance Metrics</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metric</th>
                    {comparisonData.map((test, index) => (
                      <th key={test.id} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Test {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Total Requests</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => 
                        t.parsedResults?.summary.totalRequests || 'N/A'
                      );
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getComparisonColor(values.map(String), index)}`}>
                          {test.parsedResults?.summary.totalRequests || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Successful Requests</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => 
                        t.parsedResults?.summary.successfulRequests || 'N/A'
                      );
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getComparisonColor(values.map(String), index)}`}>
                          {test.parsedResults?.summary.successfulRequests || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Success Rate</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => t.successRate);
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getComparisonColor(values, index)}`}>
                          {test.successRate !== 'N/A' ? `${test.successRate}%` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Avg Latency</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => t.avgLatency);
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getInverseComparisonColor(values, index)}`}>
                          {test.avgLatency !== 'N/A' ? `${test.avgLatency}ms` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Throughput (RPS)</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => t.throughput);
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getComparisonColor(values, index)}`}>
                          {test.throughput !== 'N/A' ? `${test.throughput} req/s` : 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Min Latency</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.parsedResults?.summary.minLatency?.toFixed(2) || 'N/A'} ms
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Max Latency</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.parsedResults?.summary.maxLatency?.toFixed(2) || 'N/A'} ms
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">P95 Latency</td>
                    {comparisonData.map(test => (
                      <td key={test.id} className="px-4 py-3 text-sm text-gray-900">
                        {test.parsedResults?.summary.p95Latency?.toFixed(2) || 'N/A'} ms
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Failed Requests</td>
                    {comparisonData.map((test, index) => {
                      const values = comparisonData.map(t => 
                        t.parsedResults?.summary.failedRequests || 'N/A'
                      );
                      return (
                        <td key={test.id} className={`px-4 py-3 text-sm ${getInverseComparisonColor(values.map(String), index)}`}>
                          {test.parsedResults?.summary.failedRequests || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-6 text-sm text-gray-600">
            <p><span className="text-green-600 font-semibold">●</span> Best value</p>
            <p><span className="text-red-600">●</span> Worst value</p>
          </div>
        </div>
      </div>
    </div>
  );
};
