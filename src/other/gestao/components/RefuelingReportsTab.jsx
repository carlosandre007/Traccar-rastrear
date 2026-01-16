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
import { exportData } from '../utils/exportUtils';

const RefuelingReportsTab = ({
  vehicles,
  refuelingReportFilter,
  setRefuelingReportFilter,
  refuelingReportTotals,
  refuelingDistanceReport,
  loadingRefuelingReport,
  totalRefuelingCost,
  refuelingCostFilter,
  setRefuelingCostFilter,
  handleGenerateRefuelingReport,
  handleExportRefuelingReport
}) => {
  // Função para exportar relatório de consumo
  const handleExportRefuelingReportData = (format = 'excel') => {
    const columns = [
      { field: 'vehicle_name', headerName: 'Veículo' },
      { field: 'refuel_date', headerName: 'Data' },
      { field: 'odometer', headerName: 'Odômetro (km)' },
      { field: 'liters_filled', headerName: 'Litros' },
      { field: 'total_cost', headerName: 'Valor' },
      { field: 'posto_nome', headerName: 'Posto' },
      { field: 'cidade', headerName: 'Cidade' },
      { field: 'consumption', headerName: 'Consumo (km/L)' }
    ];

    const data = (refuelingDistanceReport || []).map(refuel => ({
      ...refuel,
      refuel_date: formatDate(refuel.refuel_date),
      total_cost: formatCurrency(refuel.total_cost),
      consumption: safeToFixed(refuel.consumption, 2) || 'N/A'
    }));

    exportData(data, format, columns, `relatorio_abastecimento_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`);
  };
  return (
    <Box>
      {/* Filtros do relatório de consumo */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Relatórios de Consumo</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select
                value={refuelingReportFilter.vehicleId}
                label="Veículo"
                onChange={(e) => setRefuelingReportFilter(prev => ({ ...prev, vehicleId: e.target.value }))}
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
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={refuelingReportFilter.periodo}
                label="Período"
                onChange={(e) => setRefuelingReportFilter(prev => ({ ...prev, periodo: e.target.value }))}
              >
                <MenuItem value={REPORT_PERIODS.MENSAL}>Mensal</MenuItem>
                <MenuItem value={REPORT_PERIODS.SEMANAL}>Semanal</MenuItem>
                <MenuItem value={REPORT_PERIODS.ANUAL}>Anual</MenuItem>
                <MenuItem value={REPORT_PERIODS.PERSONALIZADO}>Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {refuelingReportFilter.periodo === REPORT_PERIODS.PERSONALIZADO && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Data Início"
                  type="date"
                  value={refuelingReportFilter.startDate}
                  onChange={(e) => setRefuelingReportFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Data Fim"
                  type="date"
                  value={refuelingReportFilter.endDate}
                  onChange={(e) => setRefuelingReportFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateRefuelingReport}
              disabled={loadingRefuelingReport}
              fullWidth
            >
              {loadingRefuelingReport ? <CircularProgress size={20} /> : 'Gerar Relatório'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportRefuelingReportData('pdf')}
              disabled={loadingRefuelingReport || !refuelingDistanceReport.length}
              fullWidth
              sx={{ mr: 1 }}
            >
              PDF
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportRefuelingReportData('excel')}
              disabled={loadingRefuelingReport || !refuelingDistanceReport.length}
              fullWidth
            >
              Excel
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
                Total Abastecimentos
              </Typography>
              <Typography variant="h4">
                {refuelingDistanceReport.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Quilometragem Total
              </Typography>
              <Typography variant="h4">
                {refuelingReportTotals.km_percorrido} km
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Litros
              </Typography>
              <Typography variant="h4">
                {safeToFixed(refuelingDistanceReport?.reduce((sum, refuel) => sum + Number(refuel.liters_filled || 0), 0) || 0, 1)} L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Custo Total
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalRefuelingCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de consumo por veículo */}
      {refuelingDistanceReport.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Consumo por Veículo</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={refuelingDistanceReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumption" fill="#82ca9d" name="Consumo (km/L)" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Tabela de abastecimentos */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Relatório de Consumo</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Veículo</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Odômetro</TableCell>
                <TableCell>Litros</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Posto</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell>Consumo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(refuelingDistanceReport || []).map((refuel, index) => (
                <TableRow key={index}>
                  <TableCell>{refuel.vehicle_name}</TableCell>
                  <TableCell>{formatDate(refuel.refuel_date)}</TableCell>
                  <TableCell>{refuel.odometer} km</TableCell>
                  <TableCell>{refuel.liters_filled} L</TableCell>
                  <TableCell>{formatCurrency(refuel.total_cost)}</TableCell>
                  <TableCell>{refuel.posto_nome || 'N/A'}</TableCell>
                  <TableCell>{refuel.cidade || 'N/A'}</TableCell>
                  <TableCell>{safeToFixed(refuel.consumption, 2)} km/L</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RefuelingReportsTab;
