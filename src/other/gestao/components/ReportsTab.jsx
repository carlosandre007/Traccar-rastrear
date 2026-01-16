import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate, formatCurrency, safeToFixed } from '../utils/formatters';
import { REPORT_PERIODS } from '../constants';

const ReportsTab = ({
  vehicles,
  reportPeriod,
  setReportPeriod,
  reportVehicle,
  setReportVehicle,
  loadingReports,
  tripReport,
  extraCostReport,
  averageConsumption,
  categoryCostReport,
  handleGenerateReport,
  handleExportReport
}) => {
  return (
    <Box>
      {/* Filtros do relatório */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Relatórios de Frota</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={reportPeriod}
                label="Período"
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <MenuItem value={REPORT_PERIODS.MENSAL}>Mensal</MenuItem>
                <MenuItem value={REPORT_PERIODS.SEMANAL}>Semanal</MenuItem>
                <MenuItem value={REPORT_PERIODS.ANUAL}>Anual</MenuItem>
                <MenuItem value={REPORT_PERIODS.PERSONALIZADO}>Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select
                value={reportVehicle}
                label="Veículo"
                onChange={(e) => setReportVehicle(e.target.value)}
              >
                <MenuItem value="all">Todos os Veículos</MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateReport}
              disabled={loadingReports}
              fullWidth
            >
              {loadingReports ? <CircularProgress size={20} /> : 'Gerar Relatório'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportReport}
              disabled={loadingReports || !tripReport.length}
              fullWidth
            >
              Exportar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Viagens
              </Typography>
              <Typography variant="h4">
                {tripReport.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Consumo Médio
              </Typography>
              <Typography variant="h4">
                {safeToFixed(averageConsumption, 2)} km/L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Custos Extras
              </Typography>
              <Typography variant="h4">
                {formatCurrency(extraCostReport.reduce((sum, cost) => sum + cost.valor, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Abastecimentos
              </Typography>
              <Typography variant="h4">
                {tripReport.reduce((sum, trip) => sum + (trip.refuels || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de custos por categoria */}
      {categoryCostReport.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Custos por Categoria</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryCostReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="valor" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Tabela de viagens */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Relatório de Viagens</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Data Início</TableCell>
                <TableCell>Data Fim</TableCell>
                <TableCell>Distância</TableCell>
                <TableCell>Consumo</TableCell>
                <TableCell>Custo Combustível</TableCell>
                <TableCell>Custos Extras</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tripReport.map((trip, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {vehicles.find(v => v.id === trip.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {trip.start_city} → {trip.end_city}
                  </TableCell>
                  <TableCell>{formatDate(trip.start_date)}</TableCell>
                  <TableCell>{formatDate(trip.end_date)}</TableCell>
                  <TableCell>{trip.distance} km</TableCell>
                  <TableCell>{safeToFixed(trip.consumption, 2)} km/L</TableCell>
                  <TableCell>{formatCurrency(trip.fuel_cost || 0)}</TableCell>
                  <TableCell>{formatCurrency(trip.extra_costs || 0)}</TableCell>
                  <TableCell>{formatCurrency((trip.fuel_cost || 0) + (trip.extra_costs || 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tabela de custos extras */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Relatório de Custos Extras</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {extraCostReport.map((cost, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {vehicles.find(v => v.id === cost.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{cost.tipo_custo}</TableCell>
                  <TableCell>{cost.descricao}</TableCell>
                  <TableCell>{formatCurrency(cost.valor)}</TableCell>
                  <TableCell>{formatDate(cost.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReportsTab;
