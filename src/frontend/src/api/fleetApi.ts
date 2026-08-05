import axiosClient from './axiosClient';
import { type Vehicle, type Driver } from '../mocks/db';

function normalizeVehicle(vehicle: any): Vehicle {
  return {
    id: vehicle.id ?? vehicle.vehicleId ?? vehicle.vehicle_id,
    plateNumber: vehicle.plateNumber ?? vehicle.registration ?? '',
    type: vehicle.type ?? 'Unknown',
    capacityKg: vehicle.capacityKg ?? vehicle.capacityWeight ?? vehicle.capacity_weight ?? 0,
    status: vehicle.status ?? 'AVAILABLE',
    currentLocation: vehicle.currentLocation ?? vehicle.current_location ?? '',
  };
}

export const fleetApi = {
  getAvailableVehicles: (minCapacity?: number) =>
    axiosClient
      .get('/fleet/vehicles/available', {
        params: minCapacity !== undefined ? { minCapacity } : undefined,
      })
      .then(r => ({ ...r, data: (r.data ?? []).map(normalizeVehicle) })),

  getDrivers: () =>
    axiosClient.get<Driver[]>('/drivers'),

  dispatchShipment: (payload: {
    orderId: string;
    vehicleId: string;
    driverId: string;
    estimatedDelivery?: string;
  }) => axiosClient.post('/shipments', payload),
};
