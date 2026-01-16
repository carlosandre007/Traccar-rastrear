import { useState, useCallback } from 'react';
import { createExtraCost, updateExtraCost, deleteExtraCost } from '../utils/apiUtils';

// Hook para gerenciar operações de custos extras
export const useExtraCosts = (allExtraCosts, setAllExtraCosts) => {
  const [newExtraCostForm, setNewExtraCostForm] = useState({ 
    vehicle_id: '', 
    tipo_custo: '', 
    descricao: '', 
    valor: '' 
  });
  
  const [selectedExtraCost, setSelectedExtraCost] = useState(null);
  const [editExtraCostModalOpen, setEditExtraCostModalOpen] = useState(false);
  const [deleteExtraCostDialogOpen, setDeleteExtraCostDialogOpen] = useState(false);
  const [loadingExtraCosts, setLoadingExtraCosts] = useState(false);

  const handleCreateExtraCost = useCallback(async (e) => {
    e.preventDefault();
    setLoadingExtraCosts(true);
    
    try {
      const costData = await createExtraCost(newExtraCostForm);
      setAllExtraCosts(prev => [...prev, costData]);
      setNewExtraCostForm({ 
        vehicle_id: '', 
        tipo_custo: '', 
        descricao: '', 
        valor: '' 
      });
    } catch (error) {
      console.error('Erro ao criar custo extra:', error);
    } finally {
      setLoadingExtraCosts(false);
    }
  }, [newExtraCostForm, setAllExtraCosts]);

  const handleEditExtraCost = useCallback((cost) => {
    setSelectedExtraCost(cost);
    setEditExtraCostModalOpen(true);
  }, []);

  const handleSaveExtraCostEdit = useCallback(async (updatedData) => {
    if (!selectedExtraCost) return;
    
    setLoadingExtraCosts(true);
    try {
      const updatedCost = await updateExtraCost(selectedExtraCost.id, updatedData);
      setAllExtraCosts(prev => prev.map(cost => 
        cost.id === selectedExtraCost.id ? updatedCost : cost
      ));
      setEditExtraCostModalOpen(false);
      setSelectedExtraCost(null);
    } catch (error) {
      console.error('Erro ao editar custo extra:', error);
    } finally {
      setLoadingExtraCosts(false);
    }
  }, [selectedExtraCost, setAllExtraCosts]);

  const handleDeleteExtraCost = useCallback((cost) => {
    setSelectedExtraCost(cost);
    setDeleteExtraCostDialogOpen(true);
  }, []);

  const handleConfirmDeleteExtraCost = useCallback(async () => {
    if (!selectedExtraCost) return;
    
    setLoadingExtraCosts(true);
    try {
      await deleteExtraCost(selectedExtraCost.id);
      setAllExtraCosts(prev => prev.filter(cost => cost.id !== selectedExtraCost.id));
      setDeleteExtraCostDialogOpen(false);
      setSelectedExtraCost(null);
    } catch (error) {
      console.error('Erro ao deletar custo extra:', error);
    } finally {
      setLoadingExtraCosts(false);
    }
  }, [selectedExtraCost, setAllExtraCosts]);

  return {
    newExtraCostForm,
    setNewExtraCostForm,
    selectedExtraCost,
    editExtraCostModalOpen,
    setEditExtraCostModalOpen,
    deleteExtraCostDialogOpen,
    setDeleteExtraCostDialogOpen,
    loadingExtraCosts,
    handleCreateExtraCost,
    handleEditExtraCost,
    handleSaveExtraCostEdit,
    handleDeleteExtraCost,
    handleConfirmDeleteExtraCost
  };
};
