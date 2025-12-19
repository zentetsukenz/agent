import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthTemplates } from './AuthTemplates';
import { HTTP_METHODS } from '../../utils/constants';
import { validateUrl, validateJSON } from '../../utils/validators';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EndpointForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: initialData || {
      name: '',
      url: '',
      method: 'GET',
      headers: '',
      body: '',
    },
  });

  const currentHeaders = watch('headers');
  const currentMethod = watch('method');

  const handleApplyAuthTemplate = (templateHeaders, note) => {
    try {
      const existing = currentHeaders ? JSON.parse(currentHeaders) : {};
      const merged = { ...existing, ...templateHeaders };
      setValue('headers', JSON.stringify(merged, null, 2));
      if (note) {
        // Could show a toast here if needed
      }
    } catch {
      setValue('headers', JSON.stringify(templateHeaders, null, 2));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="e.g., User Authentication API"
          className={cn(errors.name && 'border-destructive')}
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">A descriptive name for this endpoint</p>
        )}
      </div>

      {/* URL Field */}
      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          placeholder="https://api.example.com/endpoint"
          className={cn(errors.url && 'border-destructive')}
          {...register('url', { 
            required: 'URL is required',
            validate: validateUrl 
          })}
        />
        {errors.url ? (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Full URL including protocol (https://)</p>
        )}
      </div>

      {/* Method Field */}
      <div className="space-y-2">
        <Label>HTTP Method *</Label>
        <Select value={currentMethod} onValueChange={(value) => setValue('method', value)}>
          <SelectTrigger className={cn(errors.method && 'border-destructive')}>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.method && (
          <p className="text-sm text-destructive">{errors.method.message}</p>
        )}
      </div>

      {/* Headers Field */}
      <div className="space-y-2">
        <Label htmlFor="headers">Headers (JSON)</Label>
        <AuthTemplates onApplyTemplate={handleApplyAuthTemplate} />
        <Textarea
          id="headers"
          placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
          className={cn('font-mono text-sm min-h-24', errors.headers && 'border-destructive')}
          {...register('headers', { validate: validateJSON })}
        />
        {errors.headers ? (
          <p className="text-sm text-destructive">{errors.headers.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Optional. JSON object with request headers</p>
        )}
      </div>

      {/* Body Field */}
      <div className="space-y-2">
        <Label htmlFor="body">Request Body (JSON)</Label>
        <Textarea
          id="body"
          placeholder='{"email": "user@example.com", "password": "secret"}'
          className={cn('font-mono text-sm min-h-24', errors.body && 'border-destructive')}
          {...register('body', { validate: validateJSON })}
        />
        {errors.body ? (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Optional. Request body for POST/PUT/PATCH requests</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>Loading...</>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {initialData ? 'Save Changes' : 'Create Endpoint'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
