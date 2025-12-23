import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatDuration, getTotalDuration, getMaxConnections } from '@/services/scenarios';

// Custom tooltip component (defined outside to avoid recreation on render)
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900">{data.phaseName}</p>
      <p className="text-sm text-gray-600">
        Time: {formatDuration(Math.round(data.time))}
      </p>
      <p className="text-sm text-blue-600 font-medium">
        {data.connections} connections
      </p>
    </div>
  );
};

/**
 * LoadProfileGraph - Area chart showing connections over time
 * 
 * @param {Array} phases - Array of phase objects
 * @param {number} height - Chart height in pixels (default: 200)
 * @param {boolean} showGrid - Whether to show grid lines (default: true)
 * @param {boolean} showTooltip - Whether to show tooltip on hover (default: true)
 */
export const LoadProfileGraph = ({ 
  phases = [], 
  height = 200,
  showGrid = true,
  showTooltip = true,
}) => {
  // Generate data points for the chart
  const chartData = useMemo(() => {
    if (!phases.length) return [];

    const data = [];
    let currentTime = 0;
    let prevConnections = 0;

    phases.forEach((phase, phaseIndex) => {
      const startTime = currentTime;
      const endTime = currentTime + phase.duration;
      const startConnections = prevConnections;
      const endConnections = phase.connections;

      // For ramp phases, create intermediate points for smooth transition
      if (phase.type === 'ramp') {
        // Add start point
        data.push({
          time: startTime,
          connections: startConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });

        // Add end point (will be connected smoothly by area chart)
        data.push({
          time: endTime,
          connections: endConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
      } else if (phase.type === 'spike') {
        // Spike: instant jump to connection level, then hold
        data.push({
          time: startTime,
          connections: startConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
        // Instant spike (same time, different connection)
        data.push({
          time: startTime + 0.5, // Tiny offset for visual spike
          connections: endConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
        data.push({
          time: endTime,
          connections: endConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
      } else {
        // Constant: instant transition to target, hold steady
        if (startConnections !== endConnections) {
          data.push({
            time: startTime,
            connections: startConnections,
            phaseName: phase.name || `Phase ${phaseIndex + 1}`,
            phaseIndex,
          });
        }
        data.push({
          time: startTime + 0.1, // Small offset for transition
          connections: endConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
        data.push({
          time: endTime,
          connections: endConnections,
          phaseName: phase.name || `Phase ${phaseIndex + 1}`,
          phaseIndex,
        });
      }

      currentTime = endTime;
      prevConnections = endConnections;
    });

    return data;
  }, [phases]);

  // Calculate phase boundaries for reference lines
  const phaseBoundaries = useMemo(() => {
    if (!phases.length) return [];
    
    const boundaries = [];
    let currentTime = 0;
    
    phases.forEach((phase, index) => {
      if (index > 0) {
        boundaries.push({
          time: currentTime,
          name: phase.name || `Phase ${index + 1}`,
        });
      }
      currentTime += phase.duration;
    });
    
    return boundaries;
  }, [phases]);

  const totalDuration = getTotalDuration(phases);
  const maxConnections = getMaxConnections(phases);

  if (!phases.length) {
    return (
      <div 
        className="border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        No phases defined. Add a phase to see the load profile.
      </div>
    );
  }

  // Format X axis label
  const formatXAxis = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          )}
          
          <XAxis
            dataKey="time"
            type="number"
            domain={[0, totalDuration]}
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          
          <YAxis
            domain={[0, Math.ceil(maxConnections * 1.1)]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={40}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {/* Phase boundary lines */}
          {phaseBoundaries.map((boundary, index) => (
            <ReferenceLine
              key={index}
              x={boundary.time}
              stroke="#d1d5db"
              strokeDasharray="4 4"
            />
          ))}
          
          <defs>
            <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          <Area
            type="linear"
            dataKey="connections"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorConnections)"
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoadProfileGraph;
