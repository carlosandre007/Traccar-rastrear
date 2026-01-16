import React, { useState } from 'react';
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
  Delete as DeleteIcon,
  Image as ImageIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { exportData } from '../utils/exportUtils';

const RefuelsTab = ({
  vehicles,
  allRefuels,
  newStandaloneRefuel,
  setNewStandaloneRefuel,
  refuelFiles,
  handleFileChange,
  selectedRefuel,
  refuelEditData,
  setRefuelEditData,
  editRefuelModalOpen,
  setEditRefuelModalOpen,
  deleteRefuelDialogOpen,
  setDeleteRefuelDialogOpen,
  selectedRefuelToDelete,
  loadingRefuels,
  handleCreateRefuel,
  handleEditRefuel,
  handleSaveRefuelEdit,
  handleDeleteRefuel,
  handleConfirmDeleteRefuel
}) => {
  // Estados para upload de fotos na edição
  const [editRefuelFiles, setEditRefuelFiles] = useState({ foto_bomba: null, foto_odometro: null });
  
  // Estado para modal de visualização de fotos
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Função para carregar imagem via API do backend de gestão
  const loadImageWithAuth = async (filename) => {
    try {
      // Extrair apenas o nome do arquivo (sem o caminho /uploads/)
      const cleanFilename = filename.replace(/^\/?uploads\//, '');
      
      console.log('Tentando carregar imagem:', filename, '-> arquivo limpo:', cleanFilename);
      
      // Tentar via API específica do backend de gestão
      const apiUrl = `/gestao/abastecimentos/image/${cleanFilename}`;
      
      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: { 'Accept': 'image/*' }
      });
      
      console.log(`API ${apiUrl}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      
      // Se a API específica falhar, tentar URLs diretas como fallback
      const fallbackUrls = [
        `/uploads/${cleanFilename}`,
        `/gestao/uploads/${cleanFilename}`,
        `/gestao/files/${cleanFilename}`,
        `/gestao/static/${cleanFilename}`
      ];
      
      for (const imageUrl of fallbackUrls) {
        try {
          let response = await fetch(imageUrl, {
            credentials: 'include',
            headers: { 'Accept': 'image/*' }
          });
          
          console.log(`Fallback ${imageUrl}: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
        } catch (urlError) {
          console.log(`Erro ao tentar fallback ${imageUrl}:`, urlError.message);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      return null;
    }
  };

  // Função para abrir modal de fotos
  const handleOpenPhotoModal = async (refuel) => {
    setLoadingPhotos(true);
    setPhotoModalOpen(true);
    
    const photos = [];
    
    if (refuel.foto_bomba) {
      const imageData = await loadImageWithAuth(refuel.foto_bomba);
      let fallbackUrl;
      if (refuel.foto_bomba.startsWith('/')) {
        fallbackUrl = refuel.foto_bomba;
      } else if (refuel.foto_bomba.startsWith('uploads/')) {
        fallbackUrl = `/gestao/${refuel.foto_bomba}`;
      } else {
        fallbackUrl = `/gestao/uploads/${refuel.foto_bomba}`;
      }
      
      photos.push({
        url: imageData || fallbackUrl,
        title: 'Foto da Bomba',
        type: 'bomba',
        filename: refuel.foto_bomba,
        loaded: !!imageData
      });
    }
    
    if (refuel.foto_odometro) {
      const imageData = await loadImageWithAuth(refuel.foto_odometro);
      let fallbackUrl;
      if (refuel.foto_odometro.startsWith('/')) {
        fallbackUrl = refuel.foto_odometro;
      } else if (refuel.foto_odometro.startsWith('uploads/')) {
        fallbackUrl = `/gestao/${refuel.foto_odometro}`;
      } else {
        fallbackUrl = `/gestao/uploads/${refuel.foto_odometro}`;
      }
      
      photos.push({
        url: imageData || fallbackUrl,
        title: 'Foto do Odômetro',
        type: 'odometro',
        filename: refuel.foto_odometro,
        loaded: !!imageData
      });
    }
    
    setSelectedPhotos(photos);
    setLoadingPhotos(false);
  };

  // Função para exportar abastecimentos
  const handleExportRefuels = (format = 'excel') => {
    const columns = [
      { field: 'vehicle_name', headerName: 'Veículo' },
      { field: 'refuel_date', headerName: 'Data' },
      { field: 'odometer', headerName: 'Odômetro (km)' },
      { field: 'liters_filled', headerName: 'Litros' },
      { field: 'total_cost', headerName: 'Valor' },
      { field: 'posto_nome', headerName: 'Posto' },
      { field: 'cidade', headerName: 'Cidade' },
      { field: 'is_full_tank', headerName: 'Tanque Cheio' }
    ];

    const data = allRefuels.map(refuel => ({
      ...refuel,
      vehicle_name: vehicles.find(v => v.id === refuel.vehicle_id)?.name || 'N/A',
      refuel_date: formatDate(refuel.refuel_date),
      total_cost: formatCurrency(refuel.total_cost),
      is_full_tank: refuel.is_full_tank ? 'Sim' : 'Não'
    }));

    exportData(data, format, columns, `abastecimentos_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`);
  };

  // Função para lidar com upload de arquivos na edição
  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    setEditRefuelFiles(prev => ({
      ...prev,
      [name]: files[0] || null
    }));
  };
  return (
    <Box>
      {/* Formulário para adicionar abastecimento */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Registrar Abastecimento</Typography>
        <Box component="form" onSubmit={handleCreateRefuel} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Veículo"
                value={newStandaloneRefuel.vehicle_id}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, vehicle_id: e.target.value }))}
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
                fullWidth
                label="Data/Hora"
                type="datetime-local"
                value={newStandaloneRefuel.refuel_date}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, refuel_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Odômetro (km)"
                type="number"
                value={newStandaloneRefuel.odometer}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, odometer: e.target.value }))}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Litros Abastecidos"
                type="number"
                value={newStandaloneRefuel.liters_filled}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, liters_filled: e.target.value }))}
                inputProps={{ min: 0, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Valor Total (R$)"
                type="number"
                value={newStandaloneRefuel.total_cost}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, total_cost: e.target.value }))}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Nome do Posto"
                value={newStandaloneRefuel.posto_nome}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, posto_nome: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cidade"
                value={newStandaloneRefuel.cidade}
                onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, cidade: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newStandaloneRefuel.is_full_tank}
                    onChange={(e) => setNewStandaloneRefuel(prev => ({ ...prev, is_full_tank: e.target.checked }))}
                  />
                }
                label="Tanque Cheio"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Foto da Bomba
                <input
                  type="file"
                  name="foto_bomba"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              {refuelFiles.foto_bomba && (
                <Typography variant="caption" color="success">
                  {refuelFiles.foto_bomba.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Foto do Odômetro
                <input
                  type="file"
                  name="foto_odometro"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </Button>
              {refuelFiles.foto_odometro && (
                <Typography variant="caption" color="success">
                  {refuelFiles.foto_odometro.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                disabled={loadingRefuels}
              >
                {loadingRefuels ? <CircularProgress size={20} /> : 'Registrar Abastecimento'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Lista de abastecimentos */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Histórico de Abastecimentos ({allRefuels.length})
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportRefuels('excel')}
              sx={{ mr: 1 }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportRefuels('pdf')}
              sx={{ mr: 1 }}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportRefuels('csv')}
            >
              CSV
            </Button>
          </Box>
        </Box>
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
                <TableCell>Tanque Cheio</TableCell>
                <TableCell>Fotos</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allRefuels.map((refuel) => (
                <TableRow key={refuel.id}>
                  <TableCell>
                    {vehicles.find(v => v.id === refuel.vehicle_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{formatDate(refuel.refuel_date)}</TableCell>
                  <TableCell>{refuel.odometer} km</TableCell>
                  <TableCell>{refuel.liters_filled} L</TableCell>
                  <TableCell>{formatCurrency(refuel.total_cost)}</TableCell>
                  <TableCell>{refuel.posto_nome || 'N/A'}</TableCell>
                  <TableCell>{refuel.cidade || 'N/A'}</TableCell>
                  <TableCell>{refuel.is_full_tank ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    {(refuel.foto_bomba || refuel.foto_odometro) ? (
                      <Button
                        size="small"
                        startIcon={<ImageIcon />}
                        onClick={() => handleOpenPhotoModal(refuel)}
                        variant="outlined"
                      >
                        Ver Fotos
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sem fotos
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditRefuel(refuel)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteRefuel(refuel)}
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

      {/* Modal para editar abastecimento */}
      <Dialog open={editRefuelModalOpen} onClose={() => setEditRefuelModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Abastecimento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Veículo"
                value={refuelEditData.vehicle_id}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, vehicle_id: e.target.value }))}
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
                fullWidth
                label="Data/Hora"
                type="datetime-local"
                value={refuelEditData.refuel_date}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, refuel_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Odômetro (km)"
                type="number"
                value={refuelEditData.odometer}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, odometer: e.target.value }))}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Litros Abastecidos"
                type="number"
                value={refuelEditData.liters_filled}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, liters_filled: e.target.value }))}
                inputProps={{ min: 0, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor Total (R$)"
                type="number"
                value={refuelEditData.total_cost}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, total_cost: e.target.value }))}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do Posto"
                value={refuelEditData.posto_nome}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, posto_nome: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                value={refuelEditData.cidade}
                onChange={(e) => setRefuelEditData(prev => ({ ...prev, cidade: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={refuelEditData.is_full_tank}
                    onChange={(e) => setRefuelEditData(prev => ({ ...prev, is_full_tank: e.target.checked }))}
                  />
                }
                label="Tanque Cheio"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Foto da Bomba
                <input
                  type="file"
                  name="foto_bomba"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  hidden
                />
              </Button>
              {editRefuelFiles.foto_bomba && (
                <Typography variant="caption" color="success">
                  {editRefuelFiles.foto_bomba.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                Foto do Odômetro
                <input
                  type="file"
                  name="foto_odometro"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  hidden
                />
              </Button>
              {editRefuelFiles.foto_odometro && (
                <Typography variant="caption" color="success">
                  {editRefuelFiles.foto_odometro.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRefuelModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => handleSaveRefuelEdit(editRefuelFiles)} variant="contained" disabled={loadingRefuels}>
            {loadingRefuels ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteRefuelDialogOpen} onClose={() => setDeleteRefuelDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRefuelDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDeleteRefuel} variant="contained" color="error" disabled={loadingRefuels}>
            {loadingRefuels ? <CircularProgress size={20} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para visualizar fotos */}
      <Dialog 
        open={photoModalOpen} 
        onClose={() => setPhotoModalOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Fotos do Abastecimento</DialogTitle>
        <DialogContent>
          {loadingPhotos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Carregando fotos...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {selectedPhotos.map((photo, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      {photo.title}
                    </Typography>
                    {photo.loaded ? (
                      <img
                        src={photo.url}
                        alt={photo.title}
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        p: 2, 
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}>
                        <Typography variant="body2" color="error" gutterBottom>
                          Imagem não disponível
                        </Typography>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Arquivo: {photo.filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                          O servidor não está configurado para servir arquivos estáticos
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const cleanFilename = photo.filename.replace(/^\/?uploads\//, '');
                              const apiUrl = `/gestao/abastecimentos/image/${cleanFilename}`;
                              window.open(apiUrl, '_blank');
                            }}
                          >
                            Tentar API
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const cleanFilename = photo.filename.replace(/^\/?uploads\//, '');
                              const directUrl = `/uploads/${cleanFilename}`;
                              window.open(directUrl, '_blank');
                            }}
                          >
                            URL Direta
                          </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}>
                          {photo.filename}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RefuelsTab;
