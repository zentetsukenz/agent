import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TestStatusBadge } from './TestStatusBadge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '../../utils/formatters';

// Moved outside component to avoid recreation on render
const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) {
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return sortOrder === 'asc' ? (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export const TestHistory = ({ tests, onSelectForComparison }) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);

  const filteredAndSortedTests = useMemo(() => {
    let filtered = [...tests];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(test => test.status === filterStatus);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(test => new Date(test.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(test => new Date(test.createdAt) <= new Date(endDate + 'T23:59:59'));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'duration':
          aVal = a.duration;
          bVal = b.duration;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [tests, sortBy, sortOrder, filterStatus, startDate, endDate]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectTest = (testId) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else if (prev.length < 4) {
        return [...prev, testId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedTests.length >= 2 && onSelectForComparison) {
      onSelectForComparison(selectedTests);
    }
  };

  if (!tests || tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>View and compare your load test runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No test history available</p>
            <p className="text-sm text-gray-400 mt-1">Run your first test to see results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle>Test History</CardTitle>
            <CardDescription>{filteredAndSortedTests.length} tests found</CardDescription>
          </div>
          {selectedTests.length >= 2 && (
            <Button onClick={handleCompare} size="sm">
              Compare {selectedTests.length} Tests
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setFilterStatus('all');
              setSelectedTests([]);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTests.length === filteredAndSortedTests.length && filteredAndSortedTests.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTests(filteredAndSortedTests.slice(0, 4).map(t => t.id));
                    } else {
                      setSelectedTests([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endpoint
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon field="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center gap-1">
                  Duration
                  <SortIcon field="duration" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Config
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={() => handleSelectTest(test.id)}
                    disabled={!selectedTests.includes(test.id) && selectedTests.length >= 4}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {test.endpoint?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {test.endpoint?.url || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(test.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {test.duration}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.connections} conn
                  {test.rps && ` / ${test.rps} rps`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TestStatusBadge status={test.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/tests/${test.id}/results`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Results
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {filteredAndSortedTests.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500">No tests match the filters</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filter criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
