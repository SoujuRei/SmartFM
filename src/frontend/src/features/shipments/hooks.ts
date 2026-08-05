import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi } from '../../api/shipmentsApi';
import { type ShipmentStatus } from '../../constants/enums';

export function useDriverShipments(driverId?: string) {
  return useQuery({
    queryKey: ['shipments', 'driver', driverId],
    queryFn: () => shipmentsApi.getShipments(driverId).then(r => r.data),
    enabled: !!driverId,
  });
}

export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: () => shipmentsApi.getShipments().then(r => r.data),
  });
}

export function useUpdateShipmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, status }: { shipmentId: string; status: ShipmentStatus }) =>
      shipmentsApi.updateStatus(shipmentId, status).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useAddTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, payload }: { shipmentId: string; payload: { location: string; note: string } }) =>
      shipmentsApi.addTracking(shipmentId, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['orders', undefined, 'tracking'] });
    },
  });
}
