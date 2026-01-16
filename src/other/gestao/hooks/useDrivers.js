import { useState, useCallback } from 'react';
import { createDriver, updateDriver, updateDriverPassword, deleteDriver } from '../utils/apiUtils';
import { formatNameForUsername } from '../utils/formatters';

// Hook para gerenciar operações de motoristas
export const useDrivers = (drivers, setDrivers) => {
  const [newDriver, setNewDriver] = useState({ 
    name: '', 
    cpf: '', 
    cnh_number: '', 
    cnh_category: '', 
    cnh_validity: '', 
    phone: '', 
    username: '', 
    password: '' 
  });
  
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverEditData, setDriverEditData] = useState({ 
    name: '', 
    cpf: '', 
    cnh_number: '', 
    cnh_category: '', 
    cnh_validity: '', 
    phone: '', 
    username: '' 
  });
  
  const [editDriverModalOpen, setEditDriverModalOpen] = useState(false);
  const [deleteDriverDialogOpen, setDeleteDriverDialogOpen] = useState(false);
  const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPasswordCreate, setNewPasswordCreate] = useState('');
  const [createUserError, setCreateUserError] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const handleCreateDriver = useCallback(async (e) => {
    e.preventDefault();
    setLoadingDrivers(true);
    
    try {
      const driverData = await createDriver(newDriver);
      setDrivers(prev => [...prev, driverData]);
      setNewDriver({ 
        name: '', 
        cpf: '', 
        cnh_number: '', 
        cnh_category: '', 
        cnh_validity: '', 
        phone: '', 
        username: '', 
        password: '' 
      });
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
    } finally {
      setLoadingDrivers(false);
    }
  }, [newDriver, setDrivers]);

  const handleEditDriver = useCallback((driver) => {
    setSelectedDriver(driver);
    setDriverEditData({
      name: driver.name,
      cpf: driver.cpf,
      cnh_number: driver.cnh_number,
      cnh_category: driver.cnh_category,
      cnh_validity: driver.cnh_validity,
      phone: driver.phone,
      username: driver.username
    });
    setEditDriverModalOpen(true);
  }, []);

  const handleSaveDriverEdit = useCallback(async () => {
    if (!selectedDriver) return;
    
    // Validar senhas se fornecidas
    if (driverEditData.newPassword || driverEditData.newPasswordConfirm) {
      if (driverEditData.newPassword !== driverEditData.newPasswordConfirm) {
        alert('As senhas não coincidem.');
        return;
      }
      if (driverEditData.newPassword.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
    }
    
    setLoadingDrivers(true);
    try {
      // Primeiro, atualizar os dados do motorista
      const updatedDriver = await updateDriver(selectedDriver.id, driverEditData);
      setDrivers(prev => prev.map(driver => 
        driver.id === selectedDriver.id ? updatedDriver : driver
      ));
      
      // Se uma nova senha foi fornecida, alterar a senha
      if (driverEditData.newPassword) {
        try {
          await updateDriverPassword(selectedDriver.id, driverEditData.newPassword);
        } catch (passwordError) {
          console.error('Erro ao alterar senha:', passwordError);
          alert('Motorista atualizado, mas houve erro ao alterar a senha.');
        }
      }
      
      setEditDriverModalOpen(false);
      setSelectedDriver(null);
      // Limpar campos de senha
      setDriverEditData(prev => ({ ...prev, newPassword: '', newPasswordConfirm: '' }));
    } catch (error) {
      console.error('Erro ao editar motorista:', error);
      alert('Erro ao editar motorista: ' + error.message);
    } finally {
      setLoadingDrivers(false);
    }
  }, [selectedDriver, driverEditData, setDrivers]);

  const handleDeleteDriver = useCallback((driver) => {
    setSelectedDriver(driver);
    setDeleteDriverDialogOpen(true);
  }, []);

  const handleConfirmDeleteDriver = useCallback(async () => {
    if (!selectedDriver) return;
    
    setLoadingDrivers(true);
    try {
      await deleteDriver(selectedDriver.id);
      setDrivers(prev => prev.filter(driver => driver.id !== selectedDriver.id));
      setDeleteDriverDialogOpen(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Erro ao deletar motorista:', error);
    } finally {
      setLoadingDrivers(false);
    }
  }, [selectedDriver, setDrivers]);

  const handleNameChange = useCallback((name) => {
    setNewDriver(prev => ({
      ...prev,
      name,
      username: formatNameForUsername(name)
    }));
  }, []);

  return {
    newDriver,
    setNewDriver,
    selectedDriver,
    driverEditData,
    setDriverEditData,
    editDriverModalOpen,
    setEditDriverModalOpen,
    deleteDriverDialogOpen,
    setDeleteDriverDialogOpen,
    passwordChangeModalOpen,
    setPasswordChangeModalOpen,
    newPassword,
    setNewPassword,
    newPasswordConfirm,
    setNewPasswordConfirm,
    passwordChangeError,
    setPasswordChangeError,
    createUserModalOpen,
    setCreateUserModalOpen,
    newUsername,
    setNewUsername,
    newPasswordCreate,
    setNewPasswordCreate,
    createUserError,
    setCreateUserError,
    loadingDrivers,
    handleCreateDriver,
    handleEditDriver,
    handleSaveDriverEdit,
    handleDeleteDriver,
    handleConfirmDeleteDriver,
    handleNameChange
  };
};
