import { Card, CardTitle, CardContent } from '../ui/Card';
import { formatNumber, formatLatency, formatBytes, formatPercentage } from '../../utils/formatters';

export const TestMetrics = ({ results }) => {
  if (!results) return null;

  return (
    <div className="space-y-6">
      {/* Request Statistics */}
      <Card>
        <CardTitle className="mb-4">Request Statistics</CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricItem
              label="Total Requests"
              value={formatNumber(results.requests?.total)}
            />
            <MetricItem
              label="Average RPS"
              value={formatNumber(results.requests?.average)}
            />
            <MetricItem
              label="Success Rate"
              value={formatPercentage(results.successRate)}
              valueColor={parseFloat(results.successRate) >= 95 ? 'text-green-600' : 'text-red-600'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Latency Metrics */}
      <Card>
        <CardTitle className="mb-4">Latency Distribution</CardTitle>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem label="Min" value={formatLatency(results.latency?.min)} />
            <MetricItem label="Mean" value={formatLatency(results.latency?.mean)} />
            <MetricItem label="Max" value={formatLatency(results.latency?.max)} />
            <MetricItem label="P50" value={formatLatency(results.latency?.p50)} />
            <MetricItem label="P90" value={formatLatency(results.latency?.p90)} />
            <MetricItem label="P95" value={formatLatency(results.latency?.p95)} />
            <MetricItem label="P99" value={formatLatency(results.latency?.p99)} />
          </div>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card>
        <CardTitle className="mb-4">Throughput</CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricItem
              label="Average"
              value={formatBytes(results.throughput?.average) + '/s'}
            />
            <MetricItem
              label="Total"
              value={formatBytes(results.throughput?.total)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {(results.errors > 0 || results.timeouts > 0) && (
        <Card>
          <CardTitle className="mb-4">Errors</CardTitle>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricItem
                label="Errors"
                value={formatNumber(results.errors)}
                valueColor="text-red-600"
              />
              <MetricItem
                label="Timeouts"
                value={formatNumber(results.timeouts)}
                valueColor="text-red-600"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MetricItem = ({ label, value, valueColor = 'text-gray-900' }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
};
