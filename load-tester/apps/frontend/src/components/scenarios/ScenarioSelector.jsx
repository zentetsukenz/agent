import { useState, useEffect, useMemo } from 'react';
import { scenariosAPI } from '../../services/scenarios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, Clock, Users, ChevronRight, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_TYPE_COLORS } from '../../utils/scenarioConstants';

/**
 * Scenario selection component for ConfigureTest page
 * Allows users to select a scenario to use for test execution
 */
export const ScenarioSelector = ({ 
  selectedScenarioId, 
  onSelect, 
  onClear,
  className 
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedPreview, setExpandedPreview] = useState(null);

  // Fetch scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const data = await scenariosAPI.getAll();
        setScenarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  // Filter and search scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      // Type filter
      if (filterType === 'templates' && !scenario.isTemplate) return false;
      if (filterType === 'custom' && scenario.isTemplate) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          scenario.name.toLowerCase().includes(query) ||
          scenario.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [scenarios, searchQuery, filterType]);

  // Get selected scenario
  const selectedScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId);
  }, [scenarios, selectedScenarioId]);

  // Calculate total duration for a scenario
  const getTotalDuration = (phases) => {
    if (!phases || phases.length === 0) return 0;
    return phases.reduce((sum, phase) => sum + phase.duration, 0);
  };

  // Calculate max connections for a scenario
  const getMaxConnections = (phases) => {
    if (!phases || phases.length === 0) return 0;
    return Math.max(...phases.map(p => p.connections));
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const handleSelect = (scenarioId) => {
    onSelect(scenarioId);
    setExpandedPreview(null);
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)} data-testid="scenario-selector-loading">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // If a scenario is selected, show preview with option to change
  if (selectedScenario) {
    return (
      <div className={cn('space-y-4', className)} data-testid="scenario-selector">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Selected Scenario</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Change
          </Button>
        </div>
        
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{selectedScenario.name}</h4>
                  {selectedScenario.isTemplate && (
                    <Badge variant="secondary" className="text-xs">Template</Badge>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">{selectedScenario.mode}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {selectedScenario.description}
                </p>
                
                {/* Phase summary */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock aria-hidden="true" className="w-4 h-4" />
                    <span>{formatDuration(getTotalDuration(selectedScenario.phases))}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users aria-hidden="true" className="w-4 h-4" />
                    <span>Max {getMaxConnections(selectedScenario.phases)} connections</span>
                  </div>
                  <div className="text-muted-foreground">
                    {selectedScenario.phases?.length || 0} phases
                  </div>
                </div>

                {/* Phase chips */}
                {selectedScenario.phases && selectedScenario.phases.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedScenario.phases.map((phase, index) => {
                      const colors = PHASE_TYPE_COLORS[phase.type] || PHASE_TYPE_COLORS.constant;
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn('text-xs', colors.bg, colors.text)}
                        >
                          {phase.name || `Phase ${index + 1}`}: {formatDuration(phase.duration)}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <Check className="w-5 h-5 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No scenario selected - show list for selection
  return (
    <div className={cn('space-y-4', className)} data-testid="scenario-selector">
      {/* Search and filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="templates">Templates</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scenario list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredScenarios.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No scenarios found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          filteredScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                expandedPreview === scenario.id 
                  ? 'ring-2 ring-primary/50' 
                  : 'hover:border-primary/30'
              )}
              onClick={() => setExpandedPreview(
                expandedPreview === scenario.id ? null : scenario.id
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {scenario.name}
                      </h4>
                      {scenario.isTemplate && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Template
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDuration(getTotalDuration(scenario.phases))}</span>
                      <span>•</span>
                      <span>{scenario.phases?.length || 0} phases</span>
                      <span>•</span>
                      <span className="capitalize">{scenario.mode}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform',
                    expandedPreview === scenario.id && 'rotate-90'
                  )} />
                </div>

                {/* Expanded preview */}
                {expandedPreview === scenario.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-3">
                      {scenario.description}
                    </p>
                    
                    {/* Phase chips */}
                    {scenario.phases && scenario.phases.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {scenario.phases.map((phase, index) => {
                          const colors = PHASE_TYPE_COLORS[phase.type] || PHASE_TYPE_COLORS.constant;
                          return (
                            <Badge
                              key={index}
                              variant="outline"
                              className={cn('text-xs', colors.bg, colors.text)}
                            >
                              {phase.name || `Phase ${index + 1}`}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(scenario.id);
                      }}
                      className="w-full"
                    >
                      Use This Scenario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ScenarioSelector;
