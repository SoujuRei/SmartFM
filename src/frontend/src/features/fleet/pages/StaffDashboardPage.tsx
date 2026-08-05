import React, { useState } from 'react';
import { useOrders } from '../../orders/hooks';
import { useAvailableVehicles, useDrivers, useDispatchShipment } from '../hooks';
import { useShipments } from '../../shipments/hooks';
import { CARGO_TYPE_LABELS, OrderStatus, PAYMENT_METHOD_LABELS, ShipmentStatus } from '../../../constants/enums';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { getCustomerName, type Order } from '../../../mocks/db';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}

function dimensions(order: Order) {
  return order.cargoItems
    .map(item => `${item.dimensions.lengthCm}x${item.dimensions.widthCm}x${item.dimensions.heightCm}cm`)
    .join(', ');
}

export function StaffDashboardPage() {
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const { data: shipments, isLoading: loadingShipments } = useShipments();
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  const processingOrders = orders?.filter(o => o.status === OrderStatus.PROCESSING) ?? [];
  const activeShipments = (shipments ?? []).filter((s: any) =>
    [ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED].includes(s.status),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-[#183446]">Staff Dispatch Dashboard</h2>
        <p className="text-sm text-[#4B7084]">Assign paid orders to available fleet capacity and monitor shipment records.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card padding={false}>
          <CardHeader
            title="Awaiting Dispatch"
            action={<span className="font-mono text-xs text-[#4B7084]">{processingOrders.length} ORDERS</span>}
          />
          <div className="p-4">
            {loadingOrders ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : processingOrders.length === 0 ? (
              <EmptyState icon="assignment_turned_in" title="No paid orders waiting" description="Processing orders will appear here after payment." />
            ) : (
              <ul className="space-y-3">
                {processingOrders.map(order => (
                  <li key={order.id} className="p-4 rounded-md border border-[#B7D9E5] bg-[#F1F9FC]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-[#183446]">{order.id.toUpperCase()}</span>
                          <StatusBadge type="order" status={order.status} />
                          <span className="text-xs text-[#4B7084]">{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#183446]">{order.origin} to {order.destination}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#4B7084]">
                          <p>Customer: <span className="font-medium text-[#183446]">{getCustomerName(order.customerId) || order.customerId}</span></p>
                          <p>Weight: <span className="font-medium text-[#183446]">{order.totalWeightKg ?? 0}kg</span></p>
                          <p>Cargo: <span className="font-medium text-[#183446]">{order.cargoItems.map(item => CARGO_TYPE_LABELS[item.cargoType]).join(', ')}</span></p>
                          <p>Dimensions: <span className="font-medium text-[#183446]">{dimensions(order)}</span></p>
                          <p>Payment: <span className="font-medium text-[#183446]">{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? 'Unknown'}</span></p>
                          <p>Total: <span className="font-medium text-[#183446]">{formatCurrency(order.totalAmount)}</span></p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setAssigningOrder(order)}>Assign</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card padding={false}>
          <CardHeader
            title="Active Shipments"
            action={<span className="font-mono text-xs text-[#4B7084]">{activeShipments.length} SHIPMENTS</span>}
          />
          <div className="p-4">
            {loadingShipments ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : activeShipments.length === 0 ? (
              <EmptyState icon="local_shipping" title="No active shipments" description="Assigned shipment records will appear here." />
            ) : (
              <ul className="space-y-3">
                {activeShipments.map((shipment: any) => (
                  <li key={shipment.id ?? shipment.shipmentId} className="p-4 rounded-md border border-[#B7D9E5] bg-[#ffffff]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-[#183446]">{(shipment.id ?? shipment.shipmentId ?? '').toUpperCase()}</span>
                          <StatusBadge type="shipment" status={shipment.status} />
                          <span className="font-mono text-[11px] text-[#6A95A7]">{(shipment.orderId ?? shipment.order?.orderId ?? '').toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#183446]">{shipment.order?.origin} to {shipment.order?.destination}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#4B7084]">
                          <p>Customer: <span className="font-medium text-[#183446]">{shipment.order ? getCustomerName(shipment.order.customerId) : '-'}</span></p>
                          <p>Weight: <span className="font-medium text-[#183446]">{shipment.order?.totalWeightKg}kg</span></p>
                          <p>Dimensions: <span className="font-medium text-[#183446]">{shipment.order ? dimensions(shipment.order) : '-'}</span></p>
                          <p>Total: <span className="font-medium text-[#183446]">{formatCurrency(shipment.order?.totalAmount ?? 0)}</span></p>
                          <p>Vehicle: <span className="font-medium text-[#183446]">{shipment.vehicle?.plateNumber}</span></p>
                          <p>Driver: <span className="font-medium text-[#183446]">{shipment.driver?.name}</span></p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {assigningOrder && (
        <AssignModal
          order={assigningOrder}
          isOpen={!!assigningOrder}
          onClose={() => setAssigningOrder(null)}
        />
      )}
    </div>
  );
}

function AssignModal({ order, isOpen, onClose }: { order: Order; isOpen: boolean; onClose: () => void }) {
  const { data: vehicles, isLoading: loadingVehicles } = useAvailableVehicles(order.totalWeightKg);
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const dispatchMutation = useDispatchShipment();
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');

  const handleAssign = async () => {
    if (!vehicleId || !driverId) return;
    await dispatchMutation.mutateAsync({ orderId: order.id, vehicleId, driverId });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign ${order.id.toUpperCase()}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={dispatchMutation.isPending}>Cancel</Button>
          <Button onClick={handleAssign} isLoading={dispatchMutation.isPending} disabled={!vehicleId || !driverId}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-[#B7D9E5] bg-[#F1F9FC] p-3 text-sm">
          <p className="font-semibold text-[#183446]">{order.origin} to {order.destination}</p>
          <p className="text-xs text-[#4B7084]">{order.totalWeightKg}kg required capacity · {formatCurrency(order.totalAmount)} · {dimensions(order)}</p>
        </div>

        <Select label="Available Vehicle" value={vehicleId} onChange={e => setVehicleId(e.target.value)} disabled={loadingVehicles}>
          <option value="">Choose vehicle with enough capacity</option>
          {vehicles?.map(v => (
            <option key={v.id} value={v.id}>{v.plateNumber} · {v.type} · {v.capacityKg}kg</option>
          ))}
        </Select>

        <Select label="Available Driver" value={driverId} onChange={e => setDriverId(e.target.value)} disabled={loadingDrivers}>
          <option value="">Choose available driver</option>
          {drivers?.map(d => (
            <option key={d.id} value={d.id}>{d.name} · {d.licenseNumber} · {d.phone}</option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
