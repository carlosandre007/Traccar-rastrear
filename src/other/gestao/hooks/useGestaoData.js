import { useState, useEffect, useCallback } from 'react';
import { 
  getVehicles, 
  getDrivers, 
  getTrips, 
  getRefuels, 
  getCostReports 
} from '../utils/apiUtils';

// Hook para gerenciar dados principais da gestão
export const useGestaoData = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openTrips, setOpenTrips] = useState([]);
  const [closedTrips, setClosedTrips] = useState([]);
  const [allRefuels, setAllRefuels] = useState([]);
  const [allExtraCosts, setAllExtraCosts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [vehiclesData, driversData, tripsData, refuelsData, extraCostsData] = await Promise.all([
        getVehicles(),
        getDrivers(),
        getTrips(),
        getRefuels(),
        getCostReports()
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      
      // Separar viagens abertas e fechadas
      const open = tripsData.filter(trip => !trip.end_date);
      const closed = tripsData.filter(trip => trip.end_date);
      setOpenTrips(open);
      setClosedTrips(closed);
      
      setAllRefuels(refuelsData);
      setAllExtraCosts(extraCostsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    vehicles,
    drivers,
    openTrips,
    closedTrips,
    allRefuels,
    allExtraCosts,
    loading,
    error,
    refreshData,
    setVehicles,
    setDrivers,
    setOpenTrips,
    setClosedTrips,
    setAllRefuels,
    setAllExtraCosts
  };
};
