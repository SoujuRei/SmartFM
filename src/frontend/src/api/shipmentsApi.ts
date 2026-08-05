import axiosClient from './axiosClient';
import { type ShipmentStatus } from '../constants/enums';

function normalizeShipment(shipment: any) {
  const normalizedOrder = shipment.order
    ? {
        ...(shipment.order || {}),
        id: shipment.order.id ?? shipment.order.orderId,
        orderId: shipment.order.orderId ?? shipment.order.id,
      }
    : undefined;

  const normalizedVehicle = shipment.vehicle
    ? {
        ...(shipment.vehicle || {}),
        id: shipment.vehicle.id ?? shipment.vehicle.vehicleId,
        plateNumber: shipment.vehicle.plateNumber ?? shipment.vehicle.registration ?? '',
        type: shipment.vehicle.type ?? shipment.vehicle.vehicleType ?? shipment.vehicle.category ?? 'Unknown',
        capacityKg: shipment.vehicle.capacityKg ?? shipment.vehicle.capacityWeight ?? shipment.vehicle.capacity_weight ?? 0,
      }
    : undefined;

  return {
    ...shipment,
    id: shipment.id ?? shipment.shipmentId,
    shipmentId: shipment.shipmentId ?? shipment.id,
    order: normalizedOrder,
    vehicle: normalizedVehicle,
    driver: shipment.driver ? { ...(shipment.driver || {}), id: shipment.driver.id ?? shipment.driver.userId } : undefined,
  };
}

export const shipmentsApi = {
  getShipments: (driverId?: string) =>
    axiosClient
      .get('/shipments', { params: driverId ? { driverId } : undefined })
      .then((r) => ({ ...r, data: (r.data ?? []).map(normalizeShipment) })),

  updateStatus: (shipmentId: string, status: ShipmentStatus, location: string, description: string) =>
    axiosClient.patch(`/shipments/${shipmentId}/status`, { status, location, description }),

  addTracking: (shipmentId: string, payload: { location: string; note: string }) =>
    axiosClient.post(`/shipments/${shipmentId}/tracking`, payload),
};
