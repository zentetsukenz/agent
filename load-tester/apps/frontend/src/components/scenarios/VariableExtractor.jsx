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
import { EXTRACTOR_SOURCES, DEFAULT_EXTRACTOR } from '@/utils/scenarioConstants';
import { Plus, Trash2, Variable } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * VariableExtractor - Component for configuring variable extraction from responses
 * 
 * @param {Array} extractors - Array of extractor configurations
 * @param {Function} onChange - Called with updated extractors array
 * @param {Object} errors - Validation errors for extractors
 */
export const VariableExtractor = ({
  extractors = [],
  onChange,
  errors = {},
}) => {
  // Add new extractor
  const handleAdd = () => {
    onChange([...extractors, { ...DEFAULT_EXTRACTOR }]);
  };

  // Update extractor at index
  const handleChange = (index, field, value) => {
    const updated = extractors.map((ext, i) => 
      i === index ? { ...ext, [field]: value } : ext
    );
    onChange(updated);
  };

  // Remove extractor at index
  const handleRemove = (index) => {
    onChange(extractors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Variable className="w-4 h-4" />
          Extract Variables
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          className="h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Variable
        </Button>
      </div>

      {extractors.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No variables extracted. Click "Add Variable" to extract data from the response.
        </p>
      ) : (
        <div className="space-y-3">
          {extractors.map((extractor, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1 grid grid-cols-3 gap-2">
                {/* Variable Name */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Variable Name
                  </Label>
                  <Input
                    value={extractor.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="e.g., bookUid"
                    className={cn(
                      'h-8 text-sm',
                      errors[index]?.name && 'border-destructive'
                    )}
                  />
                  {errors[index]?.name && (
                    <p className="text-xs text-destructive">{errors[index].name}</p>
                  )}
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Source
                  </Label>
                  <Select
                    value={extractor.source}
                    onValueChange={(value) => handleChange(index, 'source', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXTRACTOR_SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Path (JSONata expression) */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {extractor.source === 'body' ? 'JSONata Path' : 'Name'}
                  </Label>
                  <Input
                    value={extractor.path}
                    onChange={(e) => handleChange(index, 'path', e.target.value)}
                    placeholder={
                      extractor.source === 'body' 
                        ? 'e.g., data.id or items[0].uid'
                        : extractor.source === 'header'
                        ? 'e.g., X-Request-Id'
                        : 'e.g., session_id'
                    }
                    className={cn(
                      'h-8 text-sm',
                      errors[index]?.path && 'border-destructive'
                    )}
                  />
                  {errors[index]?.path && (
                    <p className="text-xs text-destructive">{errors[index].path}</p>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-destructive shrink-0 mt-5"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {extractors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Extracted variables can be used in subsequent steps with {'{{variableName}}'} syntax.
        </p>
      )}
    </div>
  );
};

export default VariableExtractor;
