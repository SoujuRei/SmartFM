import axiosClient from './axiosClient';
import { type ShipmentStatus } from '../constants/enums';

export const shipmentsApi = {
  getShipments: (driverId?: string) =>
    axiosClient.get('/shipments', { params: driverId ? { driverId } : undefined }),

  updateStatus: (shipmentId: string, status: ShipmentStatus) =>
    axiosClient.patch(`/shipments/${shipmentId}/status`, { status }),

  addTracking: (shipmentId: string, payload: { location: string; note: string }) =>
    axiosClient.post(`/shipments/${shipmentId}/tracking`, payload),
};
