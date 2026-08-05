import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderPayload } from '../../api/ordersApi';
import { paymentsApi } from '../../api/paymentsApi';

export function useOrders(customerId?: string) {
  return useQuery({
    queryKey: ['orders', customerId],
    queryFn: () => ordersApi.getOrders(customerId).then(r => r.data),
  });
}

export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId, 'tracking'],
    queryFn: () => ordersApi.getTracking(orderId).then(r => r.data),
    enabled: !!orderId,
    refetchInterval: 5000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.createOrder(payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function usePayOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.payOrder(orderId).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
