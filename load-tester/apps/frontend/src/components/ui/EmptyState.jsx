export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-10 w-10',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`text-center ${classes.container}`}>
      {icon && (
        <div className={`mx-auto ${classes.icon} text-gray-300 mb-4`}>
          {icon}
        </div>
      )}
      <h3 className={`${classes.title} font-semibold text-gray-900 mb-2`}>{title}</h3>
      {description && (
        <p className={`${classes.description} text-gray-500 max-w-sm mx-auto mb-6`}>
          {description}
        </p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export const NoResultsState = ({ query, onClear }) => {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No results found"
      description={`No items match "${query}". Try adjusting your search.`}
      action={
        onClear && (
          <button
            onClick={onClear}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Clear search
          </button>
        )
      }
      size="sm"
    />
  );
};
