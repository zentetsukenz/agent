import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Zap, FileText, Code2 } from 'lucide-react';

const methodStyles = {
  GET: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  POST: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  DELETE: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
  HEAD: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
  OPTIONS: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
};

export const EndpointCard = ({ endpoint, onDelete }) => {
  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <Card className="flex flex-col h-full group transition-all hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors">
              {endpoint.name}
            </h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn('font-bold text-xs', methodStyles[endpoint.method] || methodStyles.GET)}
          >
            {endpoint.method}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0 space-y-3">
        {/* URL */}
        <div className="bg-muted/50 px-3 py-2.5 rounded-lg border">
          <p 
            className="text-sm text-muted-foreground font-mono break-all"
            title={endpoint.url}
          >
            {truncateUrl(endpoint.url, 60)}
          </p>
        </div>

        {/* Metadata */}
        {(endpoint.headers || endpoint.body) && (
          <div className="flex gap-3">
            {endpoint.headers && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                Headers
              </span>
            )}
            {endpoint.body && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 className="w-3.5 h-3.5" />
                Body
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <Button asChild className="flex-1">
          <Link to={`/endpoints/${endpoint.id}/test`}>
            <Zap className="w-4 h-4" />
            Run Test
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link to={`/endpoints/${endpoint.id}/edit`} aria-label="Edit endpoint">
            <Pencil className="w-4 h-4" />
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onDelete(endpoint.id)}
          aria-label="Delete endpoint"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
