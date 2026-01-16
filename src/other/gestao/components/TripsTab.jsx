import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';

const TripsTab = ({
  openTrips,
  closedTrips,
  vehicles,
  drivers,
  newTrip,
  setNewTrip,
  handleStartTrip,
  handleOpenFinishDialog,
  handleOpenCancelDialog,
  finishTripDialogOpen,
  cancelTripDialogOpen,
  selectedTrip,
  distanciaFinal,
  setDistanciaFinal,
  handleCloseFinishDialog,
  handleCloseCancelDialog,
  handleFinishTrip,
  handleCancelTrip
}) => {
  return (
    <Box>
      {/* Formulário para iniciar nova viagem */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Iniciar Nova Viagem</Typography>
        <Box component="form" onSubmit={handleStartTrip} sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Veículo"
                value={newTrip.vehicle_id}
                onChange={(e) => setNewTrip(prev => ({ ...prev, vehicle_id: e.target.value }))}
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
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Cidade Origem"
                value={newTrip.start_city}
                onChange={(e) => setNewTrip(prev => ({ ...prev, start_city: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Cidade Destino"
                value={newTrip.end_city}
                onChange={(e) => setNewTrip(prev => ({ ...prev, end_city: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Motorista"
                value={newTrip.driver_id}
                onChange={(e) => setNewTrip(prev => ({ ...prev, driver_id: e.target.value }))}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Selecione</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newTrip.is_round_trip}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, is_round_trip: e.target.checked }))}
                  />
                }
                label="Ida e Volta"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                fullWidth
              >
                Iniciar Viagem
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Viagens em Aberto */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Viagens em Aberto ({openTrips.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Motorista</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {openTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    {vehicles.find(v => v.id === trip.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {drivers.find(d => d.id === trip.driver_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {trip.start_city} → {trip.end_city}
                    {trip.is_round_trip && ' (Ida e Volta)'}
                  </TableCell>
                  <TableCell>{formatDate(trip.start_date)}</TableCell>
                  <TableCell>
                    <Chip label="Em Andamento" color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenFinishDialog(trip)}
                      color="success"
                      size="small"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenCancelDialog(trip)}
                      color="error"
                      size="small"
                    >
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Histórico de Viagens */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de Viagens ({closedTrips.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Motorista</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
                <TableCell>Distância</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {closedTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    {vehicles.find(v => v.id === trip.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {drivers.find(d => d.id === trip.driver_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {trip.start_city} → {trip.end_city}
                    {trip.is_round_trip && ' (Ida e Volta)'}
                  </TableCell>
                  <TableCell>{formatDate(trip.start_date)}</TableCell>
                  <TableCell>{formatDate(trip.end_date)}</TableCell>
                  <TableCell>{trip.distance ? `${trip.distance} km` : 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label="Finalizada" color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para finalizar viagem */}
      <Dialog open={finishTripDialogOpen} onClose={handleCloseFinishDialog}>
        <DialogTitle>Finalizar Viagem</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Distância Percorrida (km)"
            type="number"
            fullWidth
            variant="outlined"
            value={distanciaFinal}
            onChange={(e) => setDistanciaFinal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFinishDialog}>Cancelar</Button>
          <Button onClick={handleFinishTrip} variant="contained">
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cancelar viagem */}
      <Dialog open={cancelTripDialogOpen} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancelar Viagem</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja cancelar esta viagem? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Cancelar</Button>
          <Button onClick={handleCancelTrip} variant="contained" color="error">
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripsTab;
