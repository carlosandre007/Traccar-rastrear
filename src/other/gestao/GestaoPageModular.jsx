import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';

// Importar hooks customizados
import {
  useGestaoData,
  useTrips,
  useDrivers,
  useRefuels,
  useExtraCosts
} from './hooks';

// Importar utilitários de exportação
import { exportData } from './utils/exportUtils';

// Importar componentes modulares
import {
  TripsTab,
  DriversTab,
  VehiclesTab,
  RefuelsTab,
  ExtraCostsTab,
  ReportsTab,
  RefuelingReportsTab
} from './components';

// Importar constantes e utilitários
import { REPORT_PERIODS } from './constants';
import { 
  getCostReports,
  getTripCostReports,
  getCategoryCostReports,
  getConsumptionReports,
  getRefuelingDistanceReports,
  getRefuelingCostReports,
  getRefuels
} from './utils';

const GestaoPageModular = () => {
  // Usar o usuário do Redux store do Traccar
  const user = useSelector((state) => state.session.user);
  
  // Estados principais
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  // Hook para dados principais
  const {
    vehicles,
    drivers,
    openTrips,
    closedTrips,
    allRefuels,
    allExtraCosts,
    loading,
    refreshData,
    setVehicles,
    setDrivers,
    setOpenTrips,
    setClosedTrips,
    setAllRefuels,
    setAllExtraCosts
  } = useGestaoData();

  // Hook para viagens
  const tripsHook = useTrips(openTrips, setOpenTrips, closedTrips, setClosedTrips);

  // Hook para motoristas
  const driversHook = useDrivers(drivers, setDrivers);

  // Hook para abastecimentos
  const refuelsHook = useRefuels(allRefuels, setAllRefuels);

  // Hook para custos extras
  const extraCostsHook = useExtraCosts(allExtraCosts, setAllExtraCosts);

  // Estados para relatórios
  const [reportPeriod, setReportPeriod] = useState(REPORT_PERIODS.MENSAL);
  const [reportVehicle, setReportVehicle] = useState('all');
  const [loadingReports, setLoadingReports] = useState(false);
  const [tripReport, setTripReport] = useState([]);
  const [extraCostReport, setExtraCostReport] = useState([]);
  const [averageConsumption, setAverageConsumption] = useState(0);
  const [categoryCostReport, setCategoryCostReport] = useState([]);

  // Estados para relatórios de abastecimento
  const [refuelingReportFilter, setRefuelingReportFilter] = useState({
    vehicleId: 'all',
    periodo: REPORT_PERIODS.MENSAL,
    startDate: '',
    endDate: ''
  });
  const [refuelingReportTotals, setRefuelingReportTotals] = useState({ km_percorrido: 0 });
  const [refuelingDistanceReport, setRefuelingDistanceReport] = useState([]);
  const [loadingRefuelingReport, setLoadingRefuelingReport] = useState(false);
  const [refuelingCostFilter, setRefuelingCostFilter] = useState({
    vehicleId: 'all',
    periodo: REPORT_PERIODS.MENSAL
  });
  const [totalRefuelingCost, setTotalRefuelingCost] = useState(0);

  // Estados para veículos
  const [editVehicleModalOpen, setEditVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleEditData, setVehicleEditData] = useState({ name: '', tank_capacity: '' });

  // Não precisamos verificar autenticação separadamente
  // O usuário já vem do Redux store do Traccar

  // Funções para relatórios
  const handleGenerateReport = async () => {
    setLoadingReports(true);
    try {
      const filters = {
        periodo: reportPeriod,
        deviceId: reportVehicle === 'all' ? 'all' : reportVehicle
      };
      
      const [trips, extraCosts, consumption, categories] = await Promise.all([
        getTripCostReports(filters),
        getCostReports(filters),
        getConsumptionReports(filters),
        getCategoryCostReports(filters)
      ]);

      setTripReport(trips);
      setExtraCostReport(extraCosts);
      setAverageConsumption(consumption.average || 0);
      setCategoryCostReport(categories);
    } catch (error) {
      setError('Erro ao gerar relatório: ' + error.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleExportReport = () => {
    // Implementar exportação
    console.log('Exportar relatório');
  };

  const handleGenerateRefuelingReport = async () => {
    setLoadingRefuelingReport(true);
    try {
      const filters = {
        periodo: refuelingReportFilter.periodo,
        vehicleId: refuelingReportFilter.vehicleId === 'all' ? 'all' : refuelingReportFilter.vehicleId,
        startDate: refuelingReportFilter.startDate ? refuelingReportFilter.startDate.split('T')[0] : '',
        endDate: refuelingReportFilter.endDate ? refuelingReportFilter.endDate.split('T')[0] : ''
      };
      
      // Buscar dados completos de abastecimentos
      const allRefuels = await getRefuels();
      
      // Filtrar dados baseado nos filtros
      let filteredRefuels = allRefuels || [];
      
      if (filters.vehicleId !== 'all') {
        filteredRefuels = filteredRefuels.filter(refuel => refuel.vehicle_id == filters.vehicleId);
      }
      
      if (filters.startDate) {
        filteredRefuels = filteredRefuels.filter(refuel => 
          new Date(refuel.refuel_date) >= new Date(filters.startDate)
        );
      }
      
      if (filters.endDate) {
        filteredRefuels = filteredRefuels.filter(refuel => 
          new Date(refuel.refuel_date) <= new Date(filters.endDate)
        );
      }
      
      // Ordenar abastecimentos por veículo e data
      const sortedRefuels = filteredRefuels.sort((a, b) => {
        if (a.vehicle_id !== b.vehicle_id) {
          return a.vehicle_id - b.vehicle_id;
        }
        return new Date(a.refuel_date) - new Date(b.refuel_date);
      });
      
      // Calcular consumo para cada abastecimento
      const refuelsWithConsumption = sortedRefuels.map((refuel, index) => {
        let consumption = 0;
        
        // Encontrar o abastecimento anterior do mesmo veículo
        const previousRefuel = sortedRefuels
          .slice(0, index)
          .reverse()
          .find(prev => prev.vehicle_id === refuel.vehicle_id);
        
        if (previousRefuel) {
          const distance = refuel.odometer - previousRefuel.odometer;
          if (distance > 0 && refuel.liters_filled > 0) {
            consumption = distance / refuel.liters_filled;
          }
        }
        
        return {
          ...refuel,
          consumption: consumption
        };
      });

      setRefuelingDistanceReport(refuelsWithConsumption);
      setRefuelingReportTotals({ 
        km_percorrido: refuelsWithConsumption.reduce((sum, item) => sum + (item.odometer || 0), 0) 
      });
      setTotalRefuelingCost(refuelsWithConsumption.reduce((sum, item) => {
        const cost = Number(item.total_cost) || 0;
        return sum + cost;
      }, 0));
    } catch (error) {
      setError('Erro ao gerar relatório de consumo: ' + error.message);
    } finally {
      setLoadingRefuelingReport(false);
    }
  };

  const handleExportRefuelingReport = (format = 'pdf') => {
    if (!refuelingDistanceReport || refuelingDistanceReport.length === 0) {
      alert('Nenhum dado disponível para exportar. Gere o relatório primeiro.');
      return;
    }

    // Preparar dados para exportação
    const exportData = refuelingDistanceReport.map(refuel => ({
      'Veículo': refuel.vehicle_name || `Veículo ${refuel.vehicle_id}`,
      'Data': new Date(refuel.refuel_date).toLocaleDateString('pt-BR'),
      'Odômetro': `${refuel.odometer} km`,
      'Litros': `${refuel.liters_filled} L`,
      'Valor': `R$ ${Number(refuel.total_cost || 0).toFixed(2).replace('.', ',')}`,
      'Posto': refuel.posto_nome || '-',
      'Cidade': refuel.cidade || '-',
      'Consumo': `${Number(refuel.consumption || 0).toFixed(2)} km/L`,
      'Tanque Cheio': refuel.is_full_tank ? 'Sim' : 'Não'
    }));

    // Definir colunas para PDF
    const columns = [
      { field: 'Veículo', headerName: 'Veículo' },
      { field: 'Data', headerName: 'Data' },
      { field: 'Odômetro', headerName: 'Odômetro' },
      { field: 'Litros', headerName: 'Litros' },
      { field: 'Valor', headerName: 'Valor' },
      { field: 'Posto', headerName: 'Posto' },
      { field: 'Cidade', headerName: 'Cidade' },
      { field: 'Consumo', headerName: 'Consumo' },
      { field: 'Tanque Cheio', headerName: 'Tanque Cheio' }
    ];

    // Gerar nome do arquivo com data
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `relatorio-consumo-${dateStr}.${format === 'excel' ? 'xlsx' : format}`;

    // Usar função de exportação
    try {
      exportData(exportData, format, columns, filename);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  // Funções para veículos
  const handleSyncVehicles = async () => {
    try {
      // Sincronizar com a API de gestão
      const syncResponse = await fetch('/gestao/vehicles/sync', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (syncResponse.ok) {
        refreshData();
      } else {
        const errorData = await syncResponse.json();
        setError('Erro ao sincronizar veículos: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      setError('Erro ao sincronizar veículos: ' + error.message);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleEditData({
      name: vehicle.name,
      tank_capacity: vehicle.tank_capacity || ''
    });
    setEditVehicleModalOpen(true);
  };

  const handleSaveVehicleEdit = async () => {
    if (!selectedVehicle) return;
    
    try {
      const response = await fetch(`/gestao/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vehicleEditData)
      });
      
      if (response.ok) {
        setEditVehicleModalOpen(false);
        refreshData();
      } else {
        const errorData = await response.json();
        setError('Erro ao editar veículo: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      setError('Erro ao editar veículo: ' + error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Se não houver usuário, mostrar loading (o App.jsx já gerencia isso)
  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Container>
    );
  }

  // Se estiver carregando, mostrar spinner
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando dados da gestão...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = '/'}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Painel Gestão de Frota
        </Typography>
      </Box>

      {/* Exibir erro se houver */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs de navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={`Viagens em Aberto (${openTrips.length})`} />
          <Tab label="Histórico de Viagens" />
          <Tab label="Motoristas" />
          <Tab label="Veículos" />
          <Tab label="Abastecimentos" />
          <Tab label="Custos Extras" />
          <Tab label="Relatórios de Frota" />
          <Tab label="Relatórios de Consumo" />
        </Tabs>
      </Box>

      {/* Conteúdo das tabs */}
      {activeTab === 0 && (
        <TripsTab
          openTrips={openTrips}
          closedTrips={closedTrips}
          vehicles={vehicles}
          drivers={drivers}
          {...tripsHook}
        />
      )}

      {activeTab === 1 && (
        <TripsTab
          openTrips={openTrips}
          closedTrips={closedTrips}
          vehicles={vehicles}
          drivers={drivers}
          {...tripsHook}
        />
      )}

      {activeTab === 2 && (
        <DriversTab
          drivers={drivers}
          {...driversHook}
        />
      )}

      {activeTab === 3 && (
        <VehiclesTab
          vehicles={vehicles}
          setVehicles={setVehicles}
          editVehicleModalOpen={editVehicleModalOpen}
          setEditVehicleModalOpen={setEditVehicleModalOpen}
          selectedVehicle={selectedVehicle}
          vehicleEditData={vehicleEditData}
          setVehicleEditData={setVehicleEditData}
          loading={loading}
          handleSyncVehicles={handleSyncVehicles}
          handleEditVehicle={handleEditVehicle}
          handleSaveVehicleEdit={handleSaveVehicleEdit}
        />
      )}

      {activeTab === 4 && (
        <RefuelsTab
          vehicles={vehicles}
          allRefuels={allRefuels}
          {...refuelsHook}
        />
      )}

      {activeTab === 5 && (
        <ExtraCostsTab
          vehicles={vehicles}
          allExtraCosts={allExtraCosts}
          {...extraCostsHook}
        />
      )}

      {activeTab === 6 && (
        <ReportsTab
          vehicles={vehicles}
          reportPeriod={reportPeriod}
          setReportPeriod={setReportPeriod}
          reportVehicle={reportVehicle}
          setReportVehicle={setReportVehicle}
          loadingReports={loadingReports}
          tripReport={tripReport}
          extraCostReport={extraCostReport}
          averageConsumption={averageConsumption}
          categoryCostReport={categoryCostReport}
          handleGenerateReport={handleGenerateReport}
          handleExportReport={handleExportReport}
        />
      )}

      {activeTab === 7 && (
        <RefuelingReportsTab
          vehicles={vehicles}
          refuelingReportFilter={refuelingReportFilter}
          setRefuelingReportFilter={setRefuelingReportFilter}
          refuelingReportTotals={refuelingReportTotals}
          refuelingDistanceReport={refuelingDistanceReport}
          loadingRefuelingReport={loadingRefuelingReport}
          totalRefuelingCost={totalRefuelingCost}
          refuelingCostFilter={refuelingCostFilter}
          setRefuelingCostFilter={setRefuelingCostFilter}
          handleGenerateRefuelingReport={handleGenerateRefuelingReport}
          handleExportRefuelingReport={handleExportRefuelingReport}
        />
      )}

    </Container>
  );
};

export default GestaoPageModular;