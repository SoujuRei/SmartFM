import axiosClient from './axiosClient';

export const paymentsApi = {
  payOrder: (orderId: string) =>
    axiosClient.post('/payments', { orderId }),
};
