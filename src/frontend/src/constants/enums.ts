// ─── User Roles ───────────────────────────────────────────────────────────────
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
}

// ─── Order Status ──────────────────────────────────────────────────────────────
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// ─── Shipment Status ───────────────────────────────────────────────────────────
export enum ShipmentStatus {
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  DELAYED = 'DELAYED',
}

// ─── Cargo Types ───────────────────────────────────────────────────────────────
export enum CargoType {
  STANDARD = 'STANDARD',
  FRAGILE = 'FRAGILE',
  HAZARDOUS = 'HAZARDOUS',
  REFRIGERATED = 'REFRIGERATED',
}

// ─── Payment Methods ───────────────────────────────────────────────────────────
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

// ─── Role → Home Route ─────────────────────────────────────────────────────────
export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: '/customer',
  [UserRole.STAFF]: '/staff',
  [UserRole.ADMIN]: '/staff',
  [UserRole.DRIVER]: '/driver',
};

// ─── Order Status Metadata ─────────────────────────────────────────────────────
export interface StatusMeta {
  label: string;
  className: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    className: 'border-[#9a5a16] text-[#022F40]',
  },
  [OrderStatus.PROCESSING]: {
    label: 'Processing',
    className: 'border-[#046E8F] text-[#4B7084]',
  },
  [OrderStatus.DISPATCHED]: {
    label: 'Dispatched',
    className: 'border-[#0090C1] text-[#022F40]',
  },
  [OrderStatus.DELIVERED]: {
    label: 'Delivered',
    className: 'border-[#059669] text-[#214737]',
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'border-[#ba1a1a] text-[#93000a]',
  },
};

// ─── Shipment Status Metadata ──────────────────────────────────────────────────
export const SHIPMENT_STATUS_META: Record<ShipmentStatus, StatusMeta> = {
  [ShipmentStatus.ASSIGNED]: {
    label: 'Assigned',
    className: 'border-[#38AECC] text-[#022F40]',
  },
  [ShipmentStatus.IN_TRANSIT]: {
    label: 'In Transit',
    className: 'border-[#0090C1] text-[#022F40]',
  },
  [ShipmentStatus.DELIVERED]: {
    label: 'Delivered',
    className: 'border-[#059669] text-[#214737]',
  },
  [ShipmentStatus.DELAYED]: {
    label: 'Delayed',
    className: 'border-[#ba1a1a] text-[#93000a]',
  },
};

// ─── Cargo Type Labels ─────────────────────────────────────────────────────────
export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  [CargoType.STANDARD]: 'Standard',
  [CargoType.FRAGILE]: 'Fragile',
  [CargoType.HAZARDOUS]: 'Hazardous',
  [CargoType.REFRIGERATED]: 'Refrigerated',
};

// ─── Payment Method Labels ─────────────────────────────────────────────────────
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
};
