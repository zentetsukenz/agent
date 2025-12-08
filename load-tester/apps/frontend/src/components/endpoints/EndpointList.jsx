import { EndpointCard } from './EndpointCard';

export const EndpointList = ({ endpoints, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {endpoints.map((endpoint) => (
        <EndpointCard 
          key={endpoint.id} 
          endpoint={endpoint} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
