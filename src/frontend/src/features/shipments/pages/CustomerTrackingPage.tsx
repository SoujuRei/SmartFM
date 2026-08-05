import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useOrders } from '../../orders/hooks';
import { OrderStatus } from '../../../constants/enums';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';

export function CustomerTrackingPage() {
  const { loggedInUser } = useAuth();
  const { data: orders, isLoading } = useOrders(loggedInUser?.id);
  const trackable = orders?.filter(order =>
    [OrderStatus.DISPATCHED, OrderStatus.DELIVERED].includes(order.status),
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-[#183446]">Tracking</h2>
        <p className="text-sm text-[#4B7084]">Open a dispatched order to view its live tracking timeline.</p>
      </div>

      <Card padding={false}>
        <CardHeader title="Trackable Orders" />
        <div className="p-4">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : trackable.length === 0 ? (
            <EmptyState icon="timeline" title="Nothing to track yet" description="Orders become trackable after staff assigns a shipment." />
          ) : (
            <ul className="space-y-3">
              {trackable.map(order => (
                <li key={order.id} className="rounded-md border border-[#B7D9E5] bg-[#ffffff] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#183446]">{order.id.toUpperCase()}</span>
                      <StatusBadge type="order" status={order.status} />
                    </div>
                    <p className="text-sm font-semibold text-[#183446]">{order.origin} to {order.destination}</p>
                    <p className="text-xs text-[#4B7084]">{order.totalWeightKg}kg · {order.isPaid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                  <Link to={`/customer/orders/${order.id}/tracking`}>
                    <Button size="sm" variant="secondary">Open Timeline</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
