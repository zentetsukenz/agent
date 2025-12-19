export const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="mt-4 text-gray-500 font-medium">{text}</p>}
    </div>
  );
};

export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    circle: 'rounded-full',
    card: 'h-32 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div 
      className={`skeleton bg-gray-200 ${variants[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton variant="title" className="w-3/4 mb-2" />
          <Skeleton className="w-full" />
        </div>
        <Skeleton className="w-12 h-6 rounded ml-2" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton variant="button" className="w-20" />
        <Skeleton variant="button" className="w-16" />
        <Skeleton variant="button" className="w-16" />
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse-subtle">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
            <Skeleton className="w-1/2 mb-2" />
            <Skeleton variant="title" className="w-1/3" />
          </div>
        ))}
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const PageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export const ProgressBar = ({ value, max = 100, showLabel = true, className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-primary-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};

export const IndeterminateProgress = ({ className = '' }) => {
  return (
    <div className={`w-full h-1 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full w-1/3 bg-primary-500 rounded-full progress-indeterminate" />
    </div>
  );
};
