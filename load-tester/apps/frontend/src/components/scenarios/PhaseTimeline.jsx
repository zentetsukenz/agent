import { useMemo } from 'react';
import { getTotalDuration, formatDuration } from '@/services/scenarios';
import { PHASE_TYPE_COLORS } from '@/utils/scenarioConstants';
import { cn } from '@/lib/utils';

/**
 * PhaseTimeline - Visual timeline showing all phases with their durations
 * 
 * @param {Array} phases - Array of phase objects
 * @param {number} selectedIndex - Currently selected phase index (optional)
 * @param {Function} onSelectPhase - Called when a phase is clicked (optional)
 */
export const PhaseTimeline = ({ 
  phases = [], 
  selectedIndex = -1, 
  onSelectPhase = null,
}) => {
  const totalDuration = useMemo(() => getTotalDuration(phases), [phases]);

  if (!phases.length) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
        No phases defined. Add a phase to see the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timeline bar */}
      <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200">
        {phases.map((phase, index) => {
          const widthPercent = totalDuration > 0 
            ? (phase.duration / totalDuration) * 100 
            : 100 / phases.length;
          
          const colors = PHASE_TYPE_COLORS[phase.type] || PHASE_TYPE_COLORS.constant;
          const isSelected = index === selectedIndex;

          return (
            <div
              key={index}
              className={cn(
                'relative flex flex-col items-center justify-center transition-all cursor-pointer',
                colors.bg,
                isSelected && 'ring-2 ring-offset-1 ring-blue-500',
                onSelectPhase && 'hover:opacity-80'
              )}
              style={{ width: `${widthPercent}%` }}
              onClick={() => onSelectPhase?.(index)}
              role={onSelectPhase ? 'button' : undefined}
              tabIndex={onSelectPhase ? 0 : undefined}
              onKeyDown={(e) => {
                if (onSelectPhase && (e.key === 'Enter' || e.key === ' ')) {
                  onSelectPhase(index);
                }
              }}
            >
              <span className={cn('text-xs font-medium truncate px-1', colors.text)}>
                {phase.name || `Phase ${index + 1}`}
              </span>
              <span className={cn('text-[10px] opacity-75', colors.text)}>
                {formatDuration(phase.duration)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Phase details legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {phases.map((phase, index) => {
          const colors = PHASE_TYPE_COLORS[phase.type] || PHASE_TYPE_COLORS.constant;
          const isSelected = index === selectedIndex;
          
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-md transition-colors',
                isSelected && 'bg-blue-50',
                onSelectPhase && 'cursor-pointer hover:bg-gray-100'
              )}
              onClick={() => onSelectPhase?.(index)}
            >
              <div className={cn('w-3 h-3 rounded-sm', colors.bg)} />
              <span className="text-gray-700">
                {phase.name || `Phase ${index + 1}`}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">
                {phase.connections} conn
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">
                {formatDuration(phase.duration)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total duration summary */}
      <div className="text-sm text-gray-600 pt-1 border-t border-gray-100">
        Total duration: <span className="font-medium">{formatDuration(totalDuration)}</span>
        <span className="mx-2">·</span>
        Max connections: <span className="font-medium">{Math.max(...phases.map(p => p.connections))}</span>
      </div>
    </div>
  );
};

export default PhaseTimeline;
