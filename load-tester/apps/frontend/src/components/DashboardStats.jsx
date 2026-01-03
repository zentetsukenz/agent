import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Server, CheckCircle2, Zap, Clock, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ label, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };

  const Icon = icon;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {trend && (
              <p className={cn('text-xs mt-2 font-medium', trend.positive ? 'text-emerald-600' : 'text-muted-foreground')}>
                {trend.text}
              </p>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
            <Icon aria-hidden="true" className="w-6 h-6" />
          </div>
        </div>
        {/* Decorative element */}
        <div className={cn('absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20', colorClasses[color])} />
      </CardContent>
    </Card>
  );
};

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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Endpoints"
          value={stats.totalEndpoints}
          color="blue"
          icon={Server}
        />

        <StatCard
          label="Tests Run"
          value={stats.totalTests}
          color="green"
          icon={CheckCircle2}
        />

        <StatCard
          label="Avg Success Rate"
          value={stats.avgSuccessRate > 0 ? `${stats.avgSuccessRate}%` : 'N/A'}
          color="amber"
          icon={Zap}
        />

        <StatCard
          label="Last Test"
          value={stats.lastTestDate ? format(stats.lastTestDate, 'MMM d') : 'N/A'}
          color="purple"
          trend={stats.lastTestDate ? { 
            text: format(stats.lastTestDate, 'h:mm a'),
            positive: false 
          } : null}
          icon={Clock}
        />
      </div>

      {/* Search and Sort Controls */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Endpoints</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by name or URL..."
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X aria-hidden="true" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortOption} onValueChange={onSortChange}>
                <SelectTrigger aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                  <SelectItem value="url-asc">URL (A → Z)</SelectItem>
                  <SelectItem value="url-desc">URL (Z → A)</SelectItem>
                  <SelectItem value="created-desc">Newest First</SelectItem>
                  <SelectItem value="created-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
