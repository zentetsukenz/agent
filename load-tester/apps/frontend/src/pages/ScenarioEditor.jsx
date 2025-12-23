import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ScenarioForm } from '@/components/scenarios/ScenarioForm';
import { scenariosAPI } from '@/services/scenarios';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Layers } from 'lucide-react';

// Loading skeleton for the form
const FormSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-4 p-6 border rounded-lg">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="space-y-4 p-6 border rounded-lg">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 w-full" />
    </div>
    <div className="space-y-4 p-6 border rounded-lg">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

/**
 * ScenarioEditor - Page for editing an existing scenario
 */
export const ScenarioEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch scenario data
  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await scenariosAPI.getById(id);
        
        // Check if it's a template (can't edit templates)
        if (data.isTemplate) {
          toast.error('Cannot edit built-in templates. Duplicate it first.');
          navigate(`/scenarios/${id}`);
          return;
        }
        
        setScenario(data);
      } catch (err) {
        console.error('Failed to fetch scenario:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await scenariosAPI.update(id, data);
      toast.success('Scenario updated successfully!');
      navigate(`/scenarios/${id}`);
    } catch (error) {
      console.error('Failed to update scenario:', error);
      toast.error(error.message || 'Failed to update scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/scenarios/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/scenarios" className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              Scenarios
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {scenario ? (
              <BreadcrumbLink href={`/scenarios/${id}`}>
                {scenario.name}
              </BreadcrumbLink>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Scenario
        </h1>
        <p className="text-gray-600 mt-1">
          Modify your scenario configuration and load pattern
        </p>
      </div>

      {/* Loading State */}
      {loading && <FormSkeleton />}

      {/* Error State */}
      {error && (
        <ErrorMessage
          error={error}
          title="Failed to load scenario"
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Form */}
      {!loading && !error && scenario && (
        <ScenarioForm
          initialData={scenario}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      )}
    </div>
  );
};

export default ScenarioEditor;
