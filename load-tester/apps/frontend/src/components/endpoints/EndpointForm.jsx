import { useForm } from 'react-hook-form';
import { Input, TextArea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { AuthTemplates } from './AuthTemplates';
import { HTTP_METHODS } from '../../utils/constants';
import { validateUrl, validateJSON } from '../../utils/validators';

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

  const handleApplyAuthTemplate = (templateHeaders, note) => {
    try {
      const existing = currentHeaders ? JSON.parse(currentHeaders) : {};
      const merged = { ...existing, ...templateHeaders };
      setValue('headers', JSON.stringify(merged, null, 2));
      if (note) {
        // Could show a toast here if needed
      }
    } catch (err) {
      setValue('headers', JSON.stringify(templateHeaders, null, 2));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name *"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

      <Input
        label="URL *"
        error={errors.url?.message}
        {...register('url', { 
          required: 'URL is required',
          validate: validateUrl 
        })}
      />

      <Select
        label="Method *"
        options={HTTP_METHODS}
        error={errors.method?.message}
        {...register('method', { required: 'Method is required' })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headers (JSON)
        </label>
        <div className="mb-2">
          <AuthTemplates onApplyTemplate={handleApplyAuthTemplate} />
        </div>
        <TextArea
          placeholder='{"Content-Type": "application/json"}'
          error={errors.headers?.message}
          {...register('headers', { validate: validateJSON })}
        />
      </div>

      <TextArea
        label="Body (JSON)"
        placeholder='{"key": "value"}'
        error={errors.body?.message}
        {...register('body', { validate: validateJSON })}
      />

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
