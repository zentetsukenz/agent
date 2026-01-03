import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { endpointsAPI } from '../services/endpoints';
import { testsAPI } from '../services/tests';
import { TestConfigForm } from '../components/tests/TestConfigForm';
import RequestTemplates from '../components/RequestTemplates';
import { ScenarioSelector } from '../components/scenarios/ScenarioSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronRight, Server, Settings, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const methodStyles = {
  GET: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  POST: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  DELETE: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
};

export const ConfigureTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [templateConfig, setTemplateConfig] = useState(null);
  
  // Test configuration mode: 'quick' for manual config, 'scenario' for scenario-based
  const [configMode, setConfigMode] = useState('quick');
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        const data = await endpointsAPI.getById(id);
        setEndpoint(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [id]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const config = {
        duration: parseInt(data.duration),
        connections: parseInt(data.connections),
        rps: data.rps ? parseInt(data.rps) : undefined,
        timeout: data.timeout ? parseInt(data.timeout) : undefined,
      };
      
      const result = await testsAPI.execute(id, config);
      toast.success('Load test started successfully!');
      navigate(`/tests/${result.data.id}/results`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to start test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScenarioSubmit = async () => {
    if (!selectedScenarioId) {
      toast.error('Please select a scenario');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await testsAPI.executeWithScenario(id, selectedScenarioId);
      toast.success('Scenario-based load test started successfully!');
      navigate(`/tests/${result.data.id}/results`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to start test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyTemplate = (config) => {
    setTemplateConfig(config);
    toast.success('Template applied!');
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-4 w-48 mb-8" />
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !endpoint) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight aria-hidden="true" className="w-4 h-4" />
        <span className="text-foreground font-medium">Configure Test</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configure Load Test</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">Set up test parameters for performance testing. Use templates for common scenarios.</p>
      </div>
      
      {endpoint && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Server aria-hidden="true" className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-foreground">{endpoint.name}</h2>
                  <Badge 
                    variant="outline" 
                    className={cn('font-bold text-xs', methodStyles[endpoint.method] || methodStyles.GET)}
                  >
                    {endpoint.method}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg break-all">
                  {endpoint.url}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Configuration Mode Toggle */}
      <div className="mb-6">
        <div className="flex rounded-lg border p-1 bg-muted/50">
          <button
            type="button"
            onClick={() => setConfigMode('quick')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
              configMode === 'quick'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Zap aria-hidden="true" className="w-4 h-4" />
            Quick Config
          </button>
          <button
            type="button"
            onClick={() => setConfigMode('scenario')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
              configMode === 'scenario'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText aria-hidden="true" className="w-4 h-4" />
            Use Scenario
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {configMode === 'quick' 
            ? 'Configure test parameters manually or use quick templates'
            : 'Select a saved scenario with predefined load phases'
          }
        </p>
      </div>

      {/* Quick Config Mode */}
      {configMode === 'quick' && (
        <>
          <div className="mb-6">
            <RequestTemplates onApplyTemplate={handleApplyTemplate} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings aria-hidden="true" className="w-5 h-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TestConfigForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                templateConfig={templateConfig}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Scenario Mode */}
      {configMode === 'scenario' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText aria-hidden="true" className="w-5 h-5" />
              Select Scenario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScenarioSelector
              selectedScenarioId={selectedScenarioId}
              onSelect={setSelectedScenarioId}
              onClear={() => setSelectedScenarioId(null)}
            />
            
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScenarioSubmit}
                disabled={!selectedScenarioId || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Starting...' : 'Run Test'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
