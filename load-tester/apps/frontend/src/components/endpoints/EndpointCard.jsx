import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export const EndpointCard = ({ endpoint, onDelete }) => {
  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{endpoint.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1 break-all">{endpoint.url}</p>
          </div>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link to={`/endpoints/${endpoint.id}/test`}>
            <Button size="sm" variant="primary">
              Run Test
            </Button>
          </Link>
          <Link to={`/endpoints/${endpoint.id}/edit`}>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => onDelete(endpoint.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
