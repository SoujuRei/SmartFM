import React from 'react';
import { type Order } from '../../../mocks/db';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { CARGO_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../../../constants/enums';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}

export function PaymentModal({ order, isOpen, onClose, onConfirm, isLoading }: PaymentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Payment"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={onConfirm} isLoading={isLoading}>
            Confirm Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-[#f2f3ff] rounded-md p-4 space-y-2">
          <Row label="Order ID" value={<span className="font-mono text-xs">{order.id.toUpperCase()}</span>} />
          <Row label="Route" value={`${order.origin} to ${order.destination}`} />
          <Row label="Cargo" value={`${order.cargoItems.map(item => CARGO_TYPE_LABELS[item.cargoType]).join(', ')} · ${order.totalWeightKg}kg`} />
          <Row label="Dimensions" value={order.cargoItems.map(item => `${item.dimensions.lengthCm}x${item.dimensions.widthCm}x${item.dimensions.heightCm}cm`).join(', ')} />
          <Row label="Payment Method" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-[#faf8ff] rounded-md border border-[#c3c6d7]">
          <span className="text-sm font-semibold text-[#131b2e]">Total Amount</span>
          <span className="font-mono text-xl font-bold text-[#131b2e]">{formatCurrency(order.totalAmount)}</span>
        </div>
        <p className="text-xs text-[#737686] text-center">
          By confirming, you authorize the payment of {formatCurrency(order.totalAmount)} for this shipment order.
        </p>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#505f76]">{label}</span>
      <span className="font-medium text-[#131b2e] text-right">{value}</span>
    </div>
  );
}
