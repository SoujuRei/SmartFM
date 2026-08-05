import axiosClient from './axiosClient';

export const reportsApi = {
  getRevenue: (params?: { startDate?: string; endDate?: string }) =>
    axiosClient.get<{
      totalRevenue: number;
      totalOrders: number;
      deliveredOrders: number;
      byStatus: Record<string, number>;
      monthly: Array<{ month: string; revenue: number }>;
    }>('/reports/revenue', { params }),
};
