import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { endpointsAPI } from '../services/endpoints';
import { testsAPI } from '../services/tests';
import { TestConfigForm } from '../components/tests/TestConfigForm';
import RequestTemplates from '../components/RequestTemplates';
import { Card, CardTitle } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import toast from 'react-hot-toast';

export const ConfigureTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [templateConfig, setTemplateConfig] = useState(null);

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
      navigate(`/tests/${result.id}/results`);
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
    return <Loading text="Loading endpoint..." />;
  }

  if (error && !endpoint) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage error={error} onRetry={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Configure Load Test</h2>
      
      {endpoint && (
        <Card className="mb-6">
          <CardTitle className="mb-4">Endpoint Details</CardTitle>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Name:</span>{' '}
              <span className="text-gray-900">{endpoint.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">URL:</span>{' '}
              <span className="text-gray-900 break-all">{endpoint.url}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Method:</span>{' '}
              <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                {endpoint.method}
              </span>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="mb-6">
        <RequestTemplates onApplyTemplate={handleApplyTemplate} />
      </div>

      <Card>
        <CardTitle className="mb-4">Test Configuration</CardTitle>
        <TestConfigForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          templateConfig={templateConfig}
        />
      </Card>
    </div>
  );
};
