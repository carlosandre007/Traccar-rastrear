import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, fetchGroups, createUser } from '../../store';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Componente principal da página de clientes
const ClientsPage = () => {
  const dispatch = useDispatch();
  // Acessa dados do Redux com verificação de segurança
  const users = useSelector((state) => state.users?.data || []);
  const groups = useSelector((state) => state.groups?.data || []);
  const userStatus = useSelector((state) => state.users?.status || 'idle');
  const userError = useSelector((state) => state.users?.error || null);
  
  // Estados locais para gerenciar tabela, busca e formulário
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    groupId: '',
    phone: '',
    address: '',
  });
  const [formError, setFormError] = useState('');

  // Log para depuração
  console.log('ClientsPage rendering', { users, groups, userStatus, userError });

  // Busca usuários e grupos ao carregar o componente
  useEffect(() => {
    console.log('Dispatching fetchUsers and fetchGroups');
    dispatch(fetchUsers());
    dispatch(fetchGroups());
  }, [dispatch]);

  // Atualiza as linhas da tabela quando os dados de usuários ou grupos mudam
  useEffect(() => {
    const clientRows = users.map((user) => ({
      id: user.id,
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      phone: user.attributes?.phone || 'N/A',
      address: user.attributes?.address || 'N/A',
      group: groups.find((g) => g.id === user.groupId)?.name || 'N/A',
    }));
    console.log('Updated rows', clientRows);
    setRows(clientRows);
    setFilteredRows(clientRows);
  }, [users, groups]);

  // Filtra as linhas da tabela com base no termo de busca
  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (row.name || '').toLowerCase().includes(lowerCaseSearch) ||
        (row.email || '').toLowerCase().includes(lowerCaseSearch)
    );
    console.log('Filtered rows', filtered);
    setFilteredRows(filtered);
  }, [searchTerm, rows]);

  // Definição das colunas da tabela
  const columns = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'email', headerName: 'E-mail', width: 200 },
    { field: 'phone', headerName: 'Telefone', width: 150 },
    { field: 'address', headerName: 'Endereço', width: 250 },
  ];

  // Abre o modal de cadastro
  const handleOpenModal = () => {
    setOpenModal(true);
    setFormError('');
  };

  // Fecha o modal e limpa o formulário
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ name: '', email: '', password: '', groupId: '', phone: '', address: '' });
    setFormError('');
  };

  // Atualiza os dados do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Atualiza o termo de busca
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Envia o formulário para cadastrar um novo cliente
  const handleSubmit = async () => {
    // Validação básica
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Nome, e-mail e senha são obrigatórios');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      groupId: formData.groupId ? Number(formData.groupId) : null,
      attributes: {
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.address && { address: formData.address }),
      },
    };

    console.log('Submitting user data', userData);
    const result = await dispatch(createUser(userData));
    if (createUser.fulfilled.match(result)) {
      console.log('User created successfully');
      handleCloseModal();
    } else {
      setFormError(result.payload || 'Erro ao cadastrar cliente');
      console.log('User creation failed', result.payload);
    }
  };

  // Exibe mensagem de erro se a busca de usuários falhar
  if (userStatus === 'failed') {
    return (
      <Typography color="error" style={{ padding: 16 }}>
        Erro ao carregar clientes: {userError}
      </Typography>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Botões e barra de busca */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Procurar por nome ou e-mail"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            style={{ marginRight: 16 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSearchTerm('')}
          >
            Limpar
          </Button>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
        >
          Adicionar Cliente
        </Button>
      </Box>
      {/* Tabela de clientes */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          loading={userStatus === 'loading'}
        />
      </div>
      {/* Modal de cadastro */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        <DialogContent>
          {formError && (
            <Typography color="error" style={{ marginBottom: 16 }}>
              {formError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="E-mail"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Senha"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Telefone"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="address"
            label="Endereço"
            type="text"
            fullWidth
            value={formData.address}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Grupo</InputLabel>
            <Select
              name="groupId"
              value={formData.groupId}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClientsPage;