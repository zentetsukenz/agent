import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import { endpointsAPI } from '../services/endpoints';
import { EndpointForm } from '../components/endpoints/EndpointForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-4 w-48 mb-8" />
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
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
      <h1 className="sr-only">Edit Endpoint</h1>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight aria-hidden="true" className="w-4 h-4" />
        <span className="text-foreground font-medium">Edit Endpoint</span>
      </nav>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Endpoint</CardTitle>
          <CardDescription>
            Update the endpoint configuration. Changes will be saved immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EndpointForm
            initialData={endpoint}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};
