import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDriverShipments, useUpdateShipmentStatus, useAddTracking } from '../hooks';
import { ShipmentStatus } from '../../../constants/enums';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { type Shipment } from '../../../mocks/db';

type EnrichedShipment = Shipment & {
  order?: {
    id: string;
    origin: string;
    destination: string;
    totalWeightKg: number;
    isPaid: boolean;
    cargoItems: Array<{ dimensions: { lengthCm: number; widthCm: number; heightCm: number } }>;
  };
  vehicle?: { plateNumber: string; type: string };
};

function dimensions(shipment: EnrichedShipment) {
  return shipment.order?.cargoItems
    .map(item => `${item.dimensions.lengthCm}x${item.dimensions.widthCm}x${item.dimensions.heightCm}cm`)
    .join(', ') ?? '-';
}

export function DriverDashboardPage() {
  const { loggedInUser } = useAuth();
  const { data: shipments, isLoading } = useDriverShipments(loggedInUser?.id);
  const [selectedShipment, setSelectedShipment] = useState<EnrichedShipment | null>(null);

  const activeShipments = (shipments as EnrichedShipment[] | undefined)?.filter(s =>
    [ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED].includes(s.status),
  ) ?? [];
  const deliveredShipments = (shipments as EnrichedShipment[] | undefined)?.filter(s => s.status === ShipmentStatus.DELIVERED) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-[#183446]">My Shipments</h2>
        <p className="text-sm text-[#4B7084]">Update assigned shipment status and add tracking records.</p>
      </div>

      <Card padding={false}>
        <CardHeader title="Assigned Work" />
        <div className="p-4">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : activeShipments.length === 0 ? (
            <EmptyState icon="check_circle" title="No assigned shipments" description="New dispatches will appear here." />
          ) : (
            <ul className="space-y-4">
              {activeShipments.map(shipment => (
                <li key={shipment.shipmentId ?? shipment.id} className="p-4 rounded-md border border-[#B7D9E5] bg-[#ffffff]">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#183446]">{(shipment.shipmentId ?? shipment.id)?.toUpperCase()}</span>
                        <StatusBadge type="shipment" status={shipment.status} />
                        <span className="font-mono text-[11px] text-[#6A95A7]">{(shipment.order?.orderId ?? shipment.order?.id ?? '').toUpperCase()}</span>
                      </div>
                      <p className="font-semibold text-[#183446] text-sm">{shipment.order?.origin} to {shipment.order?.destination}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#4B7084]">
                        <p>Vehicle: <span className="font-medium text-[#183446]">{shipment.vehicle?.plateNumber} · {shipment.vehicle?.type}</span></p>
                        <p>Weight: <span className="font-medium text-[#183446]">{shipment.order?.totalWeightKg}kg</span></p>
                        <p>Dimensions: <span className="font-medium text-[#183446]">{dimensions(shipment)}</span></p>
                        <p>Payment: <span className="font-medium text-[#183446]">{shipment.order?.isPaid ? 'Paid' : 'Unpaid'}</span></p>
                      </div>
                    </div>
                    <Button className="w-full md:w-auto" onClick={() => setSelectedShipment(shipment)}>
                      Update
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {deliveredShipments.length > 0 && (
        <Card padding={false}>
          <CardHeader title="Delivered" />
          <div className="p-4">
            <ul className="divide-y divide-[#B7D9E5]">
              {deliveredShipments.map(shipment => (
                <li key={shipment.shipmentId ?? shipment.id} className="py-3 flex justify-between items-center gap-3">
                  <div>
                    <p className="font-mono text-xs text-[#183446]">{(shipment.shipmentId ?? shipment.id)?.toUpperCase()}</p>
                    <p className="text-sm font-medium text-[#4B7084]">{shipment.order?.destination}</p>
                  </div>
                  <StatusBadge type="shipment" status={shipment.status} />
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {selectedShipment && (
        <UpdateTrackingModal
          shipment={selectedShipment}
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}
    </div>
  );
}

function getNextStatus(status: ShipmentStatus) {
  if (status === ShipmentStatus.ASSIGNED) return ShipmentStatus.IN_TRANSIT;
  if (status === ShipmentStatus.IN_TRANSIT) return ShipmentStatus.DELIVERED;
  if (status === ShipmentStatus.DELAYED) return ShipmentStatus.IN_TRANSIT;
  return null;
}

function UpdateTrackingModal({ shipment, isOpen, onClose }: { shipment: EnrichedShipment; isOpen: boolean; onClose: () => void }) {
  const updateStatus = useUpdateShipmentStatus();
  const addTracking = useAddTracking();
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const nextStatus = getNextStatus(shipment.status);
  const isSubmitting = updateStatus.isPending || addTracking.isPending;

  const shipmentId = shipment.shipmentId ?? shipment.id;

  const handleSubmit = async () => {
    if (status !== shipment.status) {
      await updateStatus.mutateAsync({
        shipmentId,
        status,
        location: location.trim() || shipment.order?.destination || 'Unknown location',
        description: note.trim() || `Shipment status changed to ${status}`,
      });
    }
    if (location.trim() && note.trim()) {
      await addTracking.mutateAsync({ shipmentId, payload: { location, note } });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update ${shipment.id.toUpperCase()}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>Save Update</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#4B7084] uppercase tracking-wide block">Shipment Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus(shipment.status)}
              className={[
                'px-3 py-2 text-xs font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40',
                status === shipment.status ? 'bg-[#183446] text-[#ffffff] border-[#183446]' : 'bg-[#ffffff] text-[#4B7084] border-[#B7D9E5]',
              ].join(' ')}
            >
              Keep Current
            </button>
            {nextStatus && (
              <button
                type="button"
                onClick={() => setStatus(nextStatus)}
                className={[
                  'px-3 py-2 text-xs font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40',
                  status === nextStatus ? 'bg-[#183446] text-[#ffffff] border-[#183446]' : 'bg-[#ffffff] text-[#4B7084] border-[#B7D9E5]',
                ].join(' ')}
              >
                {nextStatus.replace('_', ' ')}
              </button>
            )}
            {shipment.status !== ShipmentStatus.DELIVERED && (
              <button
                type="button"
                onClick={() => setStatus(ShipmentStatus.DELAYED)}
                className={[
                  'px-3 py-2 text-xs font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0090C1]/40',
                  status === ShipmentStatus.DELAYED ? 'bg-[#183446] text-[#ffffff] border-[#183446]' : 'bg-[#ffffff] text-[#4B7084] border-[#B7D9E5]',
                ].join(' ')}
              >
                DELAYED
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#B7D9E5] space-y-4">
          <p className="text-sm font-semibold text-[#183446]">Tracking Record</p>
          <Input label="Current Location" placeholder="Albury Checkpoint" value={location} onChange={e => setLocation(e.target.value)} />
          <Input label="Note" placeholder="Crossed state border" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
