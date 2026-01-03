import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Layers, Clock, Workflow, ExternalLink } from 'lucide-react';

/**
 * ScenarioInfoCard Component
 * Displays scenario information when a test was run with a scenario
 * 
 * @param {Object} props
 * @param {Object} props.scenario - Scenario object from test.scenario
 */
export const ScenarioInfoCard = ({ scenario }) => {
  if (!scenario) {
    return null;
  }

  const isWorkflow = scenario.type === 'workflow';

  return (
    <Card data-testid="scenario-info-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {isWorkflow ? (
              <Workflow className="w-5 h-5 text-purple-500" />
            ) : (
              <Layers className="w-5 h-5 text-blue-500" />
            )}
            Scenario Used
          </CardTitle>
          <Badge 
            variant="outline" 
            className={isWorkflow ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'}
          >
            {isWorkflow ? 'Workflow' : 'Standard'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Scenario Name */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Name</span>
            <Link 
              to={`/scenarios/${scenario.id}`}
              className="text-sm font-semibold text-foreground hover:text-primary flex items-center gap-1"
            >
              {scenario.name}
              <ExternalLink aria-hidden="true" className="w-3 h-3" />
            </Link>
          </div>

          {/* Description if available */}
          {scenario.description && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Description</span>
              <p className="text-sm text-foreground mt-1">{scenario.description}</p>
            </div>
          )}

          {/* Phase count summary - parse phases if stored as JSON */}
          {scenario.phases && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Phases</span>
              <span className="text-sm text-foreground">
                {(() => {
                  try {
                    const phases = typeof scenario.phases === 'string' 
                      ? JSON.parse(scenario.phases) 
                      : scenario.phases;
                    return `${phases.length} phase${phases.length === 1 ? '' : 's'}`;
                  } catch {
                    return 'N/A';
                  }
                })()}
              </span>
            </div>
          )}

          {/* Workflow steps count if workflow type */}
          {isWorkflow && scenario.workflowSteps && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Workflow Steps</span>
              <span className="text-sm text-foreground">
                {(() => {
                  try {
                    const steps = typeof scenario.workflowSteps === 'string'
                      ? JSON.parse(scenario.workflowSteps)
                      : scenario.workflowSteps;
                    return `${steps.length} step${steps.length === 1 ? '' : 's'}`;
                  } catch {
                    return 'N/A';
                  }
                })()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioInfoCard;
