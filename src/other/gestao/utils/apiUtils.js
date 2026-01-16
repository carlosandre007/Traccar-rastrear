import { API_GESTAO_URL, apiConfig } from '../constants';

// Funções utilitárias para API

export const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${API_GESTAO_URL}${endpoint}`;
  const config = {
    ...apiConfig,
    ...options,
    credentials: 'include', // Para incluir cookies de sessão do Traccar
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const getVehicles = async () => {
  return makeApiRequest('/vehicles');
};

export const getDrivers = async () => {
  return makeApiRequest('/drivers');
};

export const getTrips = async (status = null) => {
  const endpoint = status ? `/trips?status=${status}` : '/trips';
  return makeApiRequest(endpoint);
};

export const getRefuels = async () => {
  return makeApiRequest('/abastecimentos/todos');
};

export const getExtraCosts = async () => {
  return makeApiRequest('/relatorios/custos-extras');
};

export const createTrip = async (tripData) => {
  return makeApiRequest('/trips/iniciar', {
    method: 'POST',
    body: JSON.stringify(tripData),
  });
};

export const updateTrip = async (tripId, tripData) => {
  if (tripData.end_date) {
    // Finalizar viagem
    return makeApiRequest(`/trips/${tripId}/finalizar`, {
      method: 'PUT',
      body: JSON.stringify({ distancia_total: tripData.distance }),
    });
  } else {
    // Cancelar viagem
    return makeApiRequest(`/trips/${tripId}/cancelar`, {
      method: 'PUT',
    });
  }
};

export const deleteTrip = async (tripId) => {
  return makeApiRequest(`/trips/${tripId}/cancelar`, {
    method: 'PUT',
  });
};

export const createDriver = async (driverData) => {
  return makeApiRequest('/drivers', {
    method: 'POST',
    body: JSON.stringify(driverData),
  });
};

export const updateDriver = async (driverId, driverData) => {
  return makeApiRequest(`/drivers/${driverId}`, {
    method: 'PUT',
    body: JSON.stringify(driverData),
  });
};

export const updateDriverPassword = async (driverId, newPassword) => {
  return makeApiRequest(`/drivers/${driverId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password: newPassword }),
  });
};

export const deleteDriver = async (driverId) => {
  return makeApiRequest(`/drivers/${driverId}`, {
    method: 'DELETE',
  });
};

export const createRefuel = async (refuelData) => {
  return makeApiRequest('/refuelings', {
    method: 'POST',
    body: JSON.stringify(refuelData),
  });
};

export const updateRefuel = async (refuelId, refuelData) => {
  return makeApiRequest(`/abastecimentos/${refuelId}`, {
    method: 'PUT',
    body: JSON.stringify(refuelData),
  });
};

export const deleteRefuel = async (refuelId) => {
  return makeApiRequest(`/abastecimentos/${refuelId}`, {
    method: 'DELETE',
  });
};

export const createExtraCost = async (costData) => {
  return makeApiRequest('/custos', {
    method: 'POST',
    body: JSON.stringify(costData),
  });
};

export const updateExtraCost = async (costId, costData) => {
  return makeApiRequest(`/custos/${costId}`, {
    method: 'PUT',
    body: JSON.stringify(costData),
  });
};

export const deleteExtraCost = async (costId) => {
  return makeApiRequest(`/custos/${costId}`, {
    method: 'DELETE',
  });
};

export const getReports = async (type, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/relatorios/${type}${queryParams ? `?${queryParams}` : ''}`;
  return makeApiRequest(endpoint);
};

// Funções específicas para relatórios
export const getCostReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/custos-extras?${new URLSearchParams(filters).toString()}`);
};

export const getTripCostReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/custos-por-viagem?${new URLSearchParams(filters).toString()}`);
};

export const getCategoryCostReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/custos-por-categoria?${new URLSearchParams(filters).toString()}`);
};

export const getConsumptionReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/consumo-medio?${new URLSearchParams(filters).toString()}`);
};

export const getRefuelingDistanceReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/distancia-abastecimentos?${new URLSearchParams(filters).toString()}`);
};

export const getRefuelingCostReports = async (filters = {}) => {
  return makeApiRequest(`/relatorios/custo-abastecimento-total?${new URLSearchParams(filters).toString()}`);
};
