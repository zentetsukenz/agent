import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_TYPES, PHASE_TYPE_COLORS } from '@/utils/scenarioConstants';

/**
 * PhaseEditor - Form for editing a single load test phase
 * 
 * @param {Object} phase - The phase data
 * @param {number} index - Phase index (for display)
 * @param {Function} onChange - Called when phase data changes
 * @param {Function} onDelete - Called when delete button clicked
 * @param {Function} onMoveUp - Called when move up button clicked
 * @param {Function} onMoveDown - Called when move down button clicked
 * @param {boolean} canMoveUp - Whether the phase can be moved up
 * @param {boolean} canMoveDown - Whether the phase can be moved down
 * @param {boolean} canDelete - Whether the phase can be deleted (need at least 1)
 * @param {Object} errors - Validation errors for this phase
 */
export const PhaseEditor = ({
  phase,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  canDelete = true,
  errors = {},
}) => {
  const [localPhase, setLocalPhase] = useState(phase);

  // Sync with parent when phase prop changes
  useEffect(() => {
    setLocalPhase(phase);
  }, [phase]);

  // Handle field changes
  const handleChange = (field, value) => {
    const updated = { ...localPhase, [field]: value };
    setLocalPhase(updated);
    onChange(updated);
  };

  // Handle numeric input changes with validation
  const handleNumericChange = (field, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      handleChange(field, numValue);
    } else if (value === '') {
      handleChange(field, 0);
    }
  };

  // Get color based on phase type
  const getPhaseTypeColor = (type) => {
    return PHASE_TYPE_COLORS[type]?.border || 'border-l-gray-300';
  };

  return (
    <Card className={cn('border-l-4 transition-colors', getPhaseTypeColor(localPhase.type))}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <CardTitle className="text-base font-medium">
              Phase {index + 1}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
              disabled={!canDelete}
              title="Delete phase"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase Name */}
          <div className="space-y-2">
            <Label htmlFor={`phase-${index}-name`}>Name *</Label>
            <Input
              id={`phase-${index}-name`}
              value={localPhase.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Ramp Up"
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Phase Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={localPhase.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger className={cn(errors.type && 'border-destructive')}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PHASE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor={`phase-${index}-duration`}>Duration (seconds) *</Label>
            <Input
              id={`phase-${index}-duration`}
              type="number"
              min="1"
              value={localPhase.duration}
              onChange={(e) => handleNumericChange('duration', e.target.value)}
              className={cn(errors.duration && 'border-destructive')}
            />
            {errors.duration && (
              <p className="text-xs text-destructive">{errors.duration}</p>
            )}
          </div>

          {/* Connections */}
          <div className="space-y-2">
            <Label htmlFor={`phase-${index}-connections`}>
              {localPhase.type === 'ramp' ? 'Target Connections *' : 'Connections *'}
            </Label>
            <Input
              id={`phase-${index}-connections`}
              type="number"
              min="0"
              value={localPhase.connections}
              onChange={(e) => handleNumericChange('connections', e.target.value)}
              className={cn(errors.connections && 'border-destructive')}
            />
            {errors.connections && (
              <p className="text-xs text-destructive">{errors.connections}</p>
            )}
          </div>
        </div>

        {/* Phase Type Description */}
        <div className="mt-3 text-sm text-muted-foreground">
          {localPhase.type === 'ramp' && (
            <span>Gradually transition to {localPhase.connections} connections over {localPhase.duration}s</span>
          )}
          {localPhase.type === 'constant' && (
            <span>Maintain {localPhase.connections} connections for {localPhase.duration}s</span>
          )}
          {localPhase.type === 'spike' && (
            <span>Spike to {localPhase.connections} connections, then maintain for {localPhase.duration}s</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhaseEditor;
