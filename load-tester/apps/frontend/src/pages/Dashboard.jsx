import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEndpoints } from '../hooks/useEndpoints';
import { endpointsAPI } from '../services/endpoints';
import { testsAPI } from '../services/tests';
import { EndpointList } from '../components/endpoints/EndpointList';
import { DeleteConfirm, useDeleteConfirm } from '../components/endpoints/DeleteConfirm';
import { TestHistory } from '../components/tests/TestHistory';
import { TestComparison } from '../components/tests/TestComparison';
import { DashboardStats } from '../components/DashboardStats';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const Dashboard = () => {
  const { endpoints, loading: endpointsLoading, error: endpointsError, refetch } = useEndpoints();
  const { isOpen, deleteId, itemName, openConfirm, closeConfirm, confirmDelete } = useDeleteConfirm();
  
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState(null);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');

  // Fetch tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setTestsLoading(true);
        setTestsError(null);
        const response = await testsAPI.getAll();
        setTests(response.data || []);
      } catch (err) {
        console.error('Failed to fetch tests:', err);
        setTestsError(err);
        toast.error('Failed to load test history');
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Filter and sort endpoints
  const filteredAndSortedEndpoints = useMemo(() => {
    let filtered = [...endpoints];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(endpoint => 
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.url.toLowerCase().includes(query)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'url-asc':
          return a.url.localeCompare(b.url);
        case 'url-desc':
          return b.url.localeCompare(a.url);
        case 'created-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [endpoints, searchQuery, sortOption]);

  const handleDelete = async (id) => {
    const endpoint = endpoints.find(e => e.id === id);
    openConfirm(id, endpoint?.name);
  };

  const performDelete = async () => {
    try {
      await endpointsAPI.delete(deleteId);
      toast.success('Endpoint deleted successfully');
      await refetch();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete endpoint');
    }
  };

  const handleSelectForComparison = (testIds) => {
    setSelectedTestIds(testIds);
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
    setSelectedTestIds([]);
  };

  const loading = endpointsLoading || testsLoading;
  const error = endpointsError || testsError;

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (error && endpoints.length === 0) {
    return <ErrorMessage error={error} onRetry={() => {
      refetch();
      window.location.reload();
    }} />;
  }

  if (endpoints.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No endpoints yet"
        description="Get started by creating your first API endpoint to test."
        action={
          <Link to="/endpoints/new">
            <Button>+ Add Endpoint</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <Link to="/endpoints/new">
          <Button>+ Add Endpoint</Button>
        </Link>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats 
        endpoints={endpoints}
        tests={tests}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Endpoints Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          API Endpoints 
          {searchQuery && ` (${filteredAndSortedEndpoints.length} result${filteredAndSortedEndpoints.length !== 1 ? 's' : ''})`}
        </h3>
        {filteredAndSortedEndpoints.length > 0 ? (
          <EndpointList endpoints={filteredAndSortedEndpoints} onDelete={handleDelete} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No endpoints match your search.
          </div>
        )}
      </div>

      {/* Test History Section */}
      {tests.length > 0 && (
        <div className="mb-8">
          <TestHistory 
            tests={tests} 
            onSelectForComparison={handleSelectForComparison}
          />
        </div>
      )}

      {/* Test Comparison Modal */}
      {showComparison && selectedTestIds.length >= 2 && (
        <TestComparison 
          tests={tests.filter(t => selectedTestIds.includes(t.id))}
          onClose={handleCloseComparison}
        />
      )}

      <DeleteConfirm
        isOpen={isOpen}
        itemName={itemName}
        onConfirm={() => confirmDelete(performDelete)}
        onCancel={closeConfirm}
      />
    </div>
  );
};
