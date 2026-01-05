import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit2, 
  Copy, 
  Trash2, 
  Play, 
  Clock, 
  Users, 
  Layers, 
  Settings2,
  BookTemplate,
  ChevronRight,
  Workflow,
  AlertTriangle
} from 'lucide-react';
import { scenariosAPI, getTotalDuration, getMaxConnections, formatDuration } from '@/services/scenarios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ui/error-message';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Phase type colors and labels
const PHASE_COLORS = {
  ramp: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  constant: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  spike: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

// Error handling strategy labels
const ERROR_HANDLING_LABELS = {
  abort: { label: 'Abort on Error', color: 'destructive' },
  retry: { label: 'Retry on Error', color: 'secondary' },
  ignore: { label: 'Ignore Errors', color: 'outline' },
};

// Loading skeleton
const ScenarioDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <Skeleton className="h-6 w-48 mb-6" />
    <div className="flex items-start justify-between mb-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
    <Skeleton className="h-48 rounded-xl mb-6" />
    <Skeleton className="h-64 rounded-xl" />
  </div>
);

// Load Profile Visualization (larger version)
const LoadProfileChart = ({ phases }) => {
  if (!phases || phases.length === 0) return null;

  const width = 600;
  const height = 150;
  const padding = { left: 50, right: 20, top: 20, bottom: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max values
  const maxConnections = Math.max(...phases.flatMap(p => [p.connections, p.targetConnections || p.connections]));
  const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);

  // Generate path points
  const points = [];
  let currentTime = 0;

  phases.forEach((phase) => {
    const startX = padding.left + (currentTime / totalDuration) * chartWidth;
    const endX = padding.left + ((currentTime + phase.duration) / totalDuration) * chartWidth;
    const startY = padding.top + chartHeight - (phase.connections / maxConnections) * chartHeight;
    const endY = padding.top + chartHeight - ((phase.targetConnections || phase.connections) / maxConnections) * chartHeight;

    if (points.length === 0) {
      points.push({ x: startX, y: startY });
    }

    if (phase.type === 'ramp') {
      points.push({ x: endX, y: endY });
    } else if (phase.type === 'spike') {
      const midX = (startX + endX) / 2;
      const spikeY = padding.top + chartHeight - (phase.targetConnections / maxConnections) * chartHeight;
      points.push({ x: midX, y: spikeY });
      points.push({ x: endX, y: startY });
    } else {
      points.push({ x: endX, y: startY });
    }

    currentTime += phase.duration;
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Fill area
  const fillPath = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxConnections / 2), maxConnections];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = padding.top + chartHeight - (tick / maxConnections) * chartHeight;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
              {tick}
            </text>
          </g>
        );
      })}

      {/* Phase regions - pre-compute positions */}
      {phases.map((phase, i) => {
        // Calculate cumulative time up to this phase
        const cumulativeTime = phases.slice(0, i).reduce((sum, p) => sum + p.duration, 0);
        const x = padding.left + (cumulativeTime / totalDuration) * chartWidth;
        const w = (phase.duration / totalDuration) * chartWidth;
        const colors = PHASE_COLORS[phase.type] || PHASE_COLORS.constant;
        return (
          <g key={i}>
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              className={`${colors.bg} opacity-30`}
              fill="currentColor"
            />
            <text
              x={x + w / 2}
              y={height - 8}
              textAnchor="middle"
              className="text-xs fill-gray-600 font-medium"
            >
              {phase.name || phase.type}
            </text>
          </g>
        );
      })}

      {/* Fill area */}
      <path d={fillPath} fill="url(#gradient)" opacity="0.3" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis label */}
      <text
        x={10}
        y={height / 2}
        textAnchor="middle"
        transform={`rotate(-90 10 ${height / 2})`}
        className="text-xs fill-gray-500"
      >
        Connections
      </text>
    </svg>
  );
};

// Phase Card component
const PhaseCard = ({ phase, index }) => {
  const colors = PHASE_COLORS[phase.type] || PHASE_COLORS.constant;

  return (
    <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Phase {index + 1}</span>
          <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
            {phase.type}
          </Badge>
        </div>
        {phase.name && (
          <span className={`text-sm font-medium ${colors.text}`}>{phase.name}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Duration:</span>
          <span className="ml-2 font-medium">{formatDuration(phase.duration)}</span>
        </div>
        <div>
          <span className="text-gray-500">Connections:</span>
          <span className="ml-2 font-medium">
            {phase.connections}
            {phase.targetConnections && phase.targetConnections !== phase.connections && (
              <span> → {phase.targetConnections}</span>
            )}
          </span>
        </div>
        {phase.requestsPerSecond && (
          <div>
            <span className="text-gray-500">RPS:</span>
            <span className="ml-2 font-medium">{phase.requestsPerSecond}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Workflow Step Card
const WorkflowStepCard = ({ step, index }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {step.method}
          </Badge>
          <span className="font-medium text-gray-900 truncate">{step.name || step.url}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{step.url}</p>
        {step.extractVariables && step.extractVariables.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Extracts: {step.extractVariables.map(v => v.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export const ScenarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch scenario
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await scenariosAPI.getById(id);
        setScenario(data);
      } catch (err) {
        console.error('Failed to fetch scenario:', err);
        setError(err);
        toast.error('Failed to load scenario');
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [id]);

  // Handlers
  const handleDuplicate = async () => {
    try {
      const duplicated = await scenariosAPI.duplicate(id);
      toast.success(`Created "${duplicated.name}"`);
      navigate(`/scenarios/${duplicated.id}`);
    } catch (err) {
      console.error('Duplicate error:', err);
      toast.error(err.message || 'Failed to duplicate scenario');
    }
  };

  const handleDelete = async () => {
    try {
      await scenariosAPI.delete(id);
      toast.success('Scenario deleted');
      navigate('/scenarios');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete scenario');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (loading) {
    return <ScenarioDetailSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/scenarios">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scenarios
          </Link>
        </Button>
        <ErrorMessage
          message="Failed to load scenario"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Not found state
  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/scenarios">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scenarios
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Scenario Not Found</h2>
            <p className="text-gray-600">The scenario you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDuration = getTotalDuration(scenario.phases);
  const maxConnections = getMaxConnections(scenario.phases);
  const hasWorkflow = scenario.executionMode === 'workflow';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/scenarios">Scenarios</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{scenario.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{scenario.name}</h1>
            {scenario.isTemplate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookTemplate aria-hidden="true" className="w-3 h-3" />
                Template
              </Badge>
            )}
          </div>
          {scenario.description && (
            <p className="text-gray-600 max-w-2xl">{scenario.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {scenario.isTemplate ? (
            <Button onClick={handleDuplicate}>
              <Copy aria-hidden="true" className="w-4 h-4 mr-2" />
              Use Template
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to={`/scenarios/${id}/edit`}>
                  <Edit2 aria-hidden="true" className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button onClick={handleDuplicate} variant="outline">
                <Copy aria-hidden="true" className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 aria-hidden="true" className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Duration</p>
              <p className="text-xl font-bold text-gray-900">{formatDuration(totalDuration)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Max Connections</p>
              <p className="text-xl font-bold text-gray-900">{maxConnections}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phases</p>
              <p className="text-xl font-bold text-gray-900">{scenario.phases.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load Profile Visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Load Profile</CardTitle>
          <CardDescription>Visual representation of the test load pattern</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadProfileChart phases={scenario.phases} />
        </CardContent>
      </Card>

      {/* Phases */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers aria-hidden="true" className="w-5 h-5" />
            Load Phases
          </CardTitle>
          <CardDescription>
            Sequential phases that define how load changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scenario.phases.map((phase, index) => (
              <PhaseCard key={index} phase={phase} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow (if applicable) */}
      {hasWorkflow && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow aria-hidden="true" className="w-5 h-5" />
              Workflow
            </CardTitle>
            <CardDescription>
              Multi-step request sequence executed by each connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Setup (global) */}
            {scenario.setup && scenario.setup.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Global Setup</Badge>
                  Runs once before test starts
                </h4>
                <div className="space-y-2">
                  {scenario.setup.map((step, index) => (
                    <WorkflowStepCard key={index} step={step} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Workflow steps (per-connection) */}
            {scenario.workflow && scenario.workflow.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Per Connection</Badge>
                  Each connection repeats this workflow
                </h4>
                <div className="space-y-2">
                  {scenario.workflow.map((step, index) => (
                    <WorkflowStepCard key={index} step={step} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Teardown (global) */}
            {scenario.teardown && scenario.teardown.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Global Teardown</Badge>
                  Runs once after test completes
                </h4>
                <div className="space-y-2">
                  {scenario.teardown.map((step, index) => (
                    <WorkflowStepCard key={index} step={step} index={index} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 aria-hidden="true" className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500 block mb-1">Execution Mode</span>
              <span className="font-medium capitalize">{scenario.executionMode}</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500 block mb-1">Error Handling</span>
              <Badge variant={ERROR_HANDLING_LABELS[scenario.errorHandling]?.color || 'secondary'}>
                {ERROR_HANDLING_LABELS[scenario.errorHandling]?.label || scenario.errorHandling}
              </Badge>
            </div>
            {scenario.timeout && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500 block mb-1">Timeout</span>
                <span className="font-medium">{scenario.timeout / 1000}s</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run Test Button (disabled for templates) */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to test?</h3>
              <p className="text-sm text-gray-600">
                {scenario.isTemplate
                  ? 'Duplicate this template first to run a test'
                  : 'Select an endpoint and run a load test with this scenario'
                }
              </p>
            </div>
            <Button
              size="lg"
              disabled={scenario.isTemplate}
              asChild={!scenario.isTemplate}
            >
              {scenario.isTemplate ? (
                <span className="flex items-center gap-2">
                  <Play aria-hidden="true" className="w-5 h-5" />
                  Duplicate to Run
                </span>
              ) : (
                <Link to={`/scenarios/${id}/run`} className="flex items-center gap-2">
                  <Play aria-hidden="true" className="w-5 h-5" />
                  Run Test
                  <ChevronRight aria-hidden="true" className="w-4 h-4" />
                </Link>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{scenario.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
