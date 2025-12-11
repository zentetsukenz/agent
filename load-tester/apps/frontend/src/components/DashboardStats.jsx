import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card } from './ui/Card';

export const DashboardStats = ({ 
  endpoints, 
  tests, 
  searchQuery, 
  onSearchChange, 
  sortOption, 
  onSortChange 
}) => {
  const stats = useMemo(() => {
    const totalEndpoints = endpoints.length;
    const totalTests = tests.length;
    
    // Calculate average success rate
    const completedTests = tests.filter(t => t.status === 'completed' && t.results);
    let avgSuccessRate = 0;
    
    if (completedTests.length > 0) {
      const totalSuccessRate = completedTests.reduce((sum, test) => {
        try {
          const results = typeof test.results === 'string' 
            ? JSON.parse(test.results) 
            : test.results;
          const totalRequests = results.summary?.totalRequests || results.requests?.total || 0;
          const successfulRequests = results.summary?.successfulRequests || 
            (totalRequests - (results.errors || 0) - (results.timeouts || 0)) || 0;
          return sum + (totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0);
        } catch {
          return sum;
        }
      }, 0);
      avgSuccessRate = (totalSuccessRate / completedTests.length).toFixed(1);
    }
    
    // Get last test date
    const lastTestDate = tests.length > 0 
      ? tests.reduce((latest, test) => {
          const testDate = new Date(test.createdAt);
          return testDate > latest ? testDate : latest;
        }, new Date(tests[0].createdAt))
      : null;

    return {
      totalEndpoints,
      totalTests,
      avgSuccessRate,
      lastTestDate,
    };
  }, [endpoints, tests]);

  return (
    <div className="mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEndpoints}</p>
            </div>
            <div className="text-4xl text-blue-500">📊</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests Run</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTests}</p>
            </div>
            <div className="text-4xl text-green-500">✓</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.avgSuccessRate > 0 ? `${stats.avgSuccessRate}%` : 'N/A'}
              </p>
            </div>
            <div className="text-4xl text-yellow-500">⚡</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Test</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {stats.lastTestDate 
                  ? format(stats.lastTestDate, 'MMM d, yyyy') 
                  : 'N/A'
                }
              </p>
            </div>
            <div className="text-4xl text-purple-500">📅</div>
          </div>
        </Card>
      </div>

      {/* Search and Sort Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Endpoints
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or URL..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {!searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="url-asc">URL (A → Z)</option>
              <option value="url-desc">URL (Z → A)</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
};
