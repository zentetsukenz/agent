import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpointsAPI } from '../services/endpoints';
import { EndpointForm } from '../components/endpoints/EndpointForm';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const EditEndpoint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      await endpointsAPI.update(id, data);
      toast.success('Endpoint updated successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update endpoint');
    } finally {
      setIsSubmitting(false);
    }
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Endpoint</h2>
      
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <Card>
        <EndpointForm
          initialData={endpoint}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};
