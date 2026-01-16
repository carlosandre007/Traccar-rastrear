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
  Sync as SyncIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { formatDate } from '../utils/formatters';

const VehiclesTab = ({
  vehicles,
  setVehicles,
  editVehicleModalOpen,
  setEditVehicleModalOpen,
  selectedVehicle,
  vehicleEditData,
  setVehicleEditData,
  loading,
  handleSyncVehicles,
  handleEditVehicle,
  handleSaveVehicleEdit
}) => {
  return (
    <Box>
      {/* Cabeçalho com botão de sincronização */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Veículos da Frota</Typography>
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={handleSyncVehicles}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Sincronizar com Traccar'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Total de veículos: {vehicles.length}
        </Typography>
      </Paper>

      {/* Lista de veículos */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lista de Veículos
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>ID Traccar</TableCell>
                <TableCell>Capacidade do Tanque (L)</TableCell>
                <TableCell>Última Atualização</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.traccar_id || 'N/A'}</TableCell>
                  <TableCell>{vehicle.tank_capacity || 'N/A'}</TableCell>
                  <TableCell>{formatDate(vehicle.last_update)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditVehicle(vehicle)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para editar veículo */}
      <Dialog open={editVehicleModalOpen} onClose={() => setEditVehicleModalOpen(false)}>
        <DialogTitle>Editar Veículo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Veículo"
                value={vehicleEditData.name}
                onChange={(e) => setVehicleEditData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacidade do Tanque (L)"
                type="number"
                value={vehicleEditData.tank_capacity}
                onChange={(e) => setVehicleEditData(prev => ({ ...prev, tank_capacity: e.target.value }))}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditVehicleModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveVehicleEdit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesTab;
