import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTestStatus } from '../hooks/useTestStatus';
import { testsAPI } from '../services/tests';
import { TestStatusBadge } from '../components/tests/TestStatusBadge';
import { TestMetrics } from '../components/tests/TestMetrics';
import ResultsChart from '../components/ResultsChart';
import { Card, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
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
    return <Loading text="Loading test results..." />;
  }

  if (error && !test) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  const isRunning = test?.status === TEST_STATUS.PENDING || test?.status === TEST_STATUS.RUNNING;
  const results = test?.results ? JSON.parse(test.results) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Test Results</h2>
        <div className="flex gap-2">
          {isRunning && (
            <Button
              variant="secondary"
              onClick={() => setShowCancelConfirm(true)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel Test
            </Button>
          )}
          <Link to="/">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <CardTitle className="mb-4">Cancel Test?</CardTitle>
            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this test? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleCancelTest}
                disabled={isCancelling}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Test'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
              >
                No, Keep Running
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Test Status Card */}
      <Card className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="mb-2">Test Status</CardTitle>
            <div className="space-y-2 text-sm">
              {test?.endpoint && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Endpoint:</span>{' '}
                    <span className="text-gray-900">{test.endpoint.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>{' '}
                    <span className="text-gray-900 break-all">{test.endpoint.url}</span>
                  </div>
                </>
              )}
              <div>
                <span className="font-medium text-gray-700">Started:</span>{' '}
                <span className="text-gray-900">{formatDate(test?.createdAt)}</span>
              </div>
              {test?.completedAt && (
                <div>
                  <span className="font-medium text-gray-700">Completed:</span>{' '}
                  <span className="text-gray-900">{formatDate(test.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
          <TestStatusBadge status={test?.status} />
        </div>
      </Card>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardTitle className="mb-4">Test Configuration</CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{test?.duration}s</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Connections</p>
              <p className="text-2xl font-semibold text-gray-900">{test?.connections}</p>
            </div>
            {test?.rps && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Target RPS</p>
                <p className="text-2xl font-semibold text-gray-900">{test.rps}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading or Results */}
      {isRunning ? (
        <Card>
          <Loading text="Test is running... Results will appear when complete." />
        </Card>
      ) : test?.status === TEST_STATUS.COMPLETED && results ? (
        <>
          {/* Results Chart */}
          <div className="mb-6">
            <ResultsChart results={results} />
          </div>

          {/* Detailed Metrics */}
          <TestMetrics results={results} />
          
          <div className="mt-6 flex gap-4">
            <Link to={`/endpoints/${test.endpointId}/test`}>
              <Button>Run Another Test</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </>
      ) : test?.status === TEST_STATUS.FAILED ? (
        <Card>
          <ErrorMessage error="Test failed to complete. Please try again." />
          <div className="mt-6 flex gap-4">
            <Link to={`/endpoints/${test.endpointId}/test`}>
              <Button>Try Again</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
};
