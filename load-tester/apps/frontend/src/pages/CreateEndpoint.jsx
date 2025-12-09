import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpointsAPI } from '../services/endpoints';
import { EndpointForm } from '../components/endpoints/EndpointForm';
import { Card, CardTitle } from '../components/ui/Card';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const CreateEndpoint = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await endpointsAPI.create(data);
      toast.success('Endpoint created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create endpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Endpoint</h2>
      
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <Card>
        <EndpointForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};
