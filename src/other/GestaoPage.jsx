import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Box, Typography, Button, Paper, Grid, TextField,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
    Tabs, Tab, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Checkbox, FormControlLabel, IconButton, ImageList, ImageListItem, ImageListItemBar,
    Autocomplete, Chip, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import LoginIcon from '@mui/icons-material/Login';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { applyPlugin as applyAutoTablePlugin } from 'jspdf-autotable';

applyAutoTablePlugin(jsPDF);

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Constantes e Funções Auxiliares ---
const API_TRACCAR_URL = '/api/devices';
const API_GESTAO_URL = '/gestao';

const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatToDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const styleModal = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 600,
    bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2
};

const apiConfig = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
};

const formatNameForUsername = (name) => {
    if (!name) return '';
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '');
};

// =============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// =============================================================================
const GestaoFrotaPage = () => {
    
    // --- ESTADOS DO COMPONENTE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // -- Viagens --
    const [openTrips, setOpenTrips] = useState([]);
    const [closedTrips, setClosedTrips] = useState([]);
    const [newTrip, setNewTrip] = useState({ vehicle_id: '', start_city: '', end_city: '', is_round_trip: false, driver_id: '' });

    // -- Motoristas --
    const [drivers, setDrivers] = useState([]);
    const [newDriver, setNewDriver] = useState({ name: '', cpf: '', cnh_number: '', cnh_category: '', cnh_validity: '', phone: '', username: '', password: '' });
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [editDriverModalOpen, setEditDriverModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverEditData, setDriverEditData] = useState({ name: '', cpf: '', cnh_number: '', cnh_category: '', cnh_validity: '', phone: '', username: '' });
    const [deleteDriverDialogOpen, setDeleteDriverDialogOpen] = useState(false);
    const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPasswordCreate, setNewPasswordCreate] = useState('');
    const [createUserError, setCreateUserError] = useState('');

    // NOVOS ESTADOS para o modal de associação de veículos
    const [editDriverVehiclesModalOpen, setEditDriverVehiclesModalOpen] = useState(false);
    const [loadingDriverVehicles, setLoadingDriverVehicles] = useState(false);
    const [selectedVehiclesForDriver, setSelectedVehiclesForDriver] = useState([]);

    // -- Abastecimentos --
    const [newStandaloneRefuel, setNewStandaloneRefuel] = useState({
        vehicle_id: '', odometer: '', liters_filled: '', total_cost: '', is_full_tank: false, refuel_date: formatToDatetimeLocal(new Date()), posto_nome: '', cidade: ''
    });
    const [refuelFiles, setRefuelFiles] = useState({ foto_bomba: null, foto_odometro: null });
    const [allRefuels, setAllRefuels] = useState([]);
    const [loadingRefuels, setLoadingRefuels] = useState(false);
    const [deleteRefuelDialogOpen, setDeleteRefuelDialogOpen] = useState(false);
    const [selectedRefuelToDelete, setSelectedRefuelToDelete] = useState(null);
    const [editRefuelModalOpen, setEditRefuelModalOpen] = useState(false);
    const [selectedRefuel, setSelectedRefuel] = useState(null);
    const [refuelEditData, setRefuelEditData] = useState({
        vehicle_id: '', refuel_date: '', odometer: '', liters_filled: '', total_cost: '', is_full_tank: false, posto_nome: '', cidade: '',
    });

    // -- Custos Extras --
    const [newExtraCostForm, setNewExtraCostForm] = useState({ vehicle_id: '', tipo_custo: '', descricao: '', valor: '' });
    const [allExtraCosts, setAllExtraCosts] = useState([]);
    const [loadingExtraCosts, setLoadingExtraCosts] = useState(false);

    // -- Relatórios --
    const [reportPeriod, setReportPeriod] = useState('mensal');
    const [reportVehicle, setReportVehicle] = useState('all');
    const [loadingReports, setLoadingReports] = useState(false);
    const [tripReport, setTripReport] = useState([]);
    const [extraCostReport, setExtraCostReport] = useState([]);
    const [averageConsumption, setAverageConsumption] = useState(0);
    const [categoryCostReport, setCategoryCostReport] = useState([]);
    const [refuelingReportFilter, setRefuelingReportFilter] = useState({
        vehicleId: 'all', periodo: 'mensal', startDate: '', endDate: '',
    });
    const [refuelingReportTotals, setRefuelingReportTotals] = useState({ km_percorrido: 0 });
    const [refuelingDistanceReport, setRefuelingDistanceReport] = useState([]);
    const [loadingRefuelingReport, setLoadingRefuelingReport] = useState(false);
    const [refuelingCostFilter, setRefuelingCostFilter] = useState({
        vehicleId: 'all', periodo: 'mensal',
    });
    const [totalRefuelingCost, setTotalRefuelingCost] = useState(0);

    // -- Modais e Diálogos --
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imagesToDisplay, setImagesToDisplay] = useState([]);
    const [costModalOpen, setCostModalOpen] = useState(false);
    const [finishTripDialogOpen, setFinishTripDialogOpen] = useState(false);
    const [cancelTripDialogOpen, setCancelTripDialogOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [newCost, setNewCost] = useState({
        descricao: '', tipo_custo: '', valor: '', odometer: '', liters_filled: '', is_full_tank: false, posto_nome: '', cidade: '',
    });
    const [costRefuelFiles, setCostRefuelFiles] = useState({ foto_bomba: null, foto_odometro: null });
    const [distanciaFinal, setDistanciaFinal] = useState('');
    const [editVehicleModalOpen, setEditVehicleModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleEditData, setVehicleEditData] = useState({ name: '', tank_capacity: '' });
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [mapTripData, setMapTripData] = useState([]);
    const [mapTripName, setMapTripName] = useState('');

    // NOVOS ESTADOS PARA O MENU DE EXPORTAÇÃO
    const [anchorElTrip, setAnchorElTrip] = useState(null);
    const [anchorElCost, setAnchorElCost] = useState(null);
    const [anchorElRefuel, setAnchorElRefuel] = useState(null);

    const handleOpenExportMenu = (event, type) => {
        if (type === 'trip') setAnchorElTrip(event.currentTarget);
        if (type === 'cost') setAnchorElCost(event.currentTarget);
        if (type === 'refuel') setAnchorElRefuel(event.currentTarget);
    };

    const handleCloseExportMenu = (type) => {
        if (type === 'trip') setAnchorElTrip(null);
        if (type === 'cost') setAnchorElCost(null);
        if (type === 'refuel') setAnchorElRefuel(null);
    };

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [vehiclesRes, openTripsRes, closedTripsRes] = await Promise.all([
                fetch(API_GESTAO_URL + '/vehicles', { ...apiConfig }),
                fetch(`${API_GESTAO_URL}/trips?status=Em%20Andamento`, { ...apiConfig }),
                fetch(`${API_GESTAO_URL}/trips?status=FINALIZADA`, { ...apiConfig })
            ]);
            if (!vehiclesRes.ok || !openTripsRes.ok || !closedTripsRes.ok) {
                if (vehiclesRes.status === 401 || vehiclesRes.status === 403) {
                    setIsAuthenticated(false);
                    throw new Error("Não autenticado. Por favor, faça login na plataforma de rastreamento.");
                }
                throw new Error('Falha ao carregar dados iniciais.');
            }

            const vehiclesData = await vehiclesRes.json();
            const openTripsData = await openTripsRes.json();
            const closedTripsData = await closedTripsRes.json();

            setVehicles(vehiclesData);
            setOpenTrips(openTripsData);
            setClosedTrips(closedTripsData);
            setIsAuthenticated(true);
        } catch (err) {
            setError(err.message);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDrivers = useCallback(async () => {
        setLoadingDrivers(true);
        try {
            const response = await fetch(`${API_GESTAO_URL}/drivers`, { ...apiConfig });
            if (!response.ok) throw new Error('Falha ao buscar motoristas.');
            const data = await response.json();
            setDrivers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDrivers(false);
        }
    }, []);

    const fetchAllRefuels = useCallback(async () => {
        setLoadingRefuels(true);
        try {
            const response = await fetch(`${API_GESTAO_URL}/abastecimentos/todos`, { ...apiConfig });
            if (!response.ok) throw new Error('Falha ao buscar o histórico de abastecimentos.');
            const data = await response.json();
            setAllRefuels(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingRefuels(false);
        }
    }, []);

    const fetchExtraCosts = useCallback(async () => {
        setLoadingExtraCosts(true);
        try {
            const params = new URLSearchParams({
                periodo: reportPeriod,
                deviceId: reportVehicle
            }).toString();
            const url = `${API_GESTAO_URL}/relatorios/custos-extras?${params}`;

            const response = await fetch(url, { ...apiConfig });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao buscar o histórico de custos extras. Resposta: ${errorText}`);
            }

            const data = await response.json();
            setAllExtraCosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingExtraCosts(false);
        }
    }, [reportPeriod, reportVehicle]);

    const fetchRefuelingReportData = useCallback(async (filters) => {
        setLoadingRefuelingReport(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_GESTAO_URL}/relatorios/distancia-abastecimentos?${params}`, { ...apiConfig });
            if (!response.ok) throw new Error('Falha ao buscar o relatório de abastecimentos.');
            const data = await response.json();

            const km_percorrido = data.reduce((sum, item) => sum + (Number(item.distancia_percorrida) || 0), 0);
            setRefuelingReportTotals({ km_percorrido });
            setRefuelingDistanceReport(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingRefuelingReport(false);
        }
    }, []);

    const fetchTotalRefuelingCost = useCallback(async (filters) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_GESTAO_URL}/relatorios/custo-abastecimento-total?${params}`, { ...apiConfig });
            if (!response.ok) throw new Error('Falha ao buscar o custo total de abastecimento.');
            const data = await response.json();
            setTotalRefuelingCost(data.total);
        } catch (err) {
            console.error(err);
            setTotalRefuelingCost(0);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        setLoadingReports(true);
        try {
            const baseUrl = API_GESTAO_URL;
            const params = `?periodo=${reportPeriod}&deviceId=${reportVehicle}`;

            const [tripReportRes, extraCostReportRes, consumptionRes, categoryRes] = await Promise.all([
                fetch(`${baseUrl}/relatorios/custos-por-viagem${params}`, { ...apiConfig }),
                fetch(`${baseUrl}/relatorios/custos-extras${params}`, { ...apiConfig }),
                fetch(`${baseUrl}/relatorios/consumo-medio?deviceId=${reportVehicle}`, { ...apiConfig }),
                fetch(`${baseUrl}/relatorios/custos-por-categoria${params}`, { ...apiConfig })
            ]);

            if (!tripReportRes.ok || !extraCostReportRes.ok || !consumptionRes.ok || !categoryRes.ok) {
                throw new Error('Falha ao carregar dados dos relatórios.');
            }

            const tripData = await tripReportRes.json();
            const extraCostData = await extraCostReportRes.json();
            const consumptionData = await consumptionRes.json();
            const categoryData = await categoryRes.json();

            setTripReport(tripData);
            setExtraCostReport(extraCostData);
            setAverageConsumption(consumptionData.consumo_medio);
            setCategoryCostReport(categoryData.map(item => ({ name: item.tipo_custo, value: parseFloat(item.total) })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingReports(false);
        }
    }, [reportPeriod, reportVehicle]);

    const fetchDriverVehicles = useCallback(async (driverId) => {
        setLoadingDriverVehicles(true);
        try {
            const response = await fetch(`${API_GESTAO_URL}/drivers/${driverId}/vehicles`, { ...apiConfig });
            if (!response.ok) {
                throw new Error('Falha ao buscar veículos do motorista.');
            }
            const data = await response.json();
            setSelectedVehiclesForDriver(data.map(v => v.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDriverVehicles(false);
        }
    }, []);

    const handleOpenEditDriverVehiclesModal = (driver) => {
        setSelectedDriver(driver);
        setEditDriverVehiclesModalOpen(true);
    };

    const handleCloseEditDriverVehiclesModal = () => {
        setEditDriverVehiclesModalOpen(false);
        setSelectedDriver(null);
        setSelectedVehiclesForDriver([]);
    };

    const handleSaveDriverVehiclesEdit = async () => {
        if (!selectedDriver) return;
        try {
            const payload = { vehicle_ids: selectedVehiclesForDriver };
            const response = await fetch(`${API_GESTAO_URL}/drivers/${selectedDriver.id}/vehicles`, {
                method: 'PUT',
                ...apiConfig,
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar a lista de veículos.');
            }
            alert('Veículos do motorista atualizados com sucesso!');
            handleCloseEditDriverVehiclesModal();
            fetchDrivers();
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };
    
    // Método para sincronizar veículos
    const handleSyncVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_GESTAO_URL}/vehicles/sync`, { ...apiConfig });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha na sincronização: ${errorText}`);
            }
            const result = await response.json();
            // AQUI: A mensagem de alerta agora é mais detalhada
            alert(`Sincronização concluída! Novos veículos adicionados: ${result.new_vehicles}. Veículos atualizados: ${result.updated_vehicles}.`);
            await fetchData(); // Recarrega os dados para mostrar as atualizações
        } catch (err) {
            setError(err.message);
            alert(`Erro na sincronização: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- USEFFECTS ---
    useEffect(() => {
        fetchData();
        fetchDrivers();
    }, [fetchData, fetchDrivers]);

    useEffect(() => {
        if (isAuthenticated && activeTab === 5) {
            fetchExtraCosts();
        }
    }, [isAuthenticated, activeTab, fetchExtraCosts]);

    useEffect(() => {
        if (isAuthenticated && activeTab === 6) {
            fetchReports();
            fetchTotalRefuelingCost(refuelingCostFilter);
        }
    }, [isAuthenticated, activeTab, reportPeriod, reportVehicle, fetchReports, fetchTotalRefuelingCost, refuelingCostFilter]);

    useEffect(() => {
        if (isAuthenticated && activeTab === 7) {
            fetchRefuelingReportData(refuelingReportFilter);
        }
        if (isAuthenticated && activeTab === 7) {
            fetchTotalRefuelingCost(refuelingReportFilter);
        }
    }, [isAuthenticated, activeTab, refuelingReportFilter, fetchRefuelingReportData, fetchTotalRefuelingCost]);

    useEffect(() => {
        if (editDriverVehiclesModalOpen && selectedDriver) {
            fetchDriverVehicles(selectedDriver.id);
        }
    }, [editDriverVehiclesModalOpen, selectedDriver, fetchDriverVehicles]);

    // --- FUNÇÕES DE LÓGICA DE NEGÓCIO ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 2) fetchDrivers();
        if (newValue === 3) fetchData();
        if (newValue === 4) fetchAllRefuels();
        if (newValue === 5) fetchExtraCosts();
        if (newValue === 6) fetchReports();
        if (newValue === 7) fetchRefuelingReportData(refuelingReportFilter);
    };

    const handleInputChange = (setter) => (event) => {
        const { name, value, checked, type } = event.target;
        setter(prev => {
            const newValue = type === 'checkbox' ? checked : value;
            const newState = { ...prev, [name]: newValue };
            if (name === 'name' && setter === setNewDriver) {
                const generatedUsername = formatNameForUsername(value);
                newState.username = generatedUsername;
                newState.password = generatedUsername;
            }
            return newState;
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setRefuelFiles(prev => ({ ...prev, [name]: files[0] }));
        }
    };
    const handleCostFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setCostRefuelFiles(prev => ({ ...prev, [name]: files[0] }));
        }
    };
    const handleVehicleSelectChange = (setter, vehicleList) => (event) => {
        const { name, value } = event.target;
        const selectedVehicle = vehicleList.find(v => v.id === value);
        setter(prev => ({ ...prev, [name]: value, ...(name === 'vehicle_id' && { nome_veiculo: selectedVehicle?.name || '' }) }));
    };

    // --- FUNÇÕES DE CRIAÇÃO E EDIÇÃO ---
    const uploadFile = async (file) => {
        if (!file) {
            console.warn('Nenhum arquivo para upload.');
            return null;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${API_GESTAO_URL}/upload`, {
                method: 'POST', body: formData, credentials: apiConfig.credentials
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha no upload do arquivo. Resposta do servidor: ${response.status} - ${errorText}`);
            }
            const result = await response.json();
            return result.filePath;
        } catch (err) {
            console.error('Erro durante o upload:', err.message);
            setError(err.message);
            return null;
        }
    };

    // -- Lógica de Viagens --
    const handleStartTrip = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_GESTAO_URL}/trips/iniciar`, {
                method: 'POST', ...apiConfig, body: JSON.stringify(newTrip)
            });
            if (!response.ok) throw new Error('Falha ao iniciar viagem.');
            const addedTrip = await response.json();
            setOpenTrips(prev => [addedTrip, ...prev]);
            setNewTrip({ vehicle_id: '', start_city: '', end_city: '', is_round_trip: false, driver_id: '' });
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenCostModal = (trip) => {
        setSelectedTrip(trip);
        setCostModalOpen(true);
    };
    const handleCloseCostModal = () => {
        setCostModalOpen(false);
        setSelectedTrip(null);
        setNewCost({ descricao: '', tipo_custo: '', valor: '', odometer: '', liters_filled: '', is_full_tank: false, posto_nome: '', cidade: '' });
        setCostRefuelFiles({ foto_bomba: null, foto_odometro: null });
    };
    const handleAddCost = async (e) => {
        e.preventDefault();
        if (!selectedTrip) return;
        try {
            const valorCorrigido = newCost.valor ? parseFloat(newCost.valor.toString().replace(',', '.')) : null;
            const odometerCorrigido = newCost.odometer ? parseFloat(newCost.odometer.toString().replace(',', '.')) : null;
            const litersCorrigido = newCost.liters_filled ? parseFloat(newCost.liters_filled.toString().replace(',', '.')) : null;
            let finalDescription = newCost.descricao;
            let refuelPayload = null;
            if (newCost.tipo_custo === 'ABASTECIMENTO') {
                finalDescription = `Abastecimento de ${litersCorrigido || 0} L`;
                const fotoBombaUrl = costRefuelFiles.foto_bomba ? await uploadFile(costRefuelFiles.foto_bomba) : null;
                const fotoOdometroUrl = costRefuelFiles.foto_odometro ? await uploadFile(costRefuelFiles.foto_odometro) : null;
                if (costRefuelFiles.foto_bomba && !fotoBombaUrl) throw new Error('Falha no upload da foto da bomba.');
                if (costRefuelFiles.foto_odometro && !fotoOdometroUrl) throw new Error('Falha no upload da foto do hodômetro.');
                refuelPayload = {
                    vehicle_id: selectedTrip.vehicle_id, driver_id: selectedTrip.driver_id, refuel_date: new Date().toISOString(),
                    odometer: odometerCorrigido, liters_filled: litersCorrigido, price_per_liter: null,
                    total_cost: valorCorrigido, is_full_tank: newCost.is_full_tank, posto_nome: newCost.posto_nome,
                    cidade: newCost.cidade, viagem_id: selectedTrip.id,
                };
                const refuelResponse = await fetch(`${API_GESTAO_URL}/refuelings`, {
                    method: 'POST', ...apiConfig, body: JSON.stringify(refuelPayload)
                });
                if (!refuelResponse.ok) throw new Error('Falha ao registrar detalhes do abastecimento.');
            }
            const costPayload = {
                vehicle_id: selectedTrip.vehicle_id, viagem_id: selectedTrip.id, tipo_custo: newCost.tipo_custo,
                descricao: finalDescription, valor: valorCorrigido
            };
            const costResponse = await fetch(`${API_GESTAO_URL}/custos`, {
                method: 'POST', ...apiConfig, body: JSON.stringify(costPayload)
            });
            if (!costResponse.ok) throw new Error('Detalhes do abastecimento registrados, mas falha ao adicionar custo financeiro.');
            alert('Custo adicionado com sucesso!');
            handleCloseCostModal();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenFinishDialog = (trip) => {
        setSelectedTrip(trip);
        setFinishTripDialogOpen(true);
    };
    const handleCloseFinishDialog = () => {
        setFinishTripDialogOpen(false);
        setSelectedTrip(null);
        setDistanciaFinal('');
    };
    const handleFinishTrip = async () => {
        if (!selectedTrip) return;
        try {
            const distanciaCorrigida = distanciaFinal ? parseFloat(distanciaFinal.toString().replace(',', '.')) : null;
            const response = await fetch(`${API_GESTAO_URL}/trips/${selectedTrip.id}/finalizar`, {
                method: 'PUT', ...apiConfig, body: JSON.stringify({ distancia_total: distanciaCorrigida })
            });
            if (!response.ok) throw new Error('Falha ao finalizar viagem.');
            const finishedTrip = await response.json();
            setOpenTrips(prev => prev.filter(trip => trip.id !== finishedTrip.id));
            handleCloseFinishDialog();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenCancelDialog = (trip) => {
        setSelectedTrip(trip);
        setCancelTripDialogOpen(true);
    };
    const handleCloseCancelDialog = () => {
        setCancelTripDialogOpen(false);
        setSelectedTrip(null);
    };
    const handleCancelTrip = async () => {
        if (!selectedTrip) return;
        try {
            const response = await fetch(`${API_GESTAO_URL}/trips/${selectedTrip.id}/cancelar`, {
                method: 'PUT', ...apiConfig
            });
            if (!response.ok) throw new Error('Falha ao cancelar viagem.');
            const cancelledTrip = await response.json();
            setOpenTrips(prev => prev.filter(trip => trip.id !== cancelledTrip.id));
            handleCloseCancelDialog();
        } catch (err) {
            setError(err.message);
        }
    };

    // -- Lógica de Veículos --
    const handleOpenEditVehicleModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleEditData({
            name: vehicle.name,
            tank_capacity: vehicle.tank_capacity
        });
        setEditVehicleModalOpen(true);
    };

    const handleCloseEditVehicleModal = () => {
        setEditVehicleModalOpen(false);
        setSelectedVehicle(null);
        setVehicleEditData({ name: '', tank_capacity: '' });
    };

    const handleVehicleEditChange = (e) => {
        const { name, value } = e.target;
        setVehicleEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveVehicleEdit = async () => {
        if (!selectedVehicle) return;
        try {
            const payload = {
                ...vehicleEditData,
                tank_capacity: vehicleEditData.tank_capacity ? parseFloat(vehicleEditData.tank_capacity) : null,
            };

            const response = await fetch(`${API_GESTAO_URL}/vehicles/${selectedVehicle.id}`, {
                method: 'PUT',
                ...apiConfig,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar o veículo.');
            }

            const updatedVehicle = await response.json();
            setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
            handleCloseEditVehicleModal();
            alert('Veículo atualizado com sucesso!');
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // -- Lógica de Motoristas --
    const handleRegisterDriver = async (e) => {
        e.preventDefault();
        try {
            const { main_vehicle_id, ...payload } = newDriver;
            const response = await fetch(`${API_GESTAO_URL}/drivers`, {
                method: 'POST', ...apiConfig, body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao cadastrar motorista.');
            }
            const addedDriver = await response.json();
            setDrivers(prev => [addedDriver, ...prev]);
            setNewDriver({ name: '', cpf: '', cnh_number: '', cnh_category: '', cnh_validity: '', phone: '', username: '', password: '' });
            alert('Motorista cadastrado com sucesso!');
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenEditDriverModal = (driver) => {
        setSelectedDriver(driver);
        setDriverEditData({
            name: driver.name,
            cpf: driver.cpf || '',
            cnh_number: driver.cnh_number || '',
            cnh_category: driver.cnh_category || '',
            cnh_validity: driver.cnh_validity ? driver.cnh_validity.split('T')[0] : '',
            phone: driver.phone || '',
            username: driver.username || ''
        });
        setEditDriverModalOpen(true);
    };
    const handleCloseEditDriverModal = () => {
        setEditDriverModalOpen(false);
        setSelectedDriver(null);
    };
    const handleDriverEditChange = (e) => {
        const { name, value } = e.target;
        setDriverEditData(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveDriverEdit = async (e) => {
        e.preventDefault();
        if (!selectedDriver) return;
        try {
            const { main_vehicle_id, ...payload } = driverEditData;
            const response = await fetch(`${API_GESTAO_URL}/drivers/${selectedDriver.id}`, {
                method: 'PUT', ...apiConfig, body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Falha ao atualizar o motorista.');
            const updatedDriver = await response.json();
            setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
            handleCloseEditDriverModal();
            alert('Motorista atualizado com sucesso!');
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };
    const handleDeleteDriver = async () => {
        if (!selectedDriver) return;
        try {
            const response = await fetch(`${API_GESTAO_URL}/drivers/${selectedDriver.id}`, {
                method: 'DELETE', ...apiConfig,
            });
            if (!response.ok) throw new Error('Falha ao excluir o motorista.');
            setDrivers(prev => prev.filter(d => d.id !== selectedDriver.id));
            setDeleteDriverDialogOpen(false);
            setSelectedDriver(null);
            alert('Motorista excluído com sucesso!');
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenPasswordChangeModal = (driver) => {
        setSelectedDriver(driver);
        setNewPassword('');
        setNewPasswordConfirm('');
        setPasswordChangeError('');
        setPasswordChangeModalOpen(true);
    };
    const handleClosePasswordChangeModal = () => {
        setPasswordChangeModalOpen(false);
        setSelectedDriver(null);
    };
    const handlePasswordChange = async () => {
        if (newPassword !== newPasswordConfirm) {
            setPasswordChangeError('As senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordChangeError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        try {
            const response = await fetch(`${API_GESTAO_URL}/drivers/${selectedDriver.id}/password`, {
                method: 'PUT', ...apiConfig, body: JSON.stringify({ new_password: newPassword })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao alterar a senha.');
            }
            alert('Senha alterada com sucesso!');
            handleClosePasswordChangeModal();
        } catch (error) {
            alert(`Erro: ${error.message}`);
            setPasswordChangeError(error.message);
        }
    };
    const handleOpenCreateUserModal = (driver) => {
        setSelectedDriver(driver);
        const generatedUsername = formatNameForUsername(driver.name);
        setNewUsername(generatedUsername);
        setNewPasswordCreate(generatedUsername);
        setCreateUserError('');
        setCreateUserModalOpen(true);
    };
    const handleCloseCreateUserModal = () => {
        setCreateUserModalOpen(false);
        setSelectedDriver(null);
        setNewUsername('');
        setNewPasswordCreate('');
    };
    const handleCreateUser = async () => {
        if (!selectedDriver) return;
        if (newPasswordCreate.length < 6) {
            setCreateUserError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        try {
            const payload = { username: newUsername, password: newPasswordCreate };
            const response = await fetch(`${API_GESTAO_URL}/drivers/${selectedDriver.id}/create-user`, {
                method: 'POST', ...apiConfig, body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao criar a conta de usuário.');
            }
            fetchDrivers();
            alert('Conta de usuário criada com sucesso!');
            handleCloseCreateUserModal();
        } catch (error) {
            setCreateUserError(error.message);
            alert(`Erro: ${error.message}`);
        }
    };

    // -- Lógica de Abastecimentos --
    const handleRegisterRefuel = async (e) => {
        e.preventDefault();
        try {
            const fotoBombaUrl = refuelFiles.foto_bomba ? await uploadFile(refuelFiles.foto_bomba) : null;
            const fotoOdometroUrl = refuelFiles.foto_odometro ? await uploadFile(refuelFiles.foto_odometro) : null;
            if (refuelFiles.foto_bomba && !fotoBombaUrl) throw new Error('Falha no upload da foto da bomba.');
            if (refuelFiles.foto_odometro && !fotoOdometroUrl) throw new Error('Falha no upload da foto do hodômetro.');

            const odometerValue = newStandaloneRefuel.odometer ? parseFloat(newStandaloneRefuel.odometer.toString().replace(',', '.')) : null;
            const litersValue = newStandaloneRefuel.liters_filled ? parseFloat(newStandaloneRefuel.liters_filled.toString().replace(',', '.')) : null;
            const totalCostValue = newStandaloneRefuel.total_cost ? parseFloat(newStandaloneRefuel.total_cost.toString().replace(',', '.')) : null;

            const payload = {
                vehicle_id: newStandaloneRefuel.vehicle_id, refuel_date: newStandaloneRefuel.refuel_date,
                odometer: odometerValue, liters_filled: litersValue, total_cost: totalCostValue,
                is_full_tank: newStandaloneRefuel.is_full_tank, posto_nome: newStandaloneRefuel.posto_nome,
                cidade: newStandaloneRefuel.cidade, foto_bomba: fotoBombaUrl, foto_odometro: fotoOdometroUrl,
            };
            const response = await fetch(`${API_GESTAO_URL}/refuelings`, {
                method: 'POST', ...apiConfig, body: JSON.stringify(payload)
            });
            if (!response.ok) {
                let errorText = 'Falha ao registrar abastecimento.';
                try {
                    const errorData = await response.json();
                    errorText = errorData.error || errorText;
                } catch (e) {
                    errorText = `Falha ao registrar abastecimento: O servidor retornou uma resposta inesperada. Status: ${response.status}`;
                }
                throw new Error(errorText);
            }

            const addedRefuel = await response.json();
            setAllRefuels(prev => [addedRefuel, ...prev]);
            setNewStandaloneRefuel({
                vehicle_id: '', odometer: '', liters_filled: '', total_cost: '', is_full_tank: false,
                refuel_date: formatToDatetimeLocal(new Date()), posto_nome: '', cidade: ''
            });
            setRefuelFiles({ foto_bomba: null, foto_odometro: null });
            const bombaInput = document.getElementById('foto_bomba_input');
            if (bombaInput) bombaInput.value = '';
            const odometroInput = document.getElementById('foto_odometro_input');
            if (odometroInput) odometroInput.value = '';
            alert('Abastecimento registrado com sucesso!');
        } catch (err) {
            setError(err.message);
        }
    };
    const handleDeleteRefuel = async () => {
        if (!selectedRefuelToDelete) return;
        try {
            const response = await fetch(`${API_GESTAO_URL}/abastecimentos/${selectedRefuelToDelete.id}`, {
                method: 'DELETE', ...apiConfig
            });
            if (!response.ok) throw new Error('Falha ao excluir o abastecimento.');
            setAllRefuels(prev => prev.filter(refuel => refuel.id !== selectedRefuelToDelete.id));
            setDeleteRefuelDialogOpen(false);
            setSelectedRefuelToDelete(null);
            alert('Abastecimento excluído com sucesso!');
        } catch (err) {
            setError(err.message);
        }
    };
    const handleOpenEditRefuelModal = (refuel) => {
        setSelectedRefuel(refuel);

        try {
            let formattedDate = '';
            if (refuel.refuel_date) {

                const dateObj = new Date(refuel.refuel_date);
                formattedDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            }

            setRefuelEditData({
                vehicle_id: refuel.vehicle_id,
                refuel_date: formattedDate,
                odometer: refuel.odometer,
                liters_filled: refuel.liters_filled,
                total_cost: refuel.total_cost,
                is_full_tank: refuel.is_full_tank,
                posto_nome: refuel.posto_nome,
                cidade: refuel.cidade
            });
            setEditRefuelModalOpen(true);
        } catch (error) {
            console.error("Erro ao formatar a data ou abrir o modal de edição:", error);

            alert("Não foi possível abrir o modal de edição devido a um erro de formatação de data.");
        }
    };

    const handleCloseEditRefuelModal = () => {
        setEditRefuelModalOpen(false);
        setSelectedRefuel(null);
    };

    const handleRefuelEditChange = (e) => {
        const { name, value, checked, type } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setRefuelEditData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSaveRefuelEdit = async (e) => {
        e.preventDefault();
        if (!selectedRefuel) return;
        try {
            const payload = {
                ...refuelEditData,
                odometer: refuelEditData.odometer ? parseFloat(refuelEditData.odometer.toString().replace(',', '.')) : null,
                liters_filled: refuelEditData.liters_filled ? parseFloat(refuelEditData.liters_filled.toString().replace(',', '.')) : null,
                total_cost: refuelEditData.total_cost ? parseFloat(refuelEditData.total_cost.toString().replace(',', '.')) : null,
            };

            const response = await fetch(`${API_GESTAO_URL}/abastecimentos/${selectedRefuel.id}`, {
                method: 'PUT', ...apiConfig, body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Falha ao atualizar o abastecimento.');

            const updatedRefuel = await response.json();

            setAllRefuels(prev => prev.map(r => r.id === updatedRefuel.id ? updatedRefuel : r));
            fetchRefuelingReportData(refuelingReportFilter);
            handleCloseEditRefuelModal();
            alert('Abastecimento atualizado com sucesso!');
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // -- Lógica de Custos Extras --
    const handleRegisterExtraCost = async (e) => {
        e.preventDefault();
        try {
            const valorCorrigido = newExtraCostForm.valor ? parseFloat(newExtraCostForm.valor.toString().replace(',', '.')) : null;
            const response = await fetch(`${API_GESTAO_URL}/custos`, {
                method: 'POST', ...apiConfig, body: JSON.stringify({ ...newExtraCostForm, valor: valorCorrigido, viagem_id: null })
            });
            if (!response.ok) throw new Error('Falha ao registrar custo extra.');
            const addedCost = await response.json();
            setAllExtraCosts(prev => [addedCost, ...prev]);
            setNewExtraCostForm({ vehicle_id: '', tipo_custo: '', descricao: '', valor: '' });
            alert('Custo extra registrado com sucesso!');
        } catch (err) {
            setError(err.message);
        }
    };

    // -- Lógica de Relatórios --
    const handleRefuelingFilterChange = (e) => {
        const { name, value } = e.target;
        setRefuelingReportFilter(prev => ({ ...prev, [name]: value }));
    };
    const handleRefuelingCostFilterChange = (e) => {
        const { name, value } = e.target;
        setRefuelingCostFilter(prev => ({ ...prev, [name]: value }));
    };
    const handleExportCSV = (data, filename) => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleExportExcel = (data, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const handleExportPDF = (data, columns, filename) => {
        try {
            if (!data || data.length === 0) {
                alert("Não há dados para exportar.");
                return;
            }
    
            // Cria uma nova instância de jsPDF
            const doc = new jsPDF();
    
            // Essa é a parte CRUCIAL:
            // Verifica explicitamente se a função 'autoTable' existe
            if (typeof doc.autoTable !== 'function') {
                // Se não existir, aplica o plugin novamente
                applyAutoTablePlugin(jsPDF);
                
                // Faz uma nova verificação para ter certeza
                if (typeof doc.autoTable !== 'function') {
                    throw new Error("A biblioteca jspdf-autotable não foi carregada corretamente. Por favor, verifique as dependências.");
                }
            }
            
            // O resto do seu código pode continuar normalmente
            const finalColumns = columns.map(col => col.headerName);
            
            const finalData = data.map(item =>
                columns.map(col => {
                    const value = item[col.field];
                    try {
                        switch (col.field) {
                            case 'valor':
                            case 'total_cost':
                                return value != null ? formatCurrency(value) : 'R$ 0,00';
                            case 'refuel_date':
                            case 'end_date':
                            case 'data_custo':
                                return value ? formatDate(value) : 'N/A';
                            case 'is_round_trip':
                            case 'viagem_id':
                                return value ? 'Sim' : 'Não';
                            case 'vehicle_id':
                                return vehicles.find(v => v.id === value)?.name || 'N/A';
                            case 'odometer_atual':
                                return value || item.odometer || 'N/A';
                            case 'consumo_por_trecho':
                                return value != null && !isNaN(value) ? `${Number(value).toFixed(2)} Km/L` : 'N/A';
                            case 'distancia_percorrida':
                                return value != null && !isNaN(value) ? `${Number(value).toFixed(2)} Km` : 'N/A';
                            default:
                                return value;
                        }
                    } catch (e) {
                        console.error(`Erro ao formatar o campo ${col.field}:`, e);
                        return 'Erro de formatação';
                    }
                })
            );
            
            // Agora, o 'doc.autoTable' tem a garantia de existir
            doc.autoTable({
                head: [finalColumns],
                body: finalData,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] },
            });
    
            doc.save(`${filename}.pdf`);
            console.log(`PDF ${filename}.pdf gerado com sucesso.`);
    
        } catch (error) {
            console.error("Falha geral ao gerar o PDF:", error);
            alert(`Não foi possível gerar o relatório. Detalhes: ${error.message}`);
        }
    };
    
    // -- Lógica de Mapas e Imagens --
    const handleOpenMapModal = (trip) => {
        fetch(`/api/reports/route?deviceId=${trip.vehicle_id}&from=${trip.start_date}&to=${trip.end_date}`, { ...apiConfig })
            .then(res => res.json())
            .then(data => {
                const coordinates = data.map(pos => [pos.latitude, pos.longitude]);
                setMapTripData(coordinates);
                setMapTripName(`Rota: ${vehicles.find(v => v.id === trip.vehicle_id)?.name || 'N/A'} (${formatDate(trip.start_date)} - ${formatDate(trip.end_date)})`);
                setMapModalOpen(true);
            })
            .catch(err => {
                console.error('Falha ao buscar dados da rota:', err);
                alert('Não foi possível carregar a rota.');
            });
    };
    const handleCloseMapModal = () => {
        setMapModalOpen(false);
        setMapTripData([]);
        setMapTripName('');
    };
    const handleOpenImageModal = (images) => {
        const imagesList = [];
        if (images.foto_bomba) {
            imagesList.push({ img: images.foto_bomba, title: 'Foto da Bomba' });
        }
        if (images.foto_odometro) {
            imagesList.push({ img: images.foto_odometro, title: 'Foto do Hodômetro' });
        }
        setImagesToDisplay(imagesList);
        setImageModalOpen(true);
    };
    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setImagesToDisplay([]);
    };

    // --- RENDERIZAÇÃO DO COMPONENTE ---
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>;
    if (!isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" component="h2" gutterBottom>Acesso Restrito</Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>Para acessar o painel de gestão de frota, você precisa estar autenticado na plataforma de rastreamento.</Typography>
                    <Button variant="contained" href={window.location.origin} target="_top" startIcon={<LoginIcon />}>Ir para a Página de Login</Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.location.href = '/'} sx={{ mr: 2 }}>Voltar</Button>
                <Typography variant="h4" component="h1">Painel Gestão de Frota</Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Iniciar Nova Viagem</Typography>
                <Box component="form" onSubmit={handleStartTrip} sx={{ mt: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Veículo *</InputLabel><Select name="vehicle_id" value={newTrip.vehicle_id} label="Veículo *" onChange={handleVehicleSelectChange(setNewTrip, vehicles)} required>{vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Motorista *</InputLabel><Select name="driver_id" value={newTrip.driver_id} label="Motorista *" onChange={handleInputChange(setNewTrip)} required>{drivers.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} md={3}><TextField name="start_city" label="Cidade de Origem *" value={newTrip.start_city} onChange={handleInputChange(setNewTrip)} fullWidth required /></Grid>
                        <Grid item xs={12} md={3}><TextField name="end_city" label="Cidade de Destino *" value={newTrip.end_city} onChange={handleInputChange(setNewTrip)} fullWidth required /></Grid>
                        <Grid item xs={12}><FormControlLabel control={<Checkbox checked={newTrip.is_round_trip} onChange={(e) => setNewTrip(prev => ({ ...prev, is_round_trip: e.target.checked }))} />} label="Ida e Volta" /></Grid>
                        <Grid item xs={12}><Button type="submit" variant="contained" fullWidth size="large">Iniciar Viagem</Button></Grid>
                    </Grid>
                </Box>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label={`Viagens em Aberto (${openTrips.length})`} />
                    <Tab label="Histórico de Viagens" />
                    <Tab label="Motoristas" />
                    <Tab label="Veículos" />
                    <Tab label="Abastecimentos" />
                    <Tab label="Custos Extras" />
                    <Tab label="Relatórios de Frota" />
                    <Tab label="Relatórios de Abastecimento" />
                </Tabs>
            </Box>

            {/* --- SEÇÃO: VIAGENS EM ABERTO --- */}
            {activeTab === 0 && (
                <Paper sx={{ p: 2, height: 500 }}>
                    <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                        <DataGrid
                            rows={openTrips}
                            columns={[
                                { field: 'driver_name', headerName: 'Motorista', flex: 1.5, minWidth: 200 },
                                { field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: (p) => vehicles.find(v => v.id === p.value)?.name || 'N/A' },
                                { field: 'start_city', headerName: 'Origem', flex: 1, minWidth: 150 },
                                { field: 'end_city', headerName: 'Destino', flex: 1, minWidth: 150 },
                                { field: 'is_round_trip', headerName: 'Ida/Volta', flex: 0.5, minWidth: 100, renderCell: (params) => params.value ? 'Sim' : 'Não' },
                                { field: 'start_date', headerName: 'Início', flex: 1, minWidth: 200, renderCell: (params) => formatDate(params.value) },
                                {
                                    field: 'actions', headerName: 'Ações', flex: 2, minWidth: 350, sortable: false, renderCell: (params) => (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenCostModal(params.row)}>Custo</Button>
                                            <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => handleOpenFinishDialog(params.row)}>Finalizar</Button>
                                            <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />} onClick={() => handleOpenCancelDialog(params.row)}>Cancelar</Button>
                                        </Box>
                                    )
                                }
                            ]}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            disableSelectionOnClick
                        />
                    </Box>
                </Paper>
            )}

            {/* --- SEÇÃO: HISTÓRICO DE VIAGENS --- */}
            {activeTab === 1 && (
                <Paper sx={{ p: 2, height: 500 }}>
                    <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                        <DataGrid
                            rows={closedTrips}
                            columns={[
                                { field: 'driver_name', headerName: 'Motorista', flex: 1.5, minWidth: 200 },
                                { field: 'vehicle_name', headerName: 'Veículo', flex: 1.5, minWidth: 200, renderCell: (p) => p.value || 'N/A' },
                                { field: 'start_city', headerName: 'Origem', flex: 1, minWidth: 150 },
                                { field: 'end_city', headerName: 'Destino', flex: 1, minWidth: 150 },
                                { field: 'is_round_trip', headerName: 'Ida/Volta', flex: 0.5, minWidth: 100, renderCell: (params) => params.value ? 'Sim' : 'Não' },
                                { field: 'end_date', headerName: 'Finalizada em', flex: 1, minWidth: 200, renderCell: (params) => formatDate(params.value) },
                                { field: 'distancia_total', headerName: 'Distância (km)', flex: 1, minWidth: 150 },
                                {
                                    field: 'actions', headerName: 'Ações', flex: 1, minWidth: 150, sortable: false, renderCell: (params) => (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" size="small" onClick={() => handleOpenMapModal(params.row)}>Ver Rota</Button>
                                        </Box>
                                    )
                                }
                            ]}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            disableSelectionOnClick
                        />
                    </Box>
                </Paper>
            )}

            {/* --- SEÇÃO: MOTORISTAS --- */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Cadastrar Novo Motorista</Typography>
                            <Box component="form" onSubmit={handleRegisterDriver} sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}><TextField name="name" label="Nome Completo *" value={newDriver.name} onChange={handleInputChange(setNewDriver)} fullWidth required /></Grid>
                                    <Grid item xs={12} md={6}><TextField name="cpf" label="CPF" value={newDriver.cpf} onChange={handleInputChange(setNewDriver)} fullWidth /></Grid>
                                    <Grid item xs={12} md={6}><TextField name="cnh_number" label="Número da CNH" value={newDriver.cnh_number} onChange={handleInputChange(setNewDriver)} fullWidth /></Grid>
                                    <Grid item xs={12} md={6}><FormControl fullWidth><InputLabel>Categoria da CNH</InputLabel><Select name="cnh_category" label="Categoria da CNH" value={newDriver.cnh_category} onChange={handleInputChange(setNewDriver)}><MenuItem value="">Nenhum</MenuItem><MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="D">D</MenuItem><MenuItem value="E">E</MenuItem><MenuItem value="AB">AB</MenuItem><MenuItem value="AC">AC</MenuItem><MenuItem value="AD">AD</MenuItem><MenuItem value="AE">AE</MenuItem></Select></FormControl></Grid>
                                    <Grid item xs={12} md={6}><TextField name="cnh_validity" label="Validade CNH" type="date" value={newDriver.cnh_validity} onChange={handleInputChange(setNewDriver)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                                    <Grid item xs={12} md={6}><TextField name="phone" label="Telefone" value={newDriver.phone} onChange={handleInputChange(setNewDriver)} fullWidth /></Grid>
                                    <Grid item xs={12} md={6}><TextField name="username" label="Nome de Usuário *" value={newDriver.username} onChange={handleInputChange(setNewDriver)} fullWidth required /></Grid>
                                    <Grid item xs={12} md={6}><TextField name="password" label="Senha *" type="password" value={newDriver.password} onChange={handleInputChange(setNewDriver)} fullWidth required /></Grid>
                                    <Grid item xs={12}><Button type="submit" variant="contained" fullWidth size="large">Cadastrar Motorista</Button></Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 500 }}>
                            <Typography variant="h6" gutterBottom>Lista de Motoristas</Typography>
                            <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                <DataGrid
                                    rows={drivers}
                                    columns={[
                                        { field: 'name', headerName: 'Nome', flex: 2, minWidth: 200 },
                                        { field: 'username', headerName: 'Usuário', flex: 1.5, minWidth: 150 },
                                        { field: 'cnh_number', headerName: 'CNH', flex: 1, minWidth: 150 },
                                        { field: 'cnh_category', headerName: 'Categoria', flex: 1, minWidth: 100 },
                                        { field: 'phone', headerName: 'Telefone', flex: 1, minWidth: 150 },
                                        {
                                            field: 'actions',
                                            headerName: 'Ações',
                                            flex: 1.5,
                                            minWidth: 350,
                                            sortable: false,
                                            renderCell: (params) => (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleOpenEditDriverModal(params.row)}>Editar</Button>
                                                    <Button variant="outlined" size="small" startIcon={<DirectionsCarIcon />} onClick={() => handleOpenEditDriverVehiclesModal(params.row)}>Veículos</Button>
                                                    {params.row.username ? (
                                                        <Button variant="outlined" size="small" startIcon={<VpnKeyIcon />} onClick={() => handleOpenPasswordChangeModal(params.row)}>Senha</Button>
                                                    ) : (
                                                        <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={() => handleOpenCreateUserModal(params.row)}>Criar Usuário</Button>
                                                    )}
                                                    <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedDriver(params.row); setDeleteDriverDialogOpen(true); }}>Excluir</Button>
                                                </Box>
                                            )
                                        }
                                    ]}
                                    loading={loadingDrivers}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEÇÃO: VEÍCULOS --- */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Lista de Veículos</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={handleSyncVehicles}
                                    disabled={loading}
                                >
                                    Sincronizar
                                </Button>
                            </Box>
                            <Box sx={{ overflowX: 'auto', height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={vehicles}
                                    columns={[
                                        { field: 'name', headerName: 'Veículo', flex: 2, minWidth: 200 },
                                        { field: 'tank_capacity', headerName: 'Cap. Tanque (L)', flex: 1, minWidth: 150 },
                                        {
                                            field: 'actions',
                                            headerName: 'Ações',
                                            flex: 1,
                                            minWidth: 100,
                                            sortable: false,
                                            renderCell: (params) => (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleOpenEditVehicleModal(params.row)}
                                                >
                                                    Editar
                                                </Button>
                                            ),
                                        },
                                    ]}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableSelectionOnClick
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEÇÃO: ABASTECIMENTOS --- */}
            {activeTab === 4 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Registrar Novo Abastecimento</Typography>
                            <Box component="form" onSubmit={handleRegisterRefuel} sx={{ mt: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField name="refuel_date" label="Data e Hora do Abastecimento" type="datetime-local" value={newStandaloneRefuel.refuel_date} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth required InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}><FormControl fullWidth required><InputLabel>Veículo</InputLabel><Select name="vehicle_id" value={newStandaloneRefuel.vehicle_id} label="Veículo" onChange={handleVehicleSelectChange(setNewStandaloneRefuel, vehicles)}>{vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Grid>
                                    <Grid item xs={12} sm={6} md={2}><TextField name="odometer" label="Hodômetro" type="number" value={newStandaloneRefuel.odometer} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth required /></Grid>
                                    <Grid item xs={12} sm={6} md={1}><TextField name="liters_filled" label="Litros" type="number" value={newStandaloneRefuel.liters_filled} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth required /></Grid>
                                    <Grid item xs={12} sm={6} md={2}><TextField name="total_cost" label="Valor Total (R$)" type="number" value={newStandaloneRefuel.total_cost} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth required /></Grid>
                                    <Grid item xs={12} sm={6} md={2}><FormControlLabel control={<Checkbox checked={newStandaloneRefuel.is_full_tank} onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, is_full_tank: e.target.checked }))} />} label="Tanque Cheio" /></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField name="posto_nome" label="Nome do Posto" value={newStandaloneRefuel.posto_nome} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth /></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField name="cidade" label="Cidade" value={newStandaloneRefuel.cidade} onChange={handleInputChange(setNewStandaloneRefuel)} fullWidth /></Grid>
                                    <Grid item xs={12} sm={6} md={2}><Button component="label" variant="outlined" startIcon={<FileUploadIcon />}>Bomba<input type="file" name="foto_bomba" id="foto_bomba_input" hidden onChange={handleFileChange} /></Button></Grid>
                                    <Grid item xs={12} sm={6} md={2}><Button component="label" variant="outlined" startIcon={<FileUploadIcon />}>Hodômetro<input type="file" name="foto_odometro" id="foto_odometro_input" hidden onChange={handleFileChange} /></Button></Grid>
                                    <Grid item xs={12}><Button type="submit" variant="contained" fullWidth size="large" startIcon={<LocalGasStationIcon />}>Registrar Abastecimento</Button></Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 500 }}>
                            <Typography variant="h6" gutterBottom>Histórico de Abastecimentos</Typography>
                            <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                <DataGrid rows={allRefuels} columns={[{ field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: (p) => vehicles.find(v => v.id === p.value)?.name || 'N/A' }, { field: 'refuel_date', headerName: 'Data', flex: 1, minWidth: 200, renderCell: (params) => formatDate(params.value) }, { field: 'posto_nome', headerName: 'Posto', flex: 1, minWidth: 150 }, { field: 'cidade', headerName: 'Cidade', flex: 1, minWidth: 150 }, { field: 'odometer', headerName: 'Hodômetro', flex: 1, minWidth: 150 }, { field: 'liters_filled', headerName: 'Litros', flex: 1, minWidth: 100 }, { field: 'total_cost', headerName: 'Valor Total', flex: 1, minWidth: 150, renderCell: (params) => formatCurrency(params.value) }, { field: 'actions', headerName: 'Ações', flex: 1, minWidth: 150, sortable: false, renderCell: (params) => (<Box sx={{ display: 'flex', gap: 1 }}><IconButton color="primary" onClick={() => handleOpenEditRefuelModal(params.row)}><EditIcon /></IconButton><IconButton color="error" onClick={() => { setSelectedRefuelToDelete(params.row); setDeleteRefuelDialogOpen(true); }}><DeleteIcon /></IconButton><Button variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => handleOpenImageModal({ foto_bomba: params.row.foto_bomba, foto_odometro: params.row.foto_odometro })}>Ver Fotos</Button></Box>) }]} loading={loadingRefuels} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEÇÃO: CUSTOS EXTRAS --- */}
            {activeTab === 5 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Registrar Custo Extra</Typography>
                            <Box component="form" onSubmit={handleRegisterExtraCost} sx={{ mt: 2 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>Veículo</InputLabel><Select name="vehicle_id" value={newExtraCostForm.vehicle_id} label="Veículo" onChange={handleVehicleSelectChange(setNewExtraCostForm, vehicles)}>{vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Grid>
                                    <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>Tipo de Custo</InputLabel><Select name="tipo_custo" value={newExtraCostForm.tipo_custo} label="Tipo de Custo" onChange={handleInputChange(setNewExtraCostForm)}><MenuItem value="MANUTENCAO">Manutenção</MenuItem><MenuItem value="PNEU">Pneu</MenuItem><MenuItem value="DOCUMENTACAO">Documentação</MenuItem><MenuItem value="OUTROS">Outros</MenuItem></Select></FormControl></Grid>
                                    <Grid item xs={12} sm={4}><TextField name="valor" label="Valor (R$)" type="number" value={newExtraCostForm.valor} onChange={handleInputChange(setNewExtraCostForm)} fullWidth required /></Grid>
                                    <Grid item xs={12} sm={8}><TextField name="descricao" label="Descrição" value={newExtraCostForm.descricao} onChange={handleInputChange(setNewExtraCostForm)} fullWidth required /></Grid>
                                    <Grid item xs={12} sm={4}><Button type="submit" variant="contained" fullWidth size="large" startIcon={<MonetizationOnIcon />}>Registrar Custo</Button></Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 500 }}>
                            <Typography variant="h6" gutterBottom>Histórico de Custos Extras</Typography>
                            <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                <DataGrid rows={allExtraCosts} columns={[{ field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: p => vehicles.find(v => v.id === p.value)?.name || 'N/A' }, { field: 'data_custo', headerName: 'Data', flex: 1, minWidth: 200, renderCell: p => formatDate(p.value) }, { field: 'descricao', headerName: 'Descrição', flex: 2, minWidth: 250 }, { field: 'tipo_custo', headerName: 'Tipo', flex: 1, minWidth: 150 }, { field: 'valor', headerName: 'Valor', flex: 1, minWidth: 150, renderCell: p => formatCurrency(p.value) },]} loading={loadingExtraCosts} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEÇÃO: RELATÓRIOS DE FROTA --- */}
            {activeTab === 6 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}><AssessmentIcon color="primary" /><Typography variant="h6">Filtros</Typography><FormControl sx={{ minWidth: 150 }} size="small"><InputLabel>Período</InputLabel><Select value={reportPeriod} label="Período" onChange={(e) => setReportPeriod(e.target.value)}><MenuItem value="semanal">Última Semana</MenuItem><MenuItem value="mensal">Último Mês</MenuItem><MenuItem value="total">Total</MenuItem></Select></FormControl><FormControl sx={{ minWidth: 200 }} size="small"><InputLabel>Veículo</InputLabel><Select value={reportVehicle} label="Veículo" onChange={(e) => setReportVehicle(e.target.value)}><MenuItem value="all">Todos os Veículos</MenuItem>{vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select></FormControl></Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle1" color="text.secondary">Custo Total de Abastecimento</Typography>
                            <Typography variant="h4" component="p" color="success">{loadingReports ? <CircularProgress size={30} /> : formatCurrency(totalRefuelingCost)}</Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <FormControl sx={{ minWidth: 150 }} size="small">
                                    <InputLabel>Período</InputLabel>
                                    <Select name="periodo" value={refuelingCostFilter.periodo} label="Período" onChange={handleRefuelingCostFilterChange}><MenuItem value="semanal">Última Semana</MenuItem><MenuItem value="mensal">Último Mês</MenuItem><MenuItem value="total">Total</MenuItem></Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 200 }} size="small">
                                    <InputLabel>Veículo</InputLabel>
                                    <Select name="vehicleId" value={refuelingCostFilter.vehicleId} label="Veículo" onChange={handleRefuelingCostFilterChange}><MenuItem value="all">Todos</MenuItem>{vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}</Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="subtitle1" color="text.secondary">Consumo Médio Geral</Typography>
                            <Typography variant="h4" component="p" color="primary">{loadingReports ? <CircularProgress size={30} /> : `${Number(averageConsumption).toFixed(2)} Km/L`}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ p: 2, height: 200 }}>
                            <Typography variant="subtitle1" color="text.secondary">Custos por Categoria</Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                {loadingReports ? <CircularProgress /> : <BarChart data={categoryCostReport} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(value) => formatCurrency(value)} /><Tooltip formatter={(value) => formatCurrency(value)} /><Legend /><Bar dataKey="value" fill="#8884d8" name="Total" /></BarChart>}
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" gutterBottom>Relatório de Custos por Viagem</Typography>
                                <Button
                                    id="export-button-trip"
                                    aria-controls={Boolean(anchorElTrip) ? 'export-menu-trip' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={Boolean(anchorElTrip) ? 'true' : undefined}
                                    onClick={(e) => handleOpenExportMenu(e, 'trip')}
                                    variant="outlined"
                                    startIcon={<FileDownloadIcon />}
                                    size="small"
                                >
                                    Exportar
                                </Button>
                                <Menu
                                    id="export-menu-trip"
                                    anchorEl={anchorElTrip}
                                    open={Boolean(anchorElTrip)}
                                    onClose={() => handleCloseExportMenu('trip')}
                                    MenuListProps={{ 'aria-labelledby': 'export-button-trip' }}
                                >
                                    <MenuItem onClick={() => {
                                        handleExportCSV(tripReport, 'relatorio_viagens');
                                        handleCloseExportMenu('trip');
                                    }}>
                                        <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>CSV</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        handleExportExcel(tripReport, 'relatorio_viagens');
                                        handleCloseExportMenu('trip');
                                    }}>
                                        <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Excel (XLSX)</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        const columns = [
                                            { field: 'vehicle_id', headerName: 'Veículo' },
                                            { field: 'start_city', headerName: 'Origem' },
                                            { field: 'end_city', headerName: 'Destino' },
                                            { field: 'is_round_trip', headerName: 'Ida/Volta' },
                                            { field: 'end_date', headerName: 'Finalizada em' },
                                            { field: 'distancia_total', headerName: 'Distância (km)' },
                                            { field: 'consumo_medio_viagem', headerName: 'Consumo (Km/L)' },
                                            { field: 'custo_total', headerName: 'Custo Total' },
                                        ];
                                        handleExportPDF(tripReport, columns, 'relatorio_viagens');
                                        handleCloseExportMenu('trip');
                                    }}>
                                        <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>PDF</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Box>
                            <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                <DataGrid rows={tripReport} columns={[{ field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: p => vehicles.find(v => v.id === p.value)?.name || 'N/A' }, { field: 'start_city', headerName: 'Origem', flex: 1, minWidth: 150 }, { field: 'end_city', headerName: 'Destino', flex: 1, minWidth: 150 }, { field: 'is_round_trip', headerName: 'Ida/Volta', flex: 0.5, minWidth: 100, renderCell: (params) => params.value ? 'Sim' : 'Não' }, { field: 'end_date', headerName: 'Finalizada em', flex: 1, minWidth: 200, renderCell: p => formatDate(p.value) }, { field: 'distancia_total', headerName: 'Distância (km)', flex: 1, minWidth: 150 }, { field: 'consumo_medio_viagem', headerName: 'Consumo (Km/L)', flex: 1, minWidth: 150, renderCell: p => Number(p.value).toFixed(2) }, { field: 'custo_total', headerName: 'Custo Total', flex: 1, minWidth: 150, renderCell: p => formatCurrency(p.value) },]} loading={loadingReports} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" gutterBottom>Histórico de Custos Extras</Typography>
                                <Button
                                    id="export-button-cost"
                                    aria-controls={Boolean(anchorElCost) ? 'export-menu-cost' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={Boolean(anchorElCost) ? 'true' : undefined}
                                    onClick={(e) => handleOpenExportMenu(e, 'cost')}
                                    variant="outlined"
                                    startIcon={<FileDownloadIcon />}
                                    size="small"
                                >
                                    Exportar
                                </Button>
                                <Menu
                                    id="export-menu-cost"
                                    anchorEl={anchorElCost}
                                    open={Boolean(anchorElCost)}
                                    onClose={() => handleCloseExportMenu('cost')}
                                    MenuListProps={{ 'aria-labelledby': 'export-button-cost' }}
                                >
                                    <MenuItem onClick={() => {
                                        handleExportCSV(allExtraCosts, 'relatorio_custos_extras');
                                        handleCloseExportMenu('cost');
                                    }}>
                                        <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>CSV</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        handleExportExcel(allExtraCosts, 'relatorio_custos_extras');
                                        handleCloseExportMenu('cost');
                                    }}>
                                        <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Excel (XLSX)</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        const columns = [
                                            { field: 'vehicle_id', headerName: 'Veículo' },
                                            { field: 'data_custo', headerName: 'Data' },
                                            { field: 'descricao', headerName: 'Descrição' },
                                            { field: 'tipo_custo', headerName: 'Tipo' },
                                            { field: 'valor', headerName: 'Valor' },
                                        ];
                                        handleExportPDF(allExtraCosts, columns, 'relatorio_custos_extras');
                                        handleCloseExportMenu('cost');
                                    }}>
                                        <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>PDF</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Box>
                            <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                <DataGrid rows={allExtraCosts} columns={[{ field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: p => vehicles.find(v => v.id === p.value)?.name || 'N/A' }, { field: 'data_custo', headerName: 'Data', flex: 1, minWidth: 200, renderCell: p => formatDate(p.value) }, { field: 'descricao', headerName: 'Descrição', flex: 2, minWidth: 250 }, { field: 'tipo_custo', headerName: 'Tipo', flex: 1, minWidth: 150 }, { field: 'valor', headerName: 'Valor', flex: 1, minWidth: 150, renderCell: p => formatCurrency(p.value) },]} loading={loadingExtraCosts} pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* --- SEÇÃO: RELATÓRIOS DE ABASTECIMENTO --- */}
            {activeTab === 7 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <AssessmentIcon color="primary" />
                            <Typography variant="h6">Filtros</Typography>
                            <FormControl sx={{ minWidth: 150 }} size="small">
                                <InputLabel>Período</InputLabel>
                                <Select name="periodo" value={refuelingReportFilter.periodo} label="Período" onChange={handleRefuelingFilterChange}>
                                    <MenuItem value="semanal">Última Semana</MenuItem>
                                    <MenuItem value="mensal">Último Mês</MenuItem>
                                    <MenuItem value="total">Total</MenuItem>
                                    <MenuItem value="personalizado">Personalizado</MenuItem>
                                </Select>
                            </FormControl>
                            {refuelingReportFilter.periodo === 'personalizado' && (
                                <>
                                    <TextField name="startDate" label="Data Início" type="date" size="small" value={refuelingReportFilter.startDate} onChange={handleRefuelingFilterChange} InputLabelProps={{ shrink: true }} />
                                    <TextField name="endDate" label="Data Fim" type="date" size="small" value={refuelingReportFilter.endDate} onChange={handleRefuelingFilterChange} InputLabelProps={{ shrink: true }} />
                                    <Button variant="contained" onClick={() => fetchRefuelingReportData(refuelingReportFilter)}>Aplicar</Button>
                                </>
                            )}
                            <FormControl sx={{ minWidth: 200 }} size="small">
                                <InputLabel>Veículo</InputLabel>
                                <Select name="vehicleId" value={refuelingReportFilter.vehicleId} label="Veículo" onChange={handleRefuelingFilterChange}>
                                    <MenuItem value="all">Todos os Veículos</MenuItem>
                                    {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Paper>
                    </Grid>
                    {loadingRefuelingReport ? (
                        <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box></Grid>
                    ) : (
                        <>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
                                        <Typography variant="subtitle1" color="text.secondary">Total de KM Percorrido</Typography>
                                        <Typography variant="h4" component="p" color="primary">{Number(refuelingReportTotals.km_percorrido || 0).toFixed(2)} Km</Typography>
                                    </Paper>
                                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
                                        <Typography variant="subtitle1" color="text.secondary">Total Gasto em Combustível</Typography>
                                        <Typography variant="h4" component="p" color="success">{formatCurrency(totalRefuelingCost)}</Typography>
                                    </Paper>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, height: 500 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6" gutterBottom>Relatório de Abastecimento</Typography>
                                        <Button
                                            id="export-button-refuel"
                                            aria-controls={Boolean(anchorElRefuel) ? 'export-menu-refuel' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={Boolean(anchorElRefuel) ? 'true' : undefined}
                                            onClick={(e) => handleOpenExportMenu(e, 'refuel')}
                                            variant="outlined"
                                            startIcon={<FileDownloadIcon />}
                                            size="small"
                                        >
                                            Exportar
                                        </Button>
                                        <Menu
                                            id="export-menu-refuel"
                                            anchorEl={anchorElRefuel}
                                            open={Boolean(anchorElRefuel)}
                                            onClose={() => handleCloseExportMenu('refuel')}
                                            MenuListProps={{ 'aria-labelledby': 'export-button-refuel' }}
                                        >
                                            <MenuItem onClick={() => {
                                                handleExportCSV(refuelingDistanceReport, 'relatorio_abastecimentos');
                                                handleCloseExportMenu('refuel');
                                            }}>
                                                <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText>CSV</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => {
                                                handleExportExcel(refuelingDistanceReport, 'relatorio_abastecimentos');
                                                handleCloseExportMenu('refuel');
                                            }}>
                                                <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText>Excel (XLSX)</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => {
                                                const columns = [
                                                    { field: 'vehicle_id', headerName: 'Veículo' },
                                                    { field: 'refuel_date', headerName: 'Data' },
                                                    { field: 'posto_nome', headerName: 'Posto' },
                                                    { field: 'cidade', headerName: 'Cidade' },
                                                    { field: 'viagem_id', headerName: 'Em Viagem?' },
                                                    { field: 'odometer_anterior', headerName: 'Hodômetro Anterior' },
                                                    { field: 'odometer_atual', headerName: 'Hodômetro Atual' },
                                                    { field: 'distancia_percorrida', headerName: 'Distância (km)' },
                                                    { field: 'liters_filled', headerName: 'Litros' },
                                                    { field: 'consumo_por_trecho', headerName: 'Consumo (Km/L)' },
                                                ];
                                                handleExportPDF(refuelingDistanceReport, columns, 'relatorio_abastecimentos');
                                                handleCloseExportMenu('refuel');
                                            }}>
                                                <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText>PDF</ListItemText>
                                            </MenuItem>
                                        </Menu>
                                    </Box>
                                    <Box sx={{ overflowX: 'auto', height: '100%', width: '100%' }}>
                                        <DataGrid
                                            rows={refuelingDistanceReport}
                                            columns={[
                                                { field: 'vehicle_id', headerName: 'Veículo', flex: 1, minWidth: 150, renderCell: (p) => vehicles.find(v => v.id === p.value)?.name || 'N/A' },
                                                { field: 'refuel_date', headerName: 'Data', flex: 1, minWidth: 200, renderCell: (params) => formatDate(params.value) },
                                                { field: 'posto_nome', headerName: 'Posto', flex: 1, minWidth: 150 },
                                                { field: 'cidade', headerName: 'Cidade', flex: 1, minWidth: 150 },
                                                { field: 'viagem_id', headerName: 'Em Viagem?', flex: 0.8, minWidth: 100, renderCell: (params) => params.value ? 'Sim' : 'Não' },
                                                {
                                                    field: 'odometer_anterior',
                                                    headerName: 'Hodômetro Anterior',
                                                    flex: 1,
                                                    minWidth: 150,
                                                    renderCell: (params) => {
                                                        const odometer = params.row.odometer_anterior;
                                                        if (odometer === null || odometer === undefined) {
                                                            return 'N/A';
                                                        }
                                                        return odometer;
                                                    }
                                                },
                                                { field: 'odometer_atual', headerName: 'Hodômetro Atual', flex: 1, minWidth: 150, renderCell: p => p.row.odometer_atual || p.row.odometer },
                                                {
                                                    field: 'distancia_percorrida',
                                                    headerName: 'Distância (km)',
                                                    flex: 1,
                                                    minWidth: 150,
                                                    renderCell: (params) => {
                                                        const distance = params.row.distancia_percorrida;
                                                        if (distance === null || distance === undefined) {
                                                            return 'N/A';
                                                        }
                                                        return Number(distance).toFixed(2);
                                                    }
                                                },
                                                {
                                                    field: 'liters_filled',
                                                    headerName: 'Litros',
                                                    flex: 1,
                                                    minWidth: 100,
                                                    renderCell: (params) => {
                                                        const liters = params.row.liters_filled;
                                                        if (liters === null || liters === undefined) {
                                                            return 'N/A';
                                                        }
                                                        return Number(liters).toFixed(2);
                                                    }
                                                },
                                                {
                                                    field: 'consumo_por_trecho',
                                                    headerName: 'Consumo (Km/L)',
                                                    flex: 1,
                                                    minWidth: 150,
                                                    renderCell: (params) => {
                                                        const consumption = params.row.consumo_por_trecho;
                                                        if (consumption === null || consumption === undefined) {
                                                            return 'N/A';
                                                        }
                                                        return Number(consumption).toFixed(2);
                                                    }
                                                },
                                                { field: 'actions', headerName: 'Ações', flex: 1, minWidth: 100, sortable: false, renderCell: (params) => ((params.row.foto_bomba || params.row.foto_odometro) ? (<Button variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => handleOpenImageModal({ foto_bomba: params.row.foto_bomba, foto_odometro: params.row.foto_odometro })}>Ver Fotos</Button>) : 'Sem Fotos') }
                                            ]}
                                            loading={loadingRefuelingReport}
                                            pageSize={5}
                                            rowsPerPageOptions={[5]}
                                            disableSelectionOnClick
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        </>
                    )}
                </Grid>
            )}

            {/* --- MODAIS E DIÁLOGOS --- */}
            <Modal open={costModalOpen} onClose={handleCloseCostModal}>
                <Box sx={styleModal} component="form" onSubmit={handleAddCost}>
                    <Typography variant="h6" component="h2">Adicionar Custo à Viagem</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Veículo: {vehicles.find(v => v.id === selectedTrip?.vehicle_id)?.name || 'N/A'} | Destino: {selectedTrip?.end_city}</Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}><FormControl fullWidth required><InputLabel>Tipo de Custo</InputLabel><Select name="tipo_custo" value={newCost.tipo_custo} label="Tipo de Custo" onChange={handleInputChange(setNewCost)}><MenuItem value="ABASTECIMENTO">Abastecimento</MenuItem><MenuItem value="ALIMENTACAO">Alimentação</MenuItem><MenuItem value="PEDAGIO">Pedágio</MenuItem><MenuItem value="BALSA">Balsa</MenuItem><MenuItem value="PATIO">Pátio</MenuItem><MenuItem value="MANUTENCAO">Manutenção</MenuItem><MenuItem value="OUTROS">Outros</MenuItem></Select></FormControl></Grid>
                        {newCost.tipo_custo === 'ABASTECIMENTO' && (<><Grid item xs={12} sm={6}><TextField name="odometer" label="Hodômetro" type="number" value={newCost.odometer} onChange={handleInputChange(setNewCost)} fullWidth required /></Grid><Grid item xs={12} sm={6}><TextField name="liters_filled" label="Litros" type="number" value={newCost.liters_filled} onChange={handleInputChange(setNewCost)} fullWidth required /></Grid><Grid item xs={12} sm={6}><TextField name="posto_nome" label="Nome do Posto" value={newCost.posto_nome} onChange={handleInputChange(setNewCost)} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField name="cidade" label="Cidade" value={newCost.cidade} onChange={handleInputChange(setNewCost)} fullWidth /></Grid><Grid item xs={12}><FormControlLabel control={<Checkbox checked={newCost.is_full_tank} onChange={(e) => setNewCost(prev => ({ ...prev, is_full_tank: e.target.checked }))} />} label="Tanque Cheio" /></Grid><Grid item xs={12} sm={6}><Button component="label" variant="outlined" startIcon={<FileUploadIcon />} fullWidth>Bomba<input type="file" name="foto_bomba" hidden onChange={handleCostFileChange} /></Button></Grid><Grid item xs={12} sm={6}><Button component="label" variant="outlined" startIcon={<FileUploadIcon />} fullWidth>Hodômetro<input type="file" name="foto_odometro" hidden onChange={handleCostFileChange} /></Button></Grid></>)}
                        <Grid item xs={12}><TextField name="descricao" label={newCost.tipo_custo === 'ABASTECIMENTO' ? "Descrição (Automático)" : "Descrição"} value={newCost.tipo_custo === 'ABASTECIMENTO' ? `Abastecimento - ${newCost.liters_filled || 0} L` : newCost.descricao} onChange={handleInputChange(setNewCost)} fullWidth required disabled={newCost.tipo_custo === 'ABASTECIMENTO'} /></Grid>
                        <Grid item xs={12}><TextField name="valor" label={newCost.tipo_custo === 'ABASTECIMENTO' ? "Valor Total (R$)" : "Valor (R$)"} type="number" value={newCost.valor} onChange={handleInputChange(setNewCost)} fullWidth required /></Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseCostModal}>Cancelar</Button><Button type="submit" variant="contained">Salvar Custo</Button></Box>
                </Box>
            </Modal>
            <Modal open={editRefuelModalOpen} onClose={handleCloseEditRefuelModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Editar Abastecimento: {selectedRefuel?.id}</Typography>
                    <Box component="form" onSubmit={handleSaveRefuelEdit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField name="refuel_date" label="Data e Hora do Abastecimento" type="datetime-local" value={refuelEditData.refuel_date} onChange={handleRefuelEditChange} fullWidth required InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Veículo</InputLabel>
                                    <Select name="vehicle_id" value={refuelEditData.vehicle_id} label="Veículo" onChange={handleRefuelEditChange}>
                                        {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="odometer" label="Hodômetro" type="number" value={refuelEditData.odometer} onChange={handleRefuelEditChange} fullWidth required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="liters_filled" label="Litros" type="number" value={refuelEditData.liters_filled} onChange={handleRefuelEditChange} fullWidth required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="total_cost" label="Valor Total (R$)" type="number" value={refuelEditData.total_cost} onChange={handleRefuelEditChange} fullWidth required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel control={<Checkbox checked={refuelEditData.is_full_tank} onChange={handleRefuelEditChange} name="is_full_tank" />} label="Tanque Cheio" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="posto_nome" label="Nome do Posto" value={refuelEditData.posto_nome} onChange={handleRefuelEditChange} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField name="cidade" label="Cidade" value={refuelEditData.cidade} onChange={handleRefuelEditChange} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button onClick={handleCloseEditRefuelModal}>Cancelar</Button>
                                    <Button type="submit" variant="contained">Salvar Alterações</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Modal>

            <Dialog open={finishTripDialogOpen} onClose={handleCloseFinishDialog}>
                <DialogTitle>Finalizar Viagem</DialogTitle>
                <DialogContent>
                    <DialogContentText>Você está prestes a finalizar a viagem para <strong>{selectedTrip?.end_city}</strong>. Por favor, insira a distância total percorrida (em km), se desejar.</DialogContentText>
                    <TextField autoFocus margin="dense" name="distancia_total" label="Distância Total (km)" type="number" value={distanciaFinal} onChange={(e) => setDistanciaFinal(e.target.value)} fullWidth variant="standard" />
                </DialogContent>
                <DialogActions><Button onClick={handleCloseFinishDialog}>Cancelar</Button><Button onClick={handleFinishTrip} variant="contained" color="success">Confirmar Finalização</Button></DialogActions>
            </Dialog>

            <Dialog open={cancelTripDialogOpen} onClose={handleCloseCancelDialog}>
                <DialogTitle>Cancelar Viagem</DialogTitle>
                <DialogContent><DialogContentText>Tem certeza que deseja cancelar a viagem para <strong>{selectedTrip?.end_city}</strong>? Esta ação não pode ser desfeita.</DialogContentText></DialogContent>
                <DialogActions><Button onClick={handleCloseCancelDialog}>Não</Button><Button onClick={handleCancelTrip} variant="contained" color="error">Sim, Cancelar</Button></DialogActions>
            </Dialog>

            <Modal open={editVehicleModalOpen} onClose={handleCloseEditVehicleModal}>
                <Box sx={styleModal}><Typography variant="h6" component="h2">Editar Veículo: {selectedVehicle?.name}</Typography><Grid container spacing={2} sx={{ mt: 2 }}><Grid item xs={12}><TextField name="tank_capacity" label="Capacidade do Tanque (L)" type="number" value={vehicleEditData.tank_capacity} onChange={handleVehicleEditChange} fullWidth /></Grid></Grid><Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseEditVehicleModal}>Cancelar</Button><Button variant="contained" onClick={handleSaveVehicleEdit}>Salvar</Button></Box></Box>
            </Modal>

            <Modal open={editDriverModalOpen} onClose={handleCloseEditDriverModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Editar Motorista: {selectedDriver?.name}</Typography>
                    <Box component="form" onSubmit={handleSaveDriverEdit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><TextField name="name" label="Nome Completo *" value={driverEditData.name} onChange={handleDriverEditChange} fullWidth required /></Grid>
                            <Grid item xs={12} md={6}><TextField name="cpf" label="CPF" value={driverEditData.cpf} onChange={handleDriverEditChange} fullWidth /></Grid>
                            <Grid item xs={12} md={6}><TextField name="cnh_number" label="Número da CNH" value={driverEditData.cnh_number} onChange={handleDriverEditChange} fullWidth /></Grid>
                            <Grid item xs={12} md={6}><FormControl fullWidth><InputLabel>Categoria da CNH</InputLabel><Select name="cnh_category" label="Categoria da CNH" value={driverEditData.cnh_category} onChange={handleDriverEditChange}><MenuItem value="">Nenhum</MenuItem><MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="D">D</MenuItem><MenuItem value="E">E</MenuItem><MenuItem value="AB">AB</MenuItem><MenuItem value="AC">AC</MenuItem><MenuItem value="AD">AD</MenuItem><MenuItem value="AE">AE</MenuItem></Select></FormControl></Grid>
                            <Grid item xs={12} md={6}><TextField name="cnh_validity" label="Validade CNH" type="date" value={driverEditData.cnh_validity} onChange={handleDriverEditChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                            <Grid item xs={12} md={6}><TextField name="phone" label="Telefone" value={driverEditData.phone} onChange={handleDriverEditChange} fullWidth /></Grid>
                            <Grid item xs={12} md={6}><TextField name="username" label="Nome de Usuário *" value={driverEditData.username} onChange={handleDriverEditChange} fullWidth required /></Grid>
                            <Grid item xs={12}><Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseEditDriverModal}>Cancelar</Button><Button type="submit" variant="contained">Salvar Alterações</Button></Box></Grid>
                        </Grid>
                    </Box>
                </Box>
            </Modal>

            <Modal open={passwordChangeModalOpen} onClose={handleClosePasswordChangeModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Alterar Senha do Motorista</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Motorista: {selectedDriver?.name}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField fullWidth label="Nova Senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Confirmar Nova Senha" type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} /></Grid>
                        {passwordChangeError && (<Grid item xs={12}><Alert severity="error">{passwordChangeError}</Alert></Grid>)}
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleClosePasswordChangeModal}>Cancelar</Button><Button variant="contained" onClick={handlePasswordChange}>Alterar Senha</Button></Box>
                </Box>
            </Modal>

            <Modal open={createUserModalOpen} onClose={handleCloseCreateUserModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Criar Conta de Usuário para Motorista</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Motorista: {selectedDriver?.name}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField fullWidth label="Nome de Usuário" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Senha Inicial" type="password" value={newPasswordCreate} onChange={(e) => setNewPasswordCreate(e.target.value)} /></Grid>
                        {createUserError && (<Grid item xs={12}><Alert severity="error">{createUserError}</Alert></Grid>)}
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseCreateUserModal}>Cancelar</Button><Button variant="contained" onClick={handleCreateUser}>Criar Usuário</Button></Box>
                </Box>
            </Modal>

            <Dialog open={deleteDriverDialogOpen} onClose={() => setDeleteDriverDialogOpen(false)}><DialogTitle>Confirmar Exclusão</DialogTitle><DialogContent><DialogContentText>Tem certeza que deseja excluir o motorista <strong>{selectedDriver?.name}</strong>? Esta ação não pode ser desfeita.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteDriverDialogOpen(false)}>Cancelar</Button><Button onClick={handleDeleteDriver} variant="contained" color="error">Excluir</Button></DialogActions></Dialog>

            <Dialog open={deleteRefuelDialogOpen} onClose={() => setDeleteRefuelDialogOpen(false)}><DialogTitle>Confirmar Exclusão</DialogTitle><DialogContent><DialogContentText>Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteRefuelDialogOpen(false)}>Cancelar</Button><Button onClick={handleDeleteRefuel} variant="contained" color="error">Excluir</Button></DialogActions></Dialog>

            <Modal open={mapModalOpen} onClose={handleCloseMapModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">{mapTripName}</Typography>
                    {mapTripData.length > 0 ? (<MapContainer center={mapTripData[0]} zoom={13} style={{ height: '400px', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' /><Polyline positions={mapTripData} color="blue" /><Marker position={mapTripData[0]} icon={L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: L.Icon.Default.prototype.options.shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] })}><Popup>Início da Viagem</Popup></Marker><Marker position={mapTripData[mapTripData.length - 1]} icon={L.icon({ iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: L.Icon.Default.prototype.options.shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] })}><Popup>Fim da Viagem</Popup></Marker></MapContainer>) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>)}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseMapModal}>Fechar</Button></Box>
                </Box>
            </Modal>

            <Modal open={imageModalOpen} onClose={handleCloseImageModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Fotos do Abastecimento</Typography>
                    <ImageList sx={{ width: '100%', height: 450 }} cols={1}>
                        {imagesToDisplay.map((item) => (
                            <ImageListItem key={item.img}>
                                <img
                                    src={`${item.img}`}
                                    alt={item.title}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={item.title}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCloseImageModal}>Fechar</Button>
                    </Box>
                </Box>
            </Modal>
            <Modal open={editDriverVehiclesModalOpen} onClose={handleCloseEditDriverVehiclesModal}>
                <Box sx={styleModal}>
                    <Typography variant="h6" component="h2">Gerenciar Veículos de: {selectedDriver?.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        Selecione os veículos que o motorista poderá acessar no aplicativo.
                    </Typography>
                    {loadingDriverVehicles ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : (
                        <FormControl fullWidth>
                            <Autocomplete
                                multiple
                                id="vehicles-for-driver-select"
                                options={vehicles}
                                getOptionLabel={(option) => option.name}
                                value={vehicles.filter(v => selectedVehiclesForDriver.includes(v.id))}
                                onChange={(event, newValue) => {
                                    setSelectedVehiclesForDriver(newValue.map(v => v.id));
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            variant="outlined"
                                            label={option.name}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Veículos Associados"
                                        placeholder="Selecione os veículos"
                                    />
                                )}
                            />
                        </FormControl>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleCloseEditDriverVehiclesModal}>Cancelar</Button>
                        <Button variant="contained" onClick={handleSaveDriverVehiclesEdit} disabled={loadingDriverVehicles}>Salvar</Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
};

export default GestaoFrotaPage;