import { EndpointCard } from './EndpointCard';

export const EndpointList = ({ endpoints, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
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
