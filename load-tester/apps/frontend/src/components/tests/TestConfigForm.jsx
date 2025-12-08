import { useForm } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TEST_LIMITS } from '../../utils/constants';
import { validateNumber } from '../../utils/validators';

export const TestConfigForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      duration: 30,
      connections: 10,
      rps: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Duration (seconds) *"
        type="number"
        error={errors.duration?.message}
        {...register('duration', {
          required: 'Duration is required',
          validate: (value) => validateNumber(
            value,
            TEST_LIMITS.DURATION.MIN,
            TEST_LIMITS.DURATION.MAX,
            'Duration'
          ),
        })}
      />

      <Input
        label="Concurrent Connections *"
        type="number"
        error={errors.connections?.message}
        {...register('connections', {
          required: 'Connections is required',
          validate: (value) => validateNumber(
            value,
            TEST_LIMITS.CONNECTIONS.MIN,
            TEST_LIMITS.CONNECTIONS.MAX,
            'Connections'
          ),
        })}
      />

      <Input
        label="Requests Per Second (optional)"
        type="number"
        error={errors.rps?.message}
        {...register('rps', {
          validate: (value) => {
            if (!value) return true;
            return validateNumber(
              value,
              TEST_LIMITS.RPS.MIN,
              TEST_LIMITS.RPS.MAX,
              'RPS'
            );
          },
        })}
      />

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Starting Test...' : 'Start Load Test'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
