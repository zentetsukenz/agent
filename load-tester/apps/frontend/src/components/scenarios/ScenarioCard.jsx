import { Link } from 'react-router-dom';
import { Clock, Users, Zap, Copy, Play, FileText, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  getTotalDuration, 
  getMaxConnections, 
  formatDuration 
} from '@/services/scenarios';
import { cn } from '@/lib/utils';

// Phase type colors
const phaseTypeColors = {
  ramp: 'bg-blue-100 text-blue-700 border-blue-200',
  constant: 'bg-green-100 text-green-700 border-green-200',
  spike: 'bg-orange-100 text-orange-700 border-orange-200',
};

// Mini visualization of load profile
const MiniLoadProfile = ({ phases }) => {
  const maxConnections = getMaxConnections(phases);
  const totalDuration = getTotalDuration(phases);
  
  if (maxConnections === 0 || totalDuration === 0) return null;

  // Generate SVG path points
  let currentX = 0;
  const points = [{ x: 0, y: 0 }];
  
  phases.forEach((phase) => {
    const width = (phase.duration / totalDuration) * 100;
    const height = (phase.connections / maxConnections) * 100;
    
    if (phase.type === 'ramp') {
      // Ramp: line from current to target
      points.push({ x: currentX + width, y: height });
    } else {
      // Constant: horizontal line at current level, then to target
      const prevY = points[points.length - 1]?.y || 0;
      if (phase.type === 'constant') {
        points.push({ x: currentX, y: height });
        points.push({ x: currentX + width, y: height });
      } else {
        // Spike: quick up/down
        points.push({ x: currentX + width / 2, y: height });
        points.push({ x: currentX + width, y: prevY });
      }
    }
    currentX += width;
  });

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`)
    .join(' ');

  return (
    <div className="h-12 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="w-full h-full"
      >
        {/* Fill area */}
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          opacity="0.3"
        />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary-500"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className="text-primary-500" />
            <stop offset="100%" stopColor="currentColor" className="text-primary-100" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const ScenarioCard = ({ 
  scenario, 
  onDuplicate,
  onDelete,
  showActions = true 
}) => {
  const { id, name, description, phases, isTemplate } = scenario;
  const totalDuration = getTotalDuration(phases);
  const maxConnections = getMaxConnections(phases);

  return (
    <Card className="group hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to={`/scenarios/${id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate"
              >
                {name}
              </Link>
              {isTemplate && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Template
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Load Profile Visualization */}
        <MiniLoadProfile phases={phases} />
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{maxConnections} max</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-gray-400" />
            <span>{phases.length} phases</span>
          </div>
        </div>

        {/* Phase Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {phases.slice(0, 4).map((phase, index) => (
            <span
              key={index}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                phaseTypeColors[phase.type] || phaseTypeColors.constant
              )}
            >
              {phase.name}
            </span>
          ))}
          {phases.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              +{phases.length - 4} more
            </span>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 hover:text-gray-900"
              >
                <Link to={`/scenarios/${id}`}>
                  <FileText className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
              
              {!isTemplate && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Link to={`/scenarios/${id}/edit`}>
                    <Pencil aria-hidden="true" className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate?.(id)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Copy aria-hidden="true" className="w-4 h-4 mr-1" />
                Duplicate
              </Button>
              
              {!isTemplate && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(id, name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 aria-hidden="true" className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
