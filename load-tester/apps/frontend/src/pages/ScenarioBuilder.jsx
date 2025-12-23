import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ScenarioForm } from '@/components/scenarios/ScenarioForm';
import { scenariosAPI } from '@/services/scenarios';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Layers } from 'lucide-react';

/**
 * ScenarioBuilder - Page for creating a new scenario
 */
export const ScenarioBuilder = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const created = await scenariosAPI.create(data);
      toast.success('Scenario created successfully!');
      navigate(`/scenarios/${created.id}`);
    } catch (error) {
      console.error('Failed to create scenario:', error);
      toast.error(error.message || 'Failed to create scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/scenarios');
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
            <BreadcrumbPage>Create Scenario</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create Scenario
        </h1>
        <p className="text-gray-600 mt-1">
          Build a reusable test configuration with custom load patterns
        </p>
      </div>

      {/* Scenario Form */}
      <ScenarioForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Create Scenario"
      />
    </div>
  );
};

export default ScenarioBuilder;
