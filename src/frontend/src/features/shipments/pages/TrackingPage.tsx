import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderTracking } from '../../orders/hooks';
import { type OrderStatus as OS } from '../../../constants/enums';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Spinner } from '../../../components/ui/Spinner';
import { Card } from '../../../components/ui/Card';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function TrackingPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const { data, isLoading, isError } = useOrderTracking(orderId);

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-5xl text-[#c3c6d7]">error</span>
        <p className="text-[#505f76]">Could not load tracking information.</p>
        <Link to="/customer" className="text-[#1d4ed8] text-sm hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  const { order, shipment, events } = data as {
    order: { id: string; origin: string; destination: string; status: OS };
    shipment: { id?: string; status?: string; estimatedDelivery?: string } | null;
    events: Array<{ id: string; location: string; note: string; timestamp: string }>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/customer"
          className="text-[#505f76] hover:text-[#131b2e] hover:bg-[#f2f3ff] rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold text-[#131b2e]">Track Shipment</h2>
          <p className="text-sm text-[#505f76]">
            Order <span className="font-mono font-medium">{order?.id?.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[#505f76] mb-1">Route</p>
            <p className="font-semibold text-[#131b2e] text-sm">
              {order?.origin} to {order?.destination}
            </p>
          </div>
          <StatusBadge type="order" status={order?.status} />
        </div>
        {shipment && (shipment as { estimatedDelivery?: string }).estimatedDelivery && (
          <div className="bg-[#f2f3ff] rounded-md px-3 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563eb] text-base">schedule</span>
            <div>
              <p className="text-[11px] text-[#505f76]">Estimated Delivery</p>
              <p className="text-xs font-semibold text-[#131b2e]">
                {formatDateTime((shipment as { estimatedDelivery: string }).estimatedDelivery)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="font-display text-lg font-semibold text-[#131b2e] mb-5">Tracking History</h3>
        {!events.length ? (
          <p className="text-sm text-[#505f76] text-center py-6">No tracking updates yet.</p>
        ) : (
          <ol className="relative">
            {events.map((event, idx) => (
              <li key={event.id} className="flex gap-4 pb-6 last:pb-0">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div className={[
                    'w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0',
                    idx === 0
                      ? 'bg-[#2563eb] border-[#2563eb]'
                      : 'bg-[#ffffff] border-[#c3c6d7]',
                  ].join(' ')} />
                  {idx < events.length - 1 && (
                    <div className="w-0.5 bg-[#c3c6d7] flex-1 mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#131b2e] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#2563eb]">location_on</span>
                        {event.location}
                      </p>
                      <p className="text-xs text-[#505f76] mt-1">{event.note}</p>
                    </div>
                    <p className="text-[11px] text-[#737686] whitespace-nowrap flex-shrink-0">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
