import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatLatency, formatBytes, formatPercentage } from '../../utils/formatters';
import { Clock, Activity, Zap, AlertTriangle } from 'lucide-react';

/**
 * Display a single metric with label and value
 */
const MetricCell = ({ label, value, subValue }) => (
  <div className="text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold text-foreground">{value}</p>
    {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
  </div>
);

/**
 * Display results for a single phase
 */
const PhaseRow = ({ phase, index }) => {
  const totalRequests = phase.requests?.total || 0;
  const errors = (phase.errors || 0) + (phase.timeouts || 0);
  const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
  const hasErrors = errors > 0;

  return (
    <div className="border rounded-lg p-4 bg-card" data-testid={`phase-result-${index}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Phase {index + 1}
          </Badge>
          <h4 className="font-medium text-foreground">{phase.phaseName}</h4>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="w-4 h-4" />
          <span>{formatNumber(phase.duration)}s</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Requests */}
        <MetricCell
          label="Requests"
          value={formatNumber(totalRequests)}
          subValue={`${formatNumber(phase.requests?.average || 0)}/sec`}
        />

        {/* Mean Latency */}
        <MetricCell
          label="Mean Latency"
          value={formatLatency(phase.latency?.mean)}
        />

        {/* P95 Latency */}
        <MetricCell
          label="P95 Latency"
          value={formatLatency(phase.latency?.p95)}
        />

        {/* P99 Latency */}
        <MetricCell
          label="P99 Latency"
          value={formatLatency(phase.latency?.p99)}
        />

        {/* Throughput */}
        <MetricCell
          label="Throughput"
          value={formatBytes(phase.throughput?.average || 0)}
          subValue="/sec"
        />

        {/* Errors */}
        <MetricCell
          label="Errors"
          value={
            <span className={hasErrors ? 'text-red-600' : 'text-green-600'}>
              {formatNumber(errors)}
            </span>
          }
          subValue={hasErrors ? `${formatPercentage(errorRate)} error rate` : 'No errors'}
        />
      </div>
    </div>
  );
};

/**
 * PhaseResultsCard Component
 * Displays phase-by-phase results for scenario-based load tests
 * 
 * @param {Object} props
 * @param {Array} props.phaseResults - Array of phase result objects
 */
export const PhaseResultsCard = ({ phaseResults }) => {
  if (!phaseResults || phaseResults.length === 0) {
    return null;
  }

  return (
    <Card data-testid="phase-results-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity aria-hidden="true" className="w-5 h-5" />
          Phase Results
          <Badge variant="secondary" className="ml-2">
            {phaseResults.length} {phaseResults.length === 1 ? 'phase' : 'phases'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phaseResults.map((phase, index) => (
            <PhaseRow key={phase.phaseName || index} phase={phase} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseResultsCard;
