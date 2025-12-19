import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { formatNumber, formatLatency, formatBytes, formatPercentage } from '../../utils/formatters';

const MetricItem = ({ label, value, valueColor = 'text-gray-900', icon, subtext }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-gray-300">{icon}</div>}
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children }) => (
  <Card>
    <CardTitle icon={icon} className="mb-4">{title}</CardTitle>
    <CardContent>{children}</CardContent>
  </Card>
);

export const TestMetrics = ({ results }) => {
  if (!results) return null;

  const successRate = parseFloat(results.successRate) || 0;

  return (
    <div className="space-y-6">
      {/* Request Statistics */}
      <SectionCard 
        title="Request Statistics"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricItem
            label="Total Requests"
            value={formatNumber(results.requests?.total)}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            }
          />
          <MetricItem
            label="Requests/Second"
            value={formatNumber(results.requests?.average)}
            subtext="Average RPS"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <MetricItem
            label="Success Rate"
            value={formatPercentage(results.successRate)}
            valueColor={successRate >= 99 ? 'text-emerald-600' : successRate >= 95 ? 'text-amber-600' : 'text-red-600'}
            subtext={successRate >= 99 ? 'Excellent' : successRate >= 95 ? 'Good' : 'Needs attention'}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </SectionCard>

      {/* Latency Metrics */}
      <SectionCard 
        title="Latency Distribution"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricItem label="Min" value={formatLatency(results.latency?.min)} />
          <MetricItem label="Mean" value={formatLatency(results.latency?.mean)} />
          <MetricItem label="Max" value={formatLatency(results.latency?.max)} />
          <MetricItem label="Std Dev" value={formatLatency(results.latency?.stddev)} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Percentiles</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricItem label="P50" value={formatLatency(results.latency?.p50)} subtext="50th percentile" />
            <MetricItem label="P90" value={formatLatency(results.latency?.p90)} subtext="90th percentile" />
            <MetricItem label="P95" value={formatLatency(results.latency?.p95)} subtext="95th percentile" />
            <MetricItem label="P99" value={formatLatency(results.latency?.p99)} subtext="99th percentile" />
          </div>
        </div>
      </SectionCard>

      {/* Throughput */}
      <SectionCard 
        title="Throughput"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricItem
            label="Average Throughput"
            value={formatBytes(results.throughput?.average) + '/s'}
            subtext="Bytes per second"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <MetricItem
            label="Total Data Transferred"
            value={formatBytes(results.throughput?.total)}
            subtext="Total bytes"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
        </div>
      </SectionCard>

      {/* Errors */}
      {(results.errors > 0 || results.timeouts > 0) && (
        <SectionCard 
          title="Errors & Issues"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricItem
              label="Connection Errors"
              value={formatNumber(results.errors)}
              valueColor="text-red-600"
              icon={
                <svg className="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MetricItem
              label="Timeouts"
              value={formatNumber(results.timeouts)}
              valueColor="text-amber-600"
              icon={
                <svg className="w-8 h-8 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
};
