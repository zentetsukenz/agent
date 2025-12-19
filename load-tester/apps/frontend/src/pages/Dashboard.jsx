import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Zap } from 'lucide-react';
import { useEndpoints } from '../hooks/useEndpoints';
import { endpointsAPI } from '../services/endpoints';
import { testsAPI } from '../services/tests';
import { EndpointList } from '../components/endpoints/EndpointList';
import { DeleteConfirm } from '../components/endpoints/DeleteConfirm';
import { useDeleteConfirm } from '../hooks/useDeleteConfirm';
import { TestHistory } from '../components/tests/TestHistory';
import { TestComparison } from '../components/tests/TestComparison';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardSkeleton } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '@/components/ui/button';

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
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Loading your endpoints and tests...</p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error && endpoints.length === 0) {
    return <ErrorMessage error={error} onRetry={() => {
      refetch();
      window.location.reload();
    }} />;
  }

  if (endpoints.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <EmptyState
          icon={<Zap className="w-full h-full" />}
          title="No endpoints configured"
          description="Start load testing your APIs by adding your first endpoint. You can test REST APIs with various HTTP methods."
          action={
            <Button size="lg" asChild>
              <Link to="/endpoints/new">
                <Plus className="w-5 h-5" />
                Create Your First Endpoint
              </Link>
            </Button>
          }
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
            {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} • {tests.length} test{tests.length !== 1 ? 's' : ''} run
          </p>
        </div>
        <Button asChild>
          <Link to="/endpoints/new">
            <Plus className="w-4 h-4" />
            Add Endpoint
          </Link>
        </Button>
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
      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            API Endpoints 
            {searchQuery && (
              <span className="text-gray-400 font-normal ml-2">
                ({filteredAndSortedEndpoints.length} result{filteredAndSortedEndpoints.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>
        </div>
        {filteredAndSortedEndpoints.length > 0 ? (
          <EndpointList endpoints={filteredAndSortedEndpoints} onDelete={handleDelete} />
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No endpoints match your search.</p>
          </div>
        )}
      </section>

      {/* Test History Section */}
      {tests.length > 0 && (
        <section>
          <TestHistory 
            tests={tests} 
            onSelectForComparison={handleSelectForComparison}
          />
        </section>
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
