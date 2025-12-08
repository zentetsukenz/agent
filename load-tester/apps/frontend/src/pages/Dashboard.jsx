import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEndpoints } from '../hooks/useEndpoints';
import { endpointsAPI } from '../services/endpoints';
import { EndpointList } from '../components/endpoints/EndpointList';
import { DeleteConfirm, useDeleteConfirm } from '../components/endpoints/DeleteConfirm';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const Dashboard = () => {
  const { endpoints, loading, error, refetch } = useEndpoints();
  const { isOpen, deleteId, itemName, openConfirm, closeConfirm, confirmDelete } = useDeleteConfirm();

  const handleDelete = async (id) => {
    const endpoint = endpoints.find(e => e.id === id);
    openConfirm(id, endpoint?.name);
  };

  const performDelete = async () => {
    try {
      await endpointsAPI.delete(deleteId);
      await refetch();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return <Loading text="Loading endpoints..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  if (endpoints.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No endpoints yet"
        description="Get started by creating your first API endpoint to test."
        action={
          <Link to="/endpoints/new">
            <Button>+ Add Endpoint</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">API Endpoints</h2>
        <Link to="/endpoints/new">
          <Button>+ Add Endpoint</Button>
        </Link>
      </div>

      <EndpointList endpoints={endpoints} onDelete={handleDelete} />

      <DeleteConfirm
        isOpen={isOpen}
        itemName={itemName}
        onConfirm={() => confirmDelete(performDelete)}
        onCancel={closeConfirm}
      />
    </div>
  );
};
