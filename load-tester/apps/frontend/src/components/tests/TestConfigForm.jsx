import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TEST_LIMITS } from '../../utils/constants';
import { validateNumber } from '../../utils/validators';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TestConfigForm = ({ onSubmit, onCancel, isSubmitting, templateConfig }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      duration: 30,
      connections: 10,
      rps: '',
      timeout: 300,
    },
  });

  useEffect(() => {
    if (templateConfig) {
      reset(templateConfig);
    }
  }, [templateConfig, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds) *</Label>
          <Input
            id="duration"
            type="number"
            placeholder="30"
            className={cn(errors.duration && 'border-destructive')}
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
          {errors.duration ? (
            <p className="text-sm text-destructive">{errors.duration.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              How long to run the test ({TEST_LIMITS.DURATION.MIN}-{TEST_LIMITS.DURATION.MAX}s)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="connections">Concurrent Connections *</Label>
          <Input
            id="connections"
            type="number"
            placeholder="10"
            className={cn(errors.connections && 'border-destructive')}
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
          {errors.connections ? (
            <p className="text-sm text-destructive">{errors.connections.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Number of parallel connections ({TEST_LIMITS.CONNECTIONS.MIN}-{TEST_LIMITS.CONNECTIONS.MAX})
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rps">Requests Per Second</Label>
          <Input
            id="rps"
            type="number"
            placeholder="Optional"
            className={cn(errors.rps && 'border-destructive')}
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
          {errors.rps ? (
            <p className="text-sm text-destructive">{errors.rps.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Leave empty for maximum throughput</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (seconds)</Label>
          <Input
            id="timeout"
            type="number"
            placeholder="300"
            className={cn(errors.timeout && 'border-destructive')}
            {...register('timeout', {
              validate: (value) => {
                if (!value) return true;
                return validateNumber(
                  value,
                  1,
                  3600,
                  'Timeout'
                );
              },
            })}
          />
          {errors.timeout ? (
            <p className="text-sm text-destructive">{errors.timeout.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Request timeout (1-3600s)</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>Loading...</>
          ) : (
            <>
              <Zap aria-hidden="true" className="w-4 h-4" />
              Start Load Test
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
