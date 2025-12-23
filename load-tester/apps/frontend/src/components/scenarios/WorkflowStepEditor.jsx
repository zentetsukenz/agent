import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { VariableExtractor } from './VariableExtractor';
import { VariableAutocomplete } from './VariableAutocomplete';
import { HTTP_METHODS, METHOD_COLORS } from '@/utils/scenarioConstants';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Settings2,
  ChevronDown,
  ChevronRight,
  Repeat,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * WorkflowStepEditor - Component for editing a workflow step
 * 
 * @param {Object} step - The step data
 * @param {number} index - Step index in the array
 * @param {Function} onChange - Called with updated step
 * @param {Function} onDelete - Called when delete is clicked
 * @param {Function} onMoveUp - Called when move up is clicked
 * @param {Function} onMoveDown - Called when move down is clicked
 * @param {boolean} canMoveUp - Whether step can move up
 * @param {boolean} canMoveDown - Whether step can move down
 * @param {boolean} canDelete - Whether step can be deleted
 * @param {Object} errors - Validation errors
 * @param {Array} availableVariables - Variables available for autocomplete
 */
export const WorkflowStepEditor = ({
  step,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  canDelete = true,
  errors = {},
  availableVariables = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const methodColors = METHOD_COLORS[step.method] || METHOD_COLORS.GET;

  // Handle field change
  const handleChange = (field, value) => {
    onChange({ ...step, [field]: value });
  };

  // Handle headers as JSON object
  const handleHeadersChange = (value) => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      handleChange('headers', parsed);
    } catch {
      handleChange('headersRaw', value);
    }
  };

  // Get headers display value
  const getHeadersValue = () => {
    if (step.headersRaw !== undefined) {
      return step.headersRaw;
    }
    if (step.headers && Object.keys(step.headers).length > 0) {
      return JSON.stringify(step.headers, null, 2);
    }
    return '';
  };

  return (
    <div 
      className={cn(
        'border rounded-lg bg-white transition-shadow',
        'border-l-4',
        methodColors.border,
        step.runOnce ? 'bg-blue-50/50' : '',
        'hover:shadow-md'
      )}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3 p-4">
        {/* Step Number */}
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
          step.runOnce ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        )}>
          {index + 1}
        </div>

        {/* Method Badge */}
        <span className={cn(
          'px-2 py-1 rounded text-xs font-mono font-medium shrink-0',
          methodColors.bg,
          methodColors.text
        )}>
          {step.method}
        </span>

        {/* RunOnce/Loop Indicator */}
        <span className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-xs shrink-0',
          step.runOnce 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-green-100 text-green-700'
        )}>
          {step.runOnce ? (
            <>
              <Play className="w-3 h-3" />
              Once
            </>
          ) : (
            <>
              <Repeat className="w-3 h-3" />
              Loop
            </>
          )}
        </span>

        {/* Step Name */}
        <Input
          value={step.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Step name (e.g., Create Transaction)"
          className={cn(
            'flex-1 h-8',
            errors.name && 'border-destructive'
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-8 w-8 p-0"
            title="Move up"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-8 w-8 p-0"
            title="Move down"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={!canDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-destructive"
            title="Delete step"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4 space-y-4">
        {/* Run Once Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Execution Mode</Label>
            <p className="text-xs text-muted-foreground">
              {step.runOnce 
                ? 'Runs once per connection at start, then skipped during load test loops'
                : 'Runs continuously in loop during load test'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs',
              !step.runOnce && 'font-medium'
            )}>
              Loop
            </span>
            <Switch
              checked={step.runOnce}
              onCheckedChange={(checked) => handleChange('runOnce', checked)}
            />
            <span className={cn(
              'text-xs',
              step.runOnce && 'font-medium'
            )}>
              Once
            </span>
          </div>
        </div>

        {/* Method and Path Row */}
        <div className="flex gap-3">
          <div className="w-28 shrink-0">
            <Label className="text-xs text-muted-foreground mb-1 block">Method</Label>
            <Select
              value={step.method}
              onValueChange={(value) => handleChange('method', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <span className={cn(
                      'font-mono text-sm',
                      METHOD_COLORS[method.value]?.text
                    )}>
                      {method.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Path</Label>
            <VariableAutocomplete
              value={step.path}
              onChange={(value) => handleChange('path', value)}
              variables={availableVariables}
              placeholder="/api/resource or /api/items/{{id}}"
              className={cn('h-9', errors.path && 'border-destructive')}
            />
            {errors.path && (
              <p className="text-xs text-destructive mt-1">{errors.path}</p>
            )}
          </div>
        </div>

        {/* Request Body (for POST, PUT, PATCH) */}
        {['POST', 'PUT', 'PATCH'].includes(step.method) && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Request Body (JSON)</Label>
            <VariableAutocomplete
              value={step.body || ''}
              onChange={(value) => handleChange('body', value)}
              variables={availableVariables}
              multiline
              placeholder='{"key": "value", "uid": "{{bookUid}}"}'
              className="font-mono text-sm min-h-20"
              rows={3}
            />
          </div>
        )}

        {/* Variable Extraction */}
        <VariableExtractor
          extractors={step.extractors || []}
          onChange={(extractors) => handleChange('extractors', extractors)}
          errors={errors.extractors || {}}
        />

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <Settings2 className="w-3 h-3 mr-1" />
              Advanced Settings
              {showAdvanced ? (
                <ChevronDown className="w-3 h-3 ml-1" />
              ) : (
                <ChevronRight className="w-3 h-3 ml-1" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {/* Headers */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Headers (JSON)</Label>
              <Textarea
                value={getHeadersValue()}
                onChange={(e) => handleHeadersChange(e.target.value)}
                placeholder='{"Authorization": "Bearer {{token}}"}'
                className="font-mono text-sm"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Custom headers as JSON object
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Validation Errors Summary */}
      {errors.name && (
        <div className="px-4 pb-3">
          <p className="text-xs text-destructive">{errors.name}</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowStepEditor;
