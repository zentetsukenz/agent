import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhaseEditor } from './PhaseEditor';
import { PhaseTimeline } from './PhaseTimeline';
import { LoadProfileGraph } from './LoadProfileGraph';
import { DEFAULT_PHASE, SCENARIO_MODES } from '@/utils/scenarioConstants';
import { Plus, Save, X, Layers, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ScenarioForm - Main form for creating/editing scenarios
 * 
 * @param {Object} initialData - Initial scenario data (for editing)
 * @param {Function} onSubmit - Called with form data when submitted
 * @param {Function} onCancel - Called when cancel button clicked
 * @param {boolean} isSubmitting - Whether form is being submitted
 * @param {string} submitLabel - Label for submit button (default: "Save Scenario")
 */
export const ScenarioForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Scenario',
}) => {
  // Form state for name/description
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  // Phases state (managed separately for complex array operations)
  const [phases, setPhases] = useState(
    initialData?.phases?.length > 0 
      ? initialData.phases 
      : [{ ...DEFAULT_PHASE, name: 'Phase 1' }]
  );

  // Mode state (simple vs workflow - workflow is Phase 3)
  const [mode] = useState(initialData?.mode || 'simple');

  // Selected phase for highlighting in visualizations
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(-1);

  // Phase validation errors
  const [phaseErrors, setPhaseErrors] = useState({});

  // Validate phases
  const validatePhases = useCallback(() => {
    const errors = {};
    let isValid = true;

    phases.forEach((phase, index) => {
      errors[index] = {};
      
      if (!phase.name?.trim()) {
        errors[index].name = 'Name is required';
        isValid = false;
      }
      
      if (!phase.duration || phase.duration < 1) {
        errors[index].duration = 'Duration must be at least 1 second';
        isValid = false;
      }
      
      if (phase.connections < 0) {
        errors[index].connections = 'Connections cannot be negative';
        isValid = false;
      }
    });

    setPhaseErrors(errors);
    return isValid;
  }, [phases]);

  // Handle phase change
  const handlePhaseChange = (index, updatedPhase) => {
    setPhases(prev => {
      const newPhases = [...prev];
      newPhases[index] = updatedPhase;
      return newPhases;
    });
    // Clear errors for this phase
    setPhaseErrors(prev => ({ ...prev, [index]: {} }));
  };

  // Add new phase
  const handleAddPhase = () => {
    const newPhase = {
      ...DEFAULT_PHASE,
      name: `Phase ${phases.length + 1}`,
    };
    setPhases(prev => [...prev, newPhase]);
  };

  // Delete phase
  const handleDeletePhase = (index) => {
    if (phases.length <= 1) return; // Keep at least one phase
    setPhases(prev => prev.filter((_, i) => i !== index));
    setSelectedPhaseIndex(-1);
  };

  // Move phase up
  const handleMovePhaseUp = (index) => {
    if (index <= 0) return;
    setPhases(prev => {
      const newPhases = [...prev];
      [newPhases[index - 1], newPhases[index]] = [newPhases[index], newPhases[index - 1]];
      return newPhases;
    });
    setSelectedPhaseIndex(index - 1);
  };

  // Move phase down
  const handleMovePhaseDown = (index) => {
    if (index >= phases.length - 1) return;
    setPhases(prev => {
      const newPhases = [...prev];
      [newPhases[index], newPhases[index + 1]] = [newPhases[index + 1], newPhases[index]];
      return newPhases;
    });
    setSelectedPhaseIndex(index + 1);
  };

  // Handle form submission
  const onFormSubmit = (formData) => {
    if (!validatePhases()) {
      return;
    }

    onSubmit({
      ...formData,
      mode,
      phases,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Give your scenario a descriptive name and purpose
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Scenario Name *</Label>
            <Input
              id="name"
              placeholder="e.g., API Stress Test, Checkout Flow Load Test"
              className={cn(errors.name && 'border-destructive')}
              {...register('name', { 
                required: 'Scenario name is required',
                maxLength: { value: 100, message: 'Name must be 100 characters or less' }
              })}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                A descriptive name to identify this scenario
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this scenario tests and when to use it..."
              rows={3}
              {...register('description', {
                maxLength: { value: 500, message: 'Description must be 500 characters or less' }
              })}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Optional: Help others understand the purpose of this test
              </p>
            )}
          </div>

          {/* Mode Display (Read-only for now - editable in Phase 3) */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {SCENARIO_MODES[mode]?.label || 'Simple'}
                </p>
                <p className="text-sm text-gray-500">
                  {SCENARIO_MODES[mode]?.description || SCENARIO_MODES.simple.description}
                </p>
              </div>
              {mode === 'simple' && (
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                  Workflow mode coming soon
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Load Profile
          </CardTitle>
          <CardDescription>
            Define how load changes over time with phases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Load Profile Graph */}
          <div className="space-y-2">
            <Label>Load Preview</Label>
            <LoadProfileGraph phases={phases} height={180} />
          </div>

          {/* Phase Timeline */}
          <div className="space-y-2">
            <Label>Phase Timeline</Label>
            <PhaseTimeline 
              phases={phases} 
              selectedIndex={selectedPhaseIndex}
              onSelectPhase={setSelectedPhaseIndex}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phases Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phases</CardTitle>
              <CardDescription>
                Configure each phase of your load test
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPhase}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {phases.map((phase, index) => (
            <PhaseEditor
              key={index}
              phase={phase}
              index={index}
              onChange={(updated) => handlePhaseChange(index, updated)}
              onDelete={() => handleDeletePhase(index)}
              onMoveUp={() => handleMovePhaseUp(index)}
              onMoveDown={() => handleMovePhaseDown(index)}
              canMoveUp={index > 0}
              canMoveDown={index < phases.length - 1}
              canDelete={phases.length > 1}
              errors={phaseErrors[index] || {}}
            />
          ))}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioForm;
