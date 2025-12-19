import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import { endpointsAPI } from '../services/endpoints';
import { EndpointForm } from '../components/endpoints/EndpointForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Create Endpoint</span>
      </nav>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Endpoint</CardTitle>
          <CardDescription>
            Configure the API endpoint you want to load test. Add headers and body if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EndpointForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};
