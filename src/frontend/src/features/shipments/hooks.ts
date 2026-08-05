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
    mutationFn: ({ shipmentId, status, location, description }: { shipmentId: string; status: ShipmentStatus; location: string; description: string }) =>
      shipmentsApi.updateStatus(shipmentId, status, location, description).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'], exact: false });
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['shipments', 'driver'], exact: false });
    },
  });
}

export function useAddTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shipmentId, payload }: { shipmentId: string; payload: { location: string; note: string } }) =>
      shipmentsApi.addTracking(shipmentId, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'], exact: false });
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['shipments', 'driver'], exact: false });
    },
  });
}
