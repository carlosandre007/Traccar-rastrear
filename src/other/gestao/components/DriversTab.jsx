import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { formatDate, formatCPF, formatPhone, formatCNH } from '../utils/formatters';
import { CNH_CATEGORIES } from '../constants';

const DriversTab = ({
  drivers,
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
  createUserModalOpen,
  setCreateUserModalOpen,
  newUsername,
  setNewUsername,
  newPasswordCreate,
  setNewPasswordCreate,
  createUserError,
  loadingDrivers,
  handleCreateDriver,
  handleEditDriver,
  handleSaveDriverEdit,
  handleDeleteDriver,
  handleConfirmDeleteDriver,
  handleNameChange
}) => {
  return (
    <Box>
      {/* Formulário para adicionar motorista */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Adicionar Novo Motorista</Typography>
        <Box component="form" onSubmit={handleCreateDriver} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={newDriver.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="CPF"
                value={newDriver.cpf}
                onChange={(e) => setNewDriver(prev => ({ ...prev, cpf: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Número da CNH"
                value={newDriver.cnh_number}
                onChange={(e) => setNewDriver(prev => ({ ...prev, cnh_number: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Categoria CNH"
                value={newDriver.cnh_category}
                onChange={(e) => setNewDriver(prev => ({ ...prev, cnh_category: e.target.value }))}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {CNH_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Validade CNH"
                type="date"
                value={newDriver.cnh_validity}
                onChange={(e) => setNewDriver(prev => ({ ...prev, cnh_validity: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Telefone"
                value={newDriver.phone}
                onChange={(e) => setNewDriver(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Usuário"
                value={newDriver.username}
                onChange={(e) => setNewDriver(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={newDriver.password}
                onChange={(e) => setNewDriver(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                disabled={loadingDrivers}
              >
                {loadingDrivers ? <CircularProgress size={20} /> : 'Adicionar Motorista'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Lista de motoristas */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Motoristas Cadastrados ({drivers.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>CNH</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{formatCPF(driver.cpf)}</TableCell>
                  <TableCell>{formatCNH(driver.cnh_number)}</TableCell>
                  <TableCell>{driver.cnh_category}</TableCell>
                  <TableCell>{formatDate(driver.cnh_validity)}</TableCell>
                  <TableCell>{formatPhone(driver.phone)}</TableCell>
                  <TableCell>{driver.username}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditDriver(driver)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDriver(driver)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para editar motorista */}
      <Dialog open={editDriverModalOpen} onClose={() => setEditDriverModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Motorista</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={driverEditData.name}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                value={driverEditData.cpf}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, cpf: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número da CNH"
                value={driverEditData.cnh_number}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, cnh_number: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Categoria CNH"
                value={driverEditData.cnh_category}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, cnh_category: e.target.value }))}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {CNH_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Validade CNH"
                type="date"
                value={driverEditData.cnh_validity}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, cnh_validity: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={driverEditData.phone}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Usuário"
                value={driverEditData.username}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nova Senha (opcional)"
                type="password"
                value={driverEditData.newPassword || ''}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, newPassword: e.target.value }))}
                helperText="Deixe em branco para manter a senha atual"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type="password"
                value={driverEditData.newPasswordConfirm || ''}
                onChange={(e) => setDriverEditData(prev => ({ ...prev, newPasswordConfirm: e.target.value }))}
                helperText="Digite novamente a nova senha"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDriverModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveDriverEdit} variant="contained" disabled={loadingDrivers}>
            {loadingDrivers ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDriverDialogOpen} onClose={() => setDeleteDriverDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o motorista "{selectedDriver?.name}"? 
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDriverDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDeleteDriver} variant="contained" color="error" disabled={loadingDrivers}>
            {loadingDrivers ? <CircularProgress size={20} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriversTab;
