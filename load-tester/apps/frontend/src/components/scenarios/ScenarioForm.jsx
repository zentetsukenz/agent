import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhaseEditor } from './PhaseEditor';
import { PhaseTimeline } from './PhaseTimeline';
import { LoadProfileGraph } from './LoadProfileGraph';
import { SetupStepEditor } from './SetupStepEditor';
import { WorkflowStepEditor } from './WorkflowStepEditor';
import { 
  DEFAULT_PHASE, 
  SCENARIO_MODES, 
  DEFAULT_SETUP_STEP,
  DEFAULT_WORKFLOW_STEP,
  ERROR_HANDLING_OPTIONS,
} from '@/utils/scenarioConstants';
import { 
  Plus, 
  Save, 
  X, 
  Layers, 
  BarChart3, 
  Settings, 
  Workflow,
  PlayCircle,
  Trash,
} from 'lucide-react';
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

  // Mode state (simple vs workflow)
  const [mode, setMode] = useState(initialData?.mode || 'simple');

  // Workflow state - setup, workflow, and teardown steps
  const [setupSteps, setSetupSteps] = useState(
    initialData?.setup?.length > 0 ? initialData.setup : []
  );
  const [workflowSteps, setWorkflowSteps] = useState(
    initialData?.workflow?.length > 0 ? initialData.workflow : []
  );
  const [teardownSteps, setTeardownSteps] = useState(
    initialData?.teardown?.length > 0 ? initialData.teardown : []
  );

  // Error handling configuration
  const [setupErrorHandling, setSetupErrorHandling] = useState(
    initialData?.setupErrorHandling || 'abort'
  );
  const [setupRetryCount, setSetupRetryCount] = useState(
    initialData?.setupRetryCount || 3
  );
  const [teardownErrorHandling, setTeardownErrorHandling] = useState(
    initialData?.teardownErrorHandling || 'ignore'
  );
  const [teardownRetryCount, setTeardownRetryCount] = useState(
    initialData?.teardownRetryCount || 3
  );

  // Selected phase for highlighting in visualizations
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(-1);

  // Phase validation errors
  const [phaseErrors, setPhaseErrors] = useState({});

  // Step validation errors
  const [setupErrors, setSetupErrors] = useState({});
  const [workflowErrors, setWorkflowErrors] = useState({});
  const [teardownErrors, setTeardownErrors] = useState({});

  // Compute available variables based on setup and workflow steps
  const availableVariables = useMemo(() => {
    const variables = [];
    
    // Variables from setup steps (available everywhere)
    setupSteps.forEach((step, stepIndex) => {
      (step.extractors || []).forEach((extractor) => {
        if (extractor.name) {
          variables.push({
            name: extractor.name,
            scope: 'setup',
            description: `From setup step ${stepIndex + 1}: ${step.name || 'Unnamed'}`,
          });
        }
      });
    });
    
    // Variables from workflow steps (available in subsequent workflow steps)
    workflowSteps.forEach((step, stepIndex) => {
      (step.extractors || []).forEach((extractor) => {
        if (extractor.name) {
          variables.push({
            name: extractor.name,
            scope: 'workflow',
            description: `From workflow step ${stepIndex + 1}: ${step.name || 'Unnamed'}`,
            definedAtIndex: stepIndex,
          });
        }
      });
    });
    
    return variables;
  }, [setupSteps, workflowSteps]);

  // Get variables available for a specific workflow step
  const getVariablesForWorkflowStep = useCallback((stepIndex) => {
    // Setup variables are always available
    const setupVars = availableVariables.filter(v => v.scope === 'setup');
    // Workflow variables only from previous steps
    const workflowVars = availableVariables.filter(
      v => v.scope === 'workflow' && v.definedAtIndex < stepIndex
    );
    return [...setupVars, ...workflowVars];
  }, [availableVariables]);

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

  // Generic step handlers factory
  const createStepHandlers = (setSteps, setErrors) => ({
    handleChange: (index, updated) => {
      setSteps(prev => prev.map((step, i) => i === index ? updated : step));
      setErrors(prev => ({ ...prev, [index]: {} }));
    },
    handleAdd: (defaultStep) => {
      setSteps(prev => [...prev, { ...defaultStep }]);
    },
    handleDelete: (index) => {
      setSteps(prev => prev.filter((_, i) => i !== index));
    },
    handleMoveUp: (index) => {
      if (index <= 0) return;
      setSteps(prev => {
        const newSteps = [...prev];
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
        return newSteps;
      });
    },
    handleMoveDown: (index, steps) => {
      if (index >= steps.length - 1) return;
      setSteps(prev => {
        const newSteps = [...prev];
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
        return newSteps;
      });
    },
  });

  // Setup step handlers
  const setupHandlers = createStepHandlers(setSetupSteps, setSetupErrors);
  // Workflow step handlers
  const workflowHandlers = createStepHandlers(setWorkflowSteps, setWorkflowErrors);
  // Teardown step handlers
  const teardownHandlers = createStepHandlers(setTeardownSteps, setTeardownErrors);

  // Validate workflow steps
  const validateWorkflowSteps = useCallback(() => {
    if (mode !== 'workflow') return true;
    
    let isValid = true;
    
    // Validate setup steps
    const setupErrs = {};
    setupSteps.forEach((step, index) => {
      setupErrs[index] = {};
      if (!step.name?.trim()) {
        setupErrs[index].name = 'Step name is required';
        isValid = false;
      }
      if (!step.path?.trim()) {
        setupErrs[index].path = 'Path is required';
        isValid = false;
      }
    });
    setSetupErrors(setupErrs);
    
    // Validate workflow steps - at least one required
    const workflowErrs = {};
    if (workflowSteps.length === 0) {
      isValid = false;
    }
    workflowSteps.forEach((step, index) => {
      workflowErrs[index] = {};
      if (!step.name?.trim()) {
        workflowErrs[index].name = 'Step name is required';
        isValid = false;
      }
      if (!step.path?.trim()) {
        workflowErrs[index].path = 'Path is required';
        isValid = false;
      }
    });
    setWorkflowErrors(workflowErrs);
    
    // Validate teardown steps
    const teardownErrs = {};
    teardownSteps.forEach((step, index) => {
      teardownErrs[index] = {};
      if (!step.name?.trim()) {
        teardownErrs[index].name = 'Step name is required';
        isValid = false;
      }
      if (!step.path?.trim()) {
        teardownErrs[index].path = 'Path is required';
        isValid = false;
      }
    });
    setTeardownErrors(teardownErrs);
    
    return isValid;
  }, [mode, setupSteps, workflowSteps, teardownSteps]);

  // Handle form submission
  const onFormSubmit = (formData) => {
    if (!validatePhases()) {
      return;
    }
    
    if (!validateWorkflowSteps()) {
      return;
    }

    const submitData = {
      ...formData,
      mode,
      phases,
    };
    
    // Include workflow data if in workflow mode
    if (mode === 'workflow') {
      submitData.setup = setupSteps;
      submitData.workflow = workflowSteps;
      submitData.teardown = teardownSteps;
      submitData.setupErrorHandling = setupErrorHandling;
      submitData.setupRetryCount = setupRetryCount;
      submitData.teardownErrorHandling = teardownErrorHandling;
      submitData.teardownRetryCount = teardownRetryCount;
    }

    onSubmit(submitData);
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

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(SCENARIO_MODES).map((modeOption) => (
                <button
                  key={modeOption.value}
                  type="button"
                  onClick={() => setMode(modeOption.value)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left',
                    mode === modeOption.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {modeOption.value === 'simple' ? (
                      <PlayCircle className={cn(
                        'w-5 h-5',
                        mode === modeOption.value ? 'text-primary' : 'text-gray-400'
                      )} />
                    ) : (
                      <Workflow className={cn(
                        'w-5 h-5',
                        mode === modeOption.value ? 'text-primary' : 'text-gray-400'
                      )} />
                    )}
                    <span className={cn(
                      'font-medium',
                      mode === modeOption.value ? 'text-primary' : 'text-gray-700'
                    )}>
                      {modeOption.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {modeOption.description}
                  </p>
                </button>
              ))}
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

      {/* Workflow Sections - Only visible in workflow mode */}
      {mode === 'workflow' && (
        <>
          {/* Setup Steps Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Setup Steps
                    <span className="text-sm font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </CardTitle>
                  <CardDescription>
                    One-time global setup before load test starts. Extract variables for use in workflow.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setupHandlers.handleAdd(DEFAULT_SETUP_STEP)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Setup Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {setupSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No setup steps configured</p>
                  <p className="text-sm">Add steps to create resources before load testing</p>
                </div>
              ) : (
                setupSteps.map((step, index) => (
                  <SetupStepEditor
                    key={index}
                    step={step}
                    index={index}
                    onChange={(updated) => setupHandlers.handleChange(index, updated)}
                    onDelete={() => setupHandlers.handleDelete(index)}
                    onMoveUp={() => setupHandlers.handleMoveUp(index)}
                    onMoveDown={() => setupHandlers.handleMoveDown(index, setupSteps)}
                    canMoveUp={index > 0}
                    canMoveDown={index < setupSteps.length - 1}
                    canDelete={true}
                    errors={setupErrors[index] || {}}
                    availableVariables={[]}
                    stepType="setup"
                  />
                ))
              )}
              
              {/* Setup Error Handling */}
              {setupSteps.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <Label className="text-sm font-medium">Error Handling</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">On Error</Label>
                      <Select
                        value={setupErrorHandling}
                        onValueChange={setSetupErrorHandling}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ERROR_HANDLING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {setupErrorHandling === 'retry' && (
                      <div className="w-32">
                        <Label className="text-xs text-muted-foreground">Retry Count</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={setupRetryCount}
                          onChange={(e) => setSetupRetryCount(parseInt(e.target.value) || 3)}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Steps Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-green-600" />
                    Workflow Steps
                    <span className="text-sm font-normal text-destructive">*</span>
                  </CardTitle>
                  <CardDescription>
                    Steps each connection executes during load test. Mark steps as "Once" for per-connection setup.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => workflowHandlers.handleAdd(DEFAULT_WORKFLOW_STEP)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workflow Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workflowSteps.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5">
                  <Workflow className="w-8 h-8 mx-auto mb-2 text-destructive/50" />
                  <p className="text-destructive">At least one workflow step is required</p>
                  <p className="text-sm text-muted-foreground">Add the requests each connection will execute</p>
                </div>
              ) : (
                workflowSteps.map((step, index) => (
                  <WorkflowStepEditor
                    key={index}
                    step={step}
                    index={index}
                    onChange={(updated) => workflowHandlers.handleChange(index, updated)}
                    onDelete={() => workflowHandlers.handleDelete(index)}
                    onMoveUp={() => workflowHandlers.handleMoveUp(index)}
                    onMoveDown={() => workflowHandlers.handleMoveDown(index, workflowSteps)}
                    canMoveUp={index > 0}
                    canMoveDown={index < workflowSteps.length - 1}
                    canDelete={true}
                    errors={workflowErrors[index] || {}}
                    availableVariables={getVariablesForWorkflowStep(index)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Teardown Steps Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trash className="w-5 h-5 text-gray-600" />
                    Teardown Steps
                    <span className="text-sm font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Cleanup steps after load test completes. Use to delete test resources.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => teardownHandlers.handleAdd(DEFAULT_SETUP_STEP)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teardown Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {teardownSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No teardown steps configured</p>
                  <p className="text-sm">Add steps to clean up resources after testing</p>
                </div>
              ) : (
                teardownSteps.map((step, index) => (
                  <SetupStepEditor
                    key={index}
                    step={step}
                    index={index}
                    onChange={(updated) => teardownHandlers.handleChange(index, updated)}
                    onDelete={() => teardownHandlers.handleDelete(index)}
                    onMoveUp={() => teardownHandlers.handleMoveUp(index)}
                    onMoveDown={() => teardownHandlers.handleMoveDown(index, teardownSteps)}
                    canMoveUp={index > 0}
                    canMoveDown={index < teardownSteps.length - 1}
                    canDelete={true}
                    errors={teardownErrors[index] || {}}
                    availableVariables={availableVariables}
                    stepType="teardown"
                  />
                ))
              )}
              
              {/* Teardown Error Handling */}
              {teardownSteps.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <Label className="text-sm font-medium">Error Handling</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">On Error</Label>
                      <Select
                        value={teardownErrorHandling}
                        onValueChange={setTeardownErrorHandling}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ERROR_HANDLING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {teardownErrorHandling === 'retry' && (
                      <div className="w-32">
                        <Label className="text-xs text-muted-foreground">Retry Count</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={teardownRetryCount}
                          onChange={(e) => setTeardownRetryCount(parseInt(e.target.value) || 3)}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

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
