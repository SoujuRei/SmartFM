import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '../../api/fleetApi';

export function useAvailableVehicles(minCapacity?: number) {
  return useQuery({
    queryKey: ['vehicles', 'available', minCapacity],
    queryFn: () => fleetApi.getAvailableVehicles(minCapacity).then(r => r.data),
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => fleetApi.getDrivers().then(r => r.data),
  });
}

export function useDispatchShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      orderId: string;
      vehicleId: string;
      driverId: string;
      estimatedDelivery?: string;
    }) => fleetApi.dispatchShipment(payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['vehicles'], exact: false });
      qc.invalidateQueries({ queryKey: ['shipments'], exact: false });
    },
  });
}
