import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, LayoutGrid, List, BookTemplate, FolderOpen } from 'lucide-react';
import { scenariosAPI } from '@/services/scenarios';
import { ScenarioCard } from '@/components/scenarios/ScenarioCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
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

// Loading skeleton
const ScenarioListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-12 w-full mb-3" />
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const ScenarioList = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'templates' | 'custom'
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    id: null, 
    name: '' 
  });

  // Fetch scenarios
  const fetchScenarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scenariosAPI.getAll();
      setScenarios(data);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
      setError(err);
      toast.error('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Filter and search scenarios
  const filteredScenarios = useMemo(() => {
    let filtered = [...scenarios];

    // Apply filter
    if (filter === 'templates') {
      filtered = filtered.filter(s => s.isTemplate);
    } else if (filter === 'custom') {
      filtered = filtered.filter(s => !s.isTemplate);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Sort: templates first, then by name
    filtered.sort((a, b) => {
      if (a.isTemplate && !b.isTemplate) return -1;
      if (!a.isTemplate && b.isTemplate) return 1;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [scenarios, filter, searchQuery]);

  // Separate templates and custom scenarios for display
  const templates = filteredScenarios.filter(s => s.isTemplate);
  const customScenarios = filteredScenarios.filter(s => !s.isTemplate);

  // Handlers
  const handleDuplicate = async (id) => {
    try {
      const duplicated = await scenariosAPI.duplicate(id);
      toast.success(`Created "${duplicated.name}"`);
      await fetchScenarios();
    } catch (err) {
      console.error('Duplicate error:', err);
      toast.error(err.message || 'Failed to duplicate scenario');
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await scenariosAPI.delete(deleteDialog.id);
      toast.success('Scenario deleted');
      await fetchScenarios();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete scenario');
    } finally {
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  // Empty state when no scenarios at all
  if (!loading && !error && scenarios.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scenarios</h1>
          <p className="text-gray-600 mt-2">
            Create reusable test configurations with custom load patterns.
          </p>
        </div>
        
        <EmptyState
          icon={
            <svg className="w-full h-full\" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No scenarios yet"
          description="Scenarios let you define reusable test configurations with multiple phases, variable load patterns, and workflows."
          action={
            <Button asChild>
              <Link to="/scenarios/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Scenario
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scenarios</h1>
          <p className="text-gray-600 mt-1">
            Reusable test configurations with custom load patterns
          </p>
        </div>
        <Button asChild>
          <Link to="/scenarios/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Scenario
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('templates')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              filter === 'templates'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookTemplate className="w-3.5 h-3.5" />
            Templates
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              filter === 'custom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage 
          error={error} 
          title="Failed to load scenarios"
          onRetry={fetchScenarios}
        />
      )}

      {/* Loading State */}
      {loading && <ScenarioListSkeleton />}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* No results for search/filter */}
          {filteredScenarios.length === 0 && (
            <EmptyState
              size="sm"
              icon={<Search className="w-full h-full" />}
              title="No matching scenarios"
              description={
                searchQuery
                  ? `No scenarios match "${searchQuery}"`
                  : 'No scenarios in this category'
              }
              action={
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}>
                  Clear filters
                </Button>
              }
            />
          )}

          {/* Templates Section */}
          {filter !== 'custom' && templates.length > 0 && (
            <div className="mb-8">
              {filter === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <BookTemplate className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Built-in Templates
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({templates.length})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Scenarios Section */}
          {filter !== 'templates' && customScenarios.length > 0 && (
            <div>
              {filter === 'all' && templates.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Custom Scenarios
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({customScenarios.length})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customScenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty custom scenarios (when filter is 'custom' or showing all) */}
          {filter !== 'templates' && customScenarios.length === 0 && templates.length > 0 && (
            <div className="mt-8">
              {filter === 'all' && (
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Custom Scenarios
                  </h2>
                </div>
              )}
              <EmptyState
                size="sm"
                icon={<FolderOpen className="w-full h-full" />}
                title="No custom scenarios yet"
                description="Create your own scenario or duplicate a template to customize it."
                action={
                  <Button asChild variant="outline">
                    <Link to="/scenarios/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Scenario
                    </Link>
                  </Button>
                }
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null, name: '' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
