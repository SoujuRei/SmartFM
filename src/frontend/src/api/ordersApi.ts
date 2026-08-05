import axiosClient from './axiosClient';
import { type CargoItem, type Order } from '../mocks/db';
import { type PaymentMethod } from '../constants/enums';

export interface CreateOrderPayload {
  customerId: string;
  origin: string;
  destination: string;
  cargoItems: Array<Omit<CargoItem, 'id'>>;
  paymentMethod: PaymentMethod;
}

export const ordersApi = {
  getOrders: (customerId?: string) =>
    axiosClient.get<Order[]>('/orders', { params: customerId ? { customerId } : undefined }),

  getOrder: (id: string) =>
    axiosClient.get<Order>(`/orders/${id}`),

  createOrder: (payload: CreateOrderPayload) =>
    axiosClient.post<Order>('/orders', payload),

  getTracking: (orderId: string) =>
    axiosClient.get<{
      order: Order;
      shipment: unknown;
      events: Array<{ id: string; location: string; note: string; timestamp: string }>;
    }>(`/orders/${orderId}/tracking`),
};
