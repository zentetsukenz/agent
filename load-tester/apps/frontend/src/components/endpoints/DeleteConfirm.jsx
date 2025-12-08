import { useState } from 'react';
import { Button } from '../ui/Button';

export const DeleteConfirm = ({ isOpen, onConfirm, onCancel, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {itemName ? `"${itemName}"` : 'this item'}? This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export const useDeleteConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [itemName, setItemName] = useState('');

  const openConfirm = (id, name = '') => {
    setDeleteId(id);
    setItemName(name);
    setIsOpen(true);
  };

  const closeConfirm = () => {
    setIsOpen(false);
    setDeleteId(null);
    setItemName('');
  };

  const confirmDelete = async (onDelete) => {
    if (deleteId !== null) {
      await onDelete(deleteId);
      closeConfirm();
    }
  };

  return {
    isOpen,
    deleteId,
    itemName,
    openConfirm,
    closeConfirm,
    confirmDelete,
  };
};
