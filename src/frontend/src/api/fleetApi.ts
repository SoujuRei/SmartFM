import axiosClient from './axiosClient';
import { type Vehicle, type Driver } from '../mocks/db';

export const fleetApi = {
  getAvailableVehicles: (minCapacity?: number) =>
    axiosClient.get<Vehicle[]>('/vehicles/available', {
      params: minCapacity !== undefined ? { minCapacity } : undefined,
    }),

  getDrivers: () =>
    axiosClient.get<Driver[]>('/drivers'),

  dispatchShipment: (payload: {
    orderId: string;
    vehicleId: string;
    driverId: string;
    estimatedDelivery?: string;
  }) => axiosClient.post('/shipments', payload),
};
