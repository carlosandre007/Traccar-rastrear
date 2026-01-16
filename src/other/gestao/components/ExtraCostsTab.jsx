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
  CircularProgress
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { COST_TYPES } from '../constants';

const ExtraCostsTab = ({
  vehicles,
  allExtraCosts,
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
}) => {
  return (
    <Box>
      {/* Formulário para adicionar custo extra */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Registrar Custo Extra</Typography>
        <Box component="form" onSubmit={handleCreateExtraCost} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Veículo"
                value={newExtraCostForm.vehicle_id}
                onChange={(e) => setNewExtraCostForm(prev => ({ ...prev, vehicle_id: e.target.value }))}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Tipo de Custo"
                value={newExtraCostForm.tipo_custo}
                onChange={(e) => setNewExtraCostForm(prev => ({ ...prev, tipo_custo: e.target.value }))}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {COST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Descrição"
                value={newExtraCostForm.descricao}
                onChange={(e) => setNewExtraCostForm(prev => ({ ...prev, descricao: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Valor (R$)"
                type="number"
                value={newExtraCostForm.valor}
                onChange={(e) => setNewExtraCostForm(prev => ({ ...prev, valor: e.target.value }))}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                disabled={loadingExtraCosts}
              >
                {loadingExtraCosts ? <CircularProgress size={20} /> : 'Registrar Custo'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Lista de custos extras */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Custos Extras Registrados ({allExtraCosts.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allExtraCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>
                    {vehicles.find(v => v.id === cost.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{cost.tipo_custo}</TableCell>
                  <TableCell>{cost.descricao}</TableCell>
                  <TableCell>{formatCurrency(cost.valor)}</TableCell>
                  <TableCell>{formatDate(cost.created_at)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditExtraCost(cost)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteExtraCost(cost)}
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

      {/* Modal para editar custo extra */}
      <Dialog open={editExtraCostModalOpen} onClose={() => setEditExtraCostModalOpen(false)}>
        <DialogTitle>Editar Custo Extra</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Veículo"
                value={selectedExtraCost?.vehicle_id || ''}
                onChange={(e) => {
                  const updatedData = { ...selectedExtraCost, vehicle_id: e.target.value };
                  handleSaveExtraCostEdit(updatedData);
                }}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Custo"
                value={selectedExtraCost?.tipo_custo || ''}
                onChange={(e) => {
                  const updatedData = { ...selectedExtraCost, tipo_custo: e.target.value };
                  handleSaveExtraCostEdit(updatedData);
                }}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {COST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={selectedExtraCost?.descricao || ''}
                onChange={(e) => {
                  const updatedData = { ...selectedExtraCost, descricao: e.target.value };
                  handleSaveExtraCostEdit(updatedData);
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor (R$)"
                type="number"
                value={selectedExtraCost?.valor || ''}
                onChange={(e) => {
                  const updatedData = { ...selectedExtraCost, valor: e.target.value };
                  handleSaveExtraCostEdit(updatedData);
                }}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditExtraCostModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => setEditExtraCostModalOpen(false)} variant="contained" disabled={loadingExtraCosts}>
            {loadingExtraCosts ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteExtraCostDialogOpen} onClose={() => setDeleteExtraCostDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este custo extra? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteExtraCostDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDeleteExtraCost} variant="contained" color="error" disabled={loadingExtraCosts}>
            {loadingExtraCosts ? <CircularProgress size={20} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExtraCostsTab;
