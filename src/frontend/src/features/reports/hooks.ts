import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reportsApi';

export function useRevenueReport(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: () => reportsApi.getRevenue(params).then(r => r.data),
  });
}
