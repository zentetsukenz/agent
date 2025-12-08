import { TEST_STATUS } from '../../utils/constants';

export const TestStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      [TEST_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [TEST_STATUS.RUNNING]: 'bg-blue-100 text-blue-800',
      [TEST_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
      [TEST_STATUS.FAILED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      [TEST_STATUS.PENDING]: 'Pending',
      [TEST_STATUS.RUNNING]: 'Running',
      [TEST_STATUS.COMPLETED]: 'Completed',
      [TEST_STATUS.FAILED]: 'Failed',
    };
    return texts[status] || 'Unknown';
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status === TEST_STATUS.RUNNING && (
        <span className="mr-2 h-2 w-2 bg-current rounded-full animate-pulse" />
      )}
      {getStatusText(status)}
    </span>
  );
};
