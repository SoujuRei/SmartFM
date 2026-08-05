import React, { useState } from 'react';
import { useRevenueReport } from '../hooks';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState as EmptyStateComp } from '../../../components/ui/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Input } from '../../../components/ui/Input';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount);
}

const COLORS = ['#004ac6', '#505f76', '#2563eb', '#059669', '#ba1a1a'];

export function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data, isLoading } = useRevenueReport({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }
  if (!data) {
    return <EmptyStateComp icon="error" title="Failed to load report" description="No data available." />;
  }

  const { totalRevenue, totalOrders, deliveredOrders, byStatus, monthly } = data;

  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-[#131b2e]">Reports</h2>
        <p className="text-sm text-[#505f76]">Revenue, delivered volume, and order status breakdown by date range.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-[#2563eb]">
          <p className="text-sm text-[#505f76] mb-1 font-medium uppercase tracking-wide">Total Revenue</p>
          <p className="font-mono text-3xl font-bold text-[#131b2e]">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="border-l-4 border-l-[#505f76]">
          <p className="text-sm text-[#505f76] mb-1 font-medium uppercase tracking-wide">Total Orders</p>
          <p className="font-mono text-3xl font-bold text-[#131b2e]">{totalOrders}</p>
        </Card>
        <Card className="border-l-4 border-l-[#059669]">
          <p className="text-sm text-[#505f76] mb-1 font-medium uppercase tracking-wide">Delivered</p>
          <p className="font-mono text-3xl font-bold text-[#131b2e]">{deliveredOrders}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card padding={false} className="flex flex-col">
          <CardHeader title="Monthly Revenue" />
          <div className="p-6 h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d7" vertical={false} />
                <XAxis dataKey="month" stroke="#737686" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#737686"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: '#f2f3ff' }}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #c3c6d7', background: '#ffffff' }}
                  formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Breakdown */}
        <Card padding={false} className="flex flex-col">
          <CardHeader title="Orders by Status" />
          <div className="p-6 h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '6px', border: '1px solid #c3c6d7', background: '#ffffff' }}
                  formatter={(value: any, name: any) => [value, String(name).replace('_', ' ')]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
