import { useState, useCallback } from 'react';
import { createRefuel, updateRefuel, deleteRefuel } from '../utils/apiUtils';
import { formatToDatetimeLocal } from '../utils/formatters';

// Hook para gerenciar operações de abastecimentos
export const useRefuels = (allRefuels, setAllRefuels) => {
  const [newStandaloneRefuel, setNewStandaloneRefuel] = useState({
    vehicle_id: '', 
    odometer: '', 
    liters_filled: '', 
    total_cost: '', 
    is_full_tank: false, 
    refuel_date: formatToDatetimeLocal(new Date()), 
    posto_nome: '', 
    cidade: ''
  });
  
  const [refuelFiles, setRefuelFiles] = useState({ 
    foto_bomba: null, 
    foto_odometro: null 
  });
  
  const [selectedRefuel, setSelectedRefuel] = useState(null);
  const [refuelEditData, setRefuelEditData] = useState({
    vehicle_id: '', 
    refuel_date: '', 
    odometer: '', 
    liters_filled: '', 
    total_cost: '', 
    is_full_tank: false, 
    posto_nome: '', 
    cidade: ''
  });
  
  const [editRefuelModalOpen, setEditRefuelModalOpen] = useState(false);
  const [deleteRefuelDialogOpen, setDeleteRefuelDialogOpen] = useState(false);
  const [selectedRefuelToDelete, setSelectedRefuelToDelete] = useState(null);
  const [loadingRefuels, setLoadingRefuels] = useState(false);

  const handleCreateRefuel = useCallback(async (e) => {
    e.preventDefault();
    setLoadingRefuels(true);
    
    try {
      const refuelData = await createRefuel(newStandaloneRefuel);
      setAllRefuels(prev => [...prev, refuelData]);
      setNewStandaloneRefuel({
        vehicle_id: '', 
        odometer: '', 
        liters_filled: '', 
        total_cost: '', 
        is_full_tank: false, 
        refuel_date: formatToDatetimeLocal(new Date()), 
        posto_nome: '', 
        cidade: ''
      });
      setRefuelFiles({ foto_bomba: null, foto_odometro: null });
    } catch (error) {
      console.error('Erro ao criar abastecimento:', error);
    } finally {
      setLoadingRefuels(false);
    }
  }, [newStandaloneRefuel, setAllRefuels]);

  const handleEditRefuel = useCallback((refuel) => {
    setSelectedRefuel(refuel);
    setRefuelEditData({
      vehicle_id: refuel.vehicle_id,
      refuel_date: formatToDatetimeLocal(refuel.refuel_date),
      odometer: refuel.odometer,
      liters_filled: refuel.liters_filled,
      total_cost: refuel.total_cost,
      is_full_tank: refuel.is_full_tank,
      posto_nome: refuel.posto_nome,
      cidade: refuel.cidade
    });
    setEditRefuelModalOpen(true);
  }, []);

  const handleSaveRefuelEdit = useCallback(async (editFiles = {}) => {
    if (!selectedRefuel) return;
    
    setLoadingRefuels(true);
    try {
      // Se há arquivos para upload, fazer upload primeiro
      let fotoBombaPath = refuelEditData.foto_bomba;
      let fotoOdometroPath = refuelEditData.foto_odometro;
      
      if (editFiles.foto_bomba) {
        const formData = new FormData();
        formData.append('file', editFiles.foto_bomba);
        const uploadResponse = await fetch('/gestao/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          fotoBombaPath = uploadResult.filePath;
        }
      }
      
      if (editFiles.foto_odometro) {
        const formData = new FormData();
        formData.append('file', editFiles.foto_odometro);
        const uploadResponse = await fetch('/gestao/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          fotoOdometroPath = uploadResult.filePath;
        }
      }
      
      const updatedData = {
        ...refuelEditData,
        foto_bomba: fotoBombaPath,
        foto_odometro: fotoOdometroPath
      };
      
      const updatedRefuel = await updateRefuel(selectedRefuel.id, updatedData);
      setAllRefuels(prev => prev.map(refuel => 
        refuel.id === selectedRefuel.id ? updatedRefuel : refuel
      ));
      setEditRefuelModalOpen(false);
      setSelectedRefuel(null);
    } catch (error) {
      console.error('Erro ao editar abastecimento:', error);
    } finally {
      setLoadingRefuels(false);
    }
  }, [selectedRefuel, refuelEditData, setAllRefuels]);

  const handleDeleteRefuel = useCallback((refuel) => {
    setSelectedRefuelToDelete(refuel);
    setDeleteRefuelDialogOpen(true);
  }, []);

  const handleConfirmDeleteRefuel = useCallback(async () => {
    if (!selectedRefuelToDelete) return;
    
    setLoadingRefuels(true);
    try {
      await deleteRefuel(selectedRefuelToDelete.id);
      setAllRefuels(prev => prev.filter(refuel => refuel.id !== selectedRefuelToDelete.id));
      setDeleteRefuelDialogOpen(false);
      setSelectedRefuelToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar abastecimento:', error);
    } finally {
      setLoadingRefuels(false);
    }
  }, [selectedRefuelToDelete, setAllRefuels]);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setRefuelFiles(prev => ({
      ...prev,
      [name]: files[0] || null
    }));
  }, []);

  return {
    newStandaloneRefuel,
    setNewStandaloneRefuel,
    refuelFiles,
    setRefuelFiles,
    selectedRefuel,
    refuelEditData,
    setRefuelEditData,
    editRefuelModalOpen,
    setEditRefuelModalOpen,
    deleteRefuelDialogOpen,
    setDeleteRefuelDialogOpen,
    selectedRefuelToDelete,
    loadingRefuels,
    handleCreateRefuel,
    handleEditRefuel,
    handleSaveRefuelEdit,
    handleDeleteRefuel,
    handleConfirmDeleteRefuel,
    handleFileChange
  };
};
