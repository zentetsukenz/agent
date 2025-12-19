import { useState } from 'react';

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
