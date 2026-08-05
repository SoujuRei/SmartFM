import axiosClient from './axiosClient';
import { type CargoItem, type Order } from '../mocks/db';
import { type PaymentMethod } from '../constants/enums';

function normalizeCargoItem(item: any) {
  return {
    ...item,
    id: item.id ?? item.cargoId ?? item.cargo_id,
    weightKg: item.weight ?? item.weightKg,
    dimensions: item.dimensions ?? {
      lengthCm: item.lengthCm ?? item.length_cm,
      widthCm: item.widthCm ?? item.width_cm,
      heightCm: item.heightCm ?? item.height_cm,
    },
  };
}

function normalizeOrder(order: any): Order {
  return {
    ...order,
    id: order.id ?? order.orderId ?? order.order_id,
    customerId: order.customerId ?? order.customer_id,
    origin: order.origin,
    destination: order.destination,
    cargoItems: (order.cargoItems ?? order.items ?? []).map(normalizeCargoItem),
    totalWeightKg: order.totalWeightKg ?? order.total_weight_kg ?? 0,
    distanceKm: order.distanceKm ?? order.distance_km ?? 0,
    paymentMethod: order.paymentMethod ?? order.payment_method,
    status: order.status,
    totalAmount: order.totalAmount ?? order.total_amount ?? 0,
    isPaid: order.isPaid ?? order.is_paid ?? false,
    createdAt: order.createdAt ?? order.created_at,
    updatedAt: order.updatedAt ?? order.updated_at,
  };
}

export interface CreateOrderPayload {
  customerId: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  cargoItems: Array<Omit<CargoItem, 'id'>>;
  paymentMethod: PaymentMethod;
}

export const ordersApi = {
  getOrders: (customerId?: string) =>
    axiosClient
      .get<Order[]>('/orders', { params: customerId ? { customerId } : undefined })
      .then(r => ({ ...r, data: r.data.map(normalizeOrder) })),

  getOrder: (id: string) =>
    axiosClient
      .get<Order>(`/orders/${id}`)
      .then(r => ({ ...r, data: normalizeOrder(r.data) })),

  createOrder: (payload: CreateOrderPayload) =>
    axiosClient
      .post<Order>('/orders', payload)
      .then(r => ({ ...r, data: normalizeOrder(r.data) })),

  payOrder: (orderId: string) =>
    axiosClient.post(`/orders/${orderId}/pay`, {}),

  cancelOrder: (orderId: string) =>
    axiosClient.post(`/orders/${orderId}/cancel`, {}),

  deleteOrder: (orderId: string) =>
    axiosClient.delete(`/orders/${orderId}`),

  getTracking: (orderId: string) =>
    axiosClient.get<{
      order: Order;
      shipment: unknown;
      events: Array<{ id: string; location: string; note: string; timestamp: string }>;
    }>(`/orders/${orderId}/tracking`)
      .then(r => ({
        ...r,
        data: {
          ...r.data,
          order: normalizeOrder(r.data.order),
        },
      })),
};