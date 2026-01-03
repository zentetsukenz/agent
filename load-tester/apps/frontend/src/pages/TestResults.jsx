import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight, X, AlertTriangle, Play, ArrowLeft } from 'lucide-react';
import { useTestStatus } from '../hooks/useTestStatus';
import { testsAPI } from '../services/tests';
import { TestStatusBadge } from '../components/tests/TestStatusBadge';
import { TestMetrics } from '../components/tests/TestMetrics';
import { PhaseResultsCard } from '../components/tests/PhaseResultsCard';
import { ScenarioInfoCard } from '../components/tests/ScenarioInfoCard';
import ResultsChart from '../components/ResultsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLoading, IndeterminateProgress, Loading } from '../components/ui/Loading';
import { TEST_STATUS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export const TestResults = () => {
  const { id } = useParams();
  const { test, loading, error, refetch } = useTestStatus(id);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelTest = async () => {
    setIsCancelling(true);
    try {
      await testsAPI.cancelTest(id);
      toast.success('Test cancelled successfully');
      setShowCancelConfirm(false);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel test');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading && !test) {
    return <PageLoading text="Loading test results..." />;
  }

  if (error && !test) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  const isRunning = test?.status === TEST_STATUS.PENDING || test?.status === TEST_STATUS.RUNNING;
  const results = test?.results || null;
  const phaseResults = test?.phaseResults || null;
  const scenario = test?.scenario || null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight aria-hidden="true" className="w-4 h-4" />
        <span className="text-foreground font-medium">Test Results</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Test Results</h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            {test?.endpoint?.name || 'Loading...'} • Test #{id}
          </p>
        </div>
        <div className="flex gap-3">
          {isRunning && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
            >
              <X aria-hidden="true" className="w-4 h-4" />
              Cancel Test
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft aria-hidden="true" className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Running indicator */}
      {isRunning && (
        <div className="mb-8">
          <IndeterminateProgress />
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Cancel Test?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The test is currently running. Cancelling will stop it immediately and mark it as cancelled. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Running</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTest}
              disabled={isCancelling}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Test Status</CardTitle>
              <div className="space-y-2 text-sm mt-3">
                {test?.endpoint && (
                  <>
                    <div>
                      <span className="font-medium text-muted-foreground">Endpoint:</span>{' '}
                      <span className="text-foreground">{test.endpoint.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">URL:</span>{' '}
                      <span className="text-foreground break-all">{test.endpoint.url}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="font-medium text-muted-foreground">Started:</span>{' '}
                  <span className="text-foreground">{formatDate(test?.createdAt)}</span>
                </div>
                {test?.completedAt && (
                  <div>
                    <span className="font-medium text-muted-foreground">Completed:</span>{' '}
                    <span className="text-foreground">{formatDate(test.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
            <TestStatusBadge status={test?.status} />
          </div>
        </CardHeader>
      </Card>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="text-2xl font-semibold text-foreground">{test?.duration}s</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Connections</p>
              <p className="text-2xl font-semibold text-foreground">{test?.connections}</p>
            </div>
            {test?.rps && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Target RPS</p>
                <p className="text-2xl font-semibold text-foreground">{test.rps}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Info (if test used a scenario) */}
      {scenario && (
        <div className="mb-6">
          <ScenarioInfoCard scenario={scenario} />
        </div>
      )}

      {/* Loading or Results */}
      {isRunning ? (
        <Card>
          <CardContent className="py-8">
            <Loading text="Test is running... Results will appear when complete." />
          </CardContent>
        </Card>
      ) : test?.status === TEST_STATUS.COMPLETED && results ? (
        <>
          {/* Results Chart */}
          <div className="mb-6">
            <ResultsChart results={results} />
          </div>

          {/* Phase Results (if scenario test) */}
          {phaseResults && phaseResults.length > 0 && (
            <div className="mb-6">
              <PhaseResultsCard phaseResults={phaseResults} />
            </div>
          )}

          {/* Detailed Metrics */}
          <TestMetrics results={results} />
          
          <div className="mt-6 flex gap-4">
            <Button asChild>
              <Link to={`/endpoints/${test.endpointId}/test`}>
                <Play aria-hidden="true" className="w-4 h-4" />
                Run Another Test
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Dashboard</Link>
            </Button>
          </div>
        </>
      ) : test?.status === TEST_STATUS.FAILED ? (
        <Card>
          <CardContent className="py-6">
            <Alert variant="destructive">
              <AlertDescription>Test failed to complete. Please try again.</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-4">
              <Button asChild>
                <Link to={`/endpoints/${test.endpointId}/test`}>Try Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
