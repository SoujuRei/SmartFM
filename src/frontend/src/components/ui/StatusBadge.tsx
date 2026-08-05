import React from 'react';
import { type OrderStatus, type ShipmentStatus, ORDER_STATUS_META, SHIPMENT_STATUS_META } from '../../constants/enums';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span
      className={[
        'inline-flex items-center border bg-transparent px-2.5 py-1',
        'font-mono text-[10px] font-semibold uppercase tracking-[0.22em]',
        'shadow-[1px_1px_0_rgba(31,27,23,0.18)]',
        meta.className,
      ].join(' ')}
    >
      {meta.label.toUpperCase()}
    </span>
  );
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  const meta = SHIPMENT_STATUS_META[status];
  return (
    <span
      className={[
        'inline-flex items-center border bg-transparent px-2.5 py-1',
        'font-mono text-[10px] font-semibold uppercase tracking-[0.22em]',
        'shadow-[1px_1px_0_rgba(31,27,23,0.18)]',
        meta.className,
      ].join(' ')}
    >
      {meta.label.toUpperCase()}
    </span>
  );
}

// Generic StatusBadge that accepts either type
type StatusBadgeProps =
  | { type: 'order'; status: OrderStatus }
  | { type: 'shipment'; status: ShipmentStatus };

export function StatusBadge(props: StatusBadgeProps) {
  if (props.type === 'order') {
    return <OrderStatusBadge status={props.status} />;
  }
  return <ShipmentStatusBadge status={props.status} />;
}
