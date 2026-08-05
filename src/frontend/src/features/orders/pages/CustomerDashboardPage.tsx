import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useOrders, usePayOrder } from '../hooks';
import { OrderStatus, type OrderStatus as OrderStatusType } from '../../../constants/enums';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState as EmptyStateComp } from '../../../components/ui/EmptyState';
import { PaymentModal } from '../components/PaymentModal';
import { type Order } from '../../../mocks/db';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}

export function CustomerDashboardPage() {
  const { loggedInUser } = useAuth();
  const { data: orders, isLoading } = useOrders(loggedInUser?.id);
  const payMutation = usePayOrder();
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const totalOrders = orders?.length ?? 0;
  const activeOrders = orders?.filter(o =>
    [OrderStatus.PROCESSING, OrderStatus.DISPATCHED].includes(o.status as OrderStatusType)
  ).length ?? 0;
  const deliveredOrders = orders?.filter(o => o.status === OrderStatus.DELIVERED).length ?? 0;
  const pendingPayment = orders?.filter(o => o.status === OrderStatus.PENDING).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#131b2e] tracking-tight">
            Welcome back, {loggedInUser?.name.split(' ')[0]}!
          </h2>
          <p className="text-sm text-[#505f76] mt-1">Review orders, payment state, and shipment tracking links.</p>
        </div>
        <Link to="/customer/new-order">
          <Button>
            <span className="material-symbols-outlined text-base">add</span>
            New Order
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon="inventory_2" iconBg="bg-[#e2e7ff]" iconColor="text-[#131b2e]"
          label="Total Orders" value={totalOrders} />
        <MetricCard icon="local_shipping" iconBg="bg-[#e2e7ff]" iconColor="text-[#505f76]"
          label="Active Shipments" value={activeOrders} />
        <MetricCard icon="check_circle" iconBg="bg-[#e2e7ff]" iconColor="text-[#059669]"
          label="Delivered" value={deliveredOrders} />
        <MetricCard icon="payment" iconBg="bg-[#e2e7ff]" iconColor="text-[#004ac6]"
          label="Pending" value={pendingPayment} highlight={pendingPayment > 0} />
      </div>

      {/* Orders Table */}
      <Card padding={false}>
        <CardHeader
          title="My Orders"
          action={
            <Link to="/customer/new-order" className="text-xs font-semibold text-[#1d4ed8] hover:text-[#004ac6]">
              + New Order
            </Link>
          }
        />
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : !orders?.length ? (
          <EmptyStateComp
            icon="inventory_2"
            title="No orders yet"
            description="Create your first shipment order to get started."
            action={<Link to="/customer/new-order"><Button size="sm">Create Order</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f2f3ff] border-b border-[#c3c6d7]">
                  {['Order ID', 'Route', 'Cargo', 'Dimensions', 'Payment', 'Status', 'Amount', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#505f76] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-[#e2e7ff] hover:bg-[#faf8ff] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-[#131b2e] bg-[#f2f3ff] px-2 py-1 rounded-sm">
                        {order.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#131b2e]">
                        <p className="font-medium">{order.origin}</p>
                        <p className="text-[#505f76]">to {order.destination}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#505f76]">
                      {order.cargoItems.length} item(s) · {order.totalWeightKg}kg
                    </td>
                    <td className="px-4 py-3 text-xs text-[#505f76]">
                      {order.cargoItems.map(item => `${item.dimensions.lengthCm}x${item.dimensions.widthCm}x${item.dimensions.heightCm}cm`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#131b2e]">
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="order" status={order.status as OrderStatusType} />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#131b2e]">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.status === OrderStatus.PENDING && (
                          <Button
                            size="sm"
                            onClick={() => setPayingOrder(order)}
                            isLoading={payMutation.isPending}
                          >
                            Pay Now
                          </Button>
                        )}
                        {[OrderStatus.DISPATCHED, OrderStatus.DELIVERED].includes(
                          order.status as OrderStatusType
                        ) && (
                          <Link to={`/customer/orders/${order.id}/tracking`}>
                            <Button size="sm" variant="secondary">Track</Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          isOpen={!!payingOrder}
          onClose={() => setPayingOrder(null)}
          onConfirm={async () => {
            await payMutation.mutateAsync(payingOrder.id);
            setPayingOrder(null);
          }}
          isLoading={payMutation.isPending}
        />
      )}
    </div>
  );
}

function MetricCard({
  icon, iconBg, iconColor, label, value, highlight = false,
}: {
  icon: string; iconBg: string; iconColor: string;
  label: string; value: number; highlight?: boolean;
}) {
  return (
    <div className={[
      'bg-[#ffffff] rounded-md border p-6 shadow-[0_1px_0_rgba(32,27,22,0.08)] relative overflow-hidden group',
      highlight ? 'border-[#2563eb]' : 'border-[#c3c6d7]',
    ].join(' ')}>
      <div className={`w-10 h-10 ${iconBg} rounded-md flex items-center justify-center mb-4`}>
        <span className={`material-symbols-outlined ${iconColor} text-xl`}>{icon}</span>
      </div>
      <p className="text-xs text-[#505f76] mb-1">{label}</p>
      <p className="font-mono text-2xl font-bold text-[#131b2e]">{value}</p>
    </div>
  );
}
