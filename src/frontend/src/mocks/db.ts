import { UserRole, OrderStatus, ShipmentStatus, CargoType, PaymentMethod } from '../constants/enums';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const users: User[] = [
  { id: 'usr-001', name: 'Alice Customer', email: 'customer@demo.com', password: 'password', role: UserRole.CUSTOMER },
  { id: 'usr-002', name: 'Bob Staff', email: 'staff@demo.com', password: 'password', role: UserRole.STAFF },
  { id: 'usr-003', name: 'Charlie Driver', email: 'driver@demo.com', password: 'password', role: UserRole.DRIVER },
  { id: 'usr-004', name: 'Diana Admin', email: 'admin@demo.com', password: 'password', role: UserRole.ADMIN },
];

export interface CargoItem {
  id: string;
  description: string;
  cargoType: CargoType;
  weightKg: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ASSIGNED';
}

export const drivers: Driver[] = [
  { id: 'drv-001', userId: 'usr-003', name: 'Charlie Driver', phone: '+61 400 123 456', licenseNumber: 'DL-VIC-2021', status: 'ASSIGNED' },
  { id: 'drv-002', userId: 'usr-005', name: 'David Trucker', phone: '+61 400 234 567', licenseNumber: 'DL-NSW-2020', status: 'AVAILABLE' },
  { id: 'drv-003', userId: 'usr-006', name: 'Emma Roads', phone: '+61 400 345 678', licenseNumber: 'DL-QLD-2022', status: 'AVAILABLE' },
];

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacityKg: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  currentLocation: string;
}

export const vehicles: Vehicle[] = [
  { id: 'veh-001', plateNumber: 'VIC-123-AA', type: 'Light Van', capacityKg: 800, status: 'AVAILABLE', currentLocation: 'Melbourne Depot' },
  { id: 'veh-002', plateNumber: 'VIC-456-BB', type: 'Medium Truck', capacityKg: 3000, status: 'IN_USE', currentLocation: 'Sydney Depot' },
  { id: 'veh-003', plateNumber: 'VIC-789-CC', type: 'Heavy Truck', capacityKg: 10000, status: 'AVAILABLE', currentLocation: 'Brisbane Depot' },
  { id: 'veh-004', plateNumber: 'VIC-012-DD', type: 'Refrigerated Van', capacityKg: 1200, status: 'IN_USE', currentLocation: 'Adelaide' },
  { id: 'veh-005', plateNumber: 'VIC-345-EE', type: 'Flatbed Truck', capacityKg: 8000, status: 'MAINTENANCE', currentLocation: 'Melbourne Depot' },
];

export interface Order {
  id: string;
  customerId: string;
  origin: string;
  destination: string;
  cargoItems: CargoItem[];
  totalWeightKg: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

function cargo(id: string, description: string, cargoType: CargoType, weightKg: number, dimensions: CargoItem['dimensions']): CargoItem {
  return { id, description, cargoType, weightKg, dimensions };
}

function totalWeight(items: CargoItem[]) {
  return items.reduce((sum, item) => sum + item.weightKg, 0);
}

function orderTotal(weightKg: number) {
  return parseFloat((weightKg * 3.5 + 50).toFixed(2));
}

const ord1Cargo = [cargo('cgi-001', 'Retail cartons', CargoType.STANDARD, 50, { lengthCm: 60, widthCm: 45, heightCm: 40 })];
const ord2Cargo = [cargo('cgi-002', 'Glassware crates', CargoType.FRAGILE, 20, { lengthCm: 50, widthCm: 40, heightCm: 35 })];
const ord3Cargo = [cargo('cgi-003', 'Cleaning chemicals', CargoType.HAZARDOUS, 100, { lengthCm: 90, widthCm: 60, heightCm: 55 })];
const ord4Cargo = [cargo('cgi-004', 'Chilled produce', CargoType.REFRIGERATED, 75, { lengthCm: 80, widthCm: 50, heightCm: 45 })];
const ord5Cargo = [cargo('cgi-005', 'Office equipment', CargoType.STANDARD, 30, { lengthCm: 55, widthCm: 45, heightCm: 30 })];
const ord6Cargo = [cargo('cgi-006', 'Small parcel', CargoType.STANDARD, 10, { lengthCm: 30, widthCm: 25, heightCm: 20 })];
const ord7Cargo = [cargo('cgi-007', 'Medical devices', CargoType.FRAGILE, 40, { lengthCm: 70, widthCm: 45, heightCm: 35 })];
const ord8Cargo = [
  cargo('cgi-008', 'Industrial drums', CargoType.HAZARDOUS, 140, { lengthCm: 100, widthCm: 80, heightCm: 90 }),
  cargo('cgi-009', 'Spare parts pallet', CargoType.STANDARD, 60, { lengthCm: 120, widthCm: 100, heightCm: 80 }),
];

export let orders: Order[] = [
  { id: 'ord-001', customerId: 'usr-001', origin: 'Melbourne, VIC', destination: 'Sydney, NSW', cargoItems: ord1Cargo, totalWeightKg: totalWeight(ord1Cargo), paymentMethod: PaymentMethod.CREDIT_CARD, status: OrderStatus.DISPATCHED, totalAmount: 285.00, isPaid: true, createdAt: '2026-07-28T08:00:00Z', updatedAt: '2026-07-30T10:00:00Z' },
  { id: 'ord-002', customerId: 'usr-001', origin: 'Sydney, NSW', destination: 'Brisbane, QLD', cargoItems: ord2Cargo, totalWeightKg: totalWeight(ord2Cargo), paymentMethod: PaymentMethod.BANK_TRANSFER, status: OrderStatus.DELIVERED, totalAmount: 195.50, isPaid: true, createdAt: '2026-07-20T09:00:00Z', updatedAt: '2026-07-24T14:00:00Z' },
  { id: 'ord-003', customerId: 'usr-001', origin: 'Melbourne, VIC', destination: 'Adelaide, SA', cargoItems: ord3Cargo, totalWeightKg: totalWeight(ord3Cargo), paymentMethod: PaymentMethod.CREDIT_CARD, status: OrderStatus.PROCESSING, totalAmount: 520.00, isPaid: true, createdAt: '2026-08-01T07:30:00Z', updatedAt: '2026-08-02T09:00:00Z' },
  { id: 'ord-004', customerId: 'usr-001', origin: 'Perth, WA', destination: 'Melbourne, VIC', cargoItems: ord4Cargo, totalWeightKg: totalWeight(ord4Cargo), paymentMethod: PaymentMethod.CASH_ON_DELIVERY, status: OrderStatus.PENDING, totalAmount: 680.00, isPaid: false, createdAt: '2026-08-04T11:00:00Z', updatedAt: '2026-08-04T11:00:00Z' },
  { id: 'ord-005', customerId: 'usr-001', origin: 'Sydney, NSW', destination: 'Melbourne, VIC', cargoItems: ord5Cargo, totalWeightKg: totalWeight(ord5Cargo), paymentMethod: PaymentMethod.CREDIT_CARD, status: OrderStatus.DISPATCHED, totalAmount: 175.00, isPaid: true, createdAt: '2026-08-03T13:00:00Z', updatedAt: '2026-08-04T08:00:00Z' },
  { id: 'ord-006', customerId: 'usr-001', origin: 'Brisbane, QLD', destination: 'Gold Coast, QLD', cargoItems: ord6Cargo, totalWeightKg: totalWeight(ord6Cargo), paymentMethod: PaymentMethod.BANK_TRANSFER, status: OrderStatus.CANCELLED, totalAmount: 95.00, isPaid: false, createdAt: '2026-07-15T10:00:00Z', updatedAt: '2026-07-15T14:00:00Z' },
  { id: 'ord-007', customerId: 'usr-001', origin: 'Canberra, ACT', destination: 'Sydney, NSW', cargoItems: ord7Cargo, totalWeightKg: totalWeight(ord7Cargo), paymentMethod: PaymentMethod.CREDIT_CARD, status: OrderStatus.PROCESSING, totalAmount: 245.00, isPaid: true, createdAt: '2026-08-04T14:00:00Z', updatedAt: '2026-08-04T14:00:00Z' },
  { id: 'ord-008', customerId: 'usr-001', origin: 'Darwin, NT', destination: 'Adelaide, SA', cargoItems: ord8Cargo, totalWeightKg: totalWeight(ord8Cargo), paymentMethod: PaymentMethod.BANK_TRANSFER, status: OrderStatus.PROCESSING, totalAmount: 1200.00, isPaid: true, createdAt: '2026-08-05T06:00:00Z', updatedAt: '2026-08-05T06:00:00Z' },
];

export interface Shipment {
  id: string;
  orderId: string;
  vehicleId: string;
  driverId: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export let shipments: Shipment[] = [
  { id: 'shp-001', orderId: 'ord-001', vehicleId: 'veh-002', driverId: 'drv-001', status: ShipmentStatus.IN_TRANSIT, estimatedDelivery: '2026-08-06T18:00:00Z', createdAt: '2026-07-30T10:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 'shp-002', orderId: 'ord-002', vehicleId: 'veh-001', driverId: 'drv-002', status: ShipmentStatus.DELIVERED, estimatedDelivery: '2026-07-24T18:00:00Z', createdAt: '2026-07-21T09:00:00Z', updatedAt: '2026-07-24T14:00:00Z' },
  { id: 'shp-003', orderId: 'ord-005', vehicleId: 'veh-004', driverId: 'drv-001', status: ShipmentStatus.ASSIGNED, estimatedDelivery: '2026-08-07T18:00:00Z', createdAt: '2026-08-04T08:00:00Z', updatedAt: '2026-08-04T08:00:00Z' },
];

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  orderId: string;
  location: string;
  note: string;
  timestamp: string;
}

export let trackingEvents: TrackingEvent[] = [
  { id: 'trk-001', shipmentId: 'shp-001', orderId: 'ord-001', location: 'Melbourne Depot', note: 'Package picked up from origin.', timestamp: '2026-07-30T10:30:00Z' },
  { id: 'trk-002', shipmentId: 'shp-001', orderId: 'ord-001', location: 'Albury, NSW', note: 'Crossed state border.', timestamp: '2026-07-31T14:00:00Z' },
  { id: 'trk-003', shipmentId: 'shp-001', orderId: 'ord-001', location: 'Sydney Sorting Hub', note: 'Arrived at sorting facility.', timestamp: '2026-08-01T08:00:00Z' },
  { id: 'trk-004', shipmentId: 'shp-002', orderId: 'ord-002', location: 'Sydney Depot', note: 'Picked up.', timestamp: '2026-07-21T09:30:00Z' },
  { id: 'trk-005', shipmentId: 'shp-002', orderId: 'ord-002', location: 'Brisbane, QLD', note: 'Delivered to recipient.', timestamp: '2026-07-24T14:00:00Z' },
];

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'PAID' | 'PENDING';
  paidAt: string | null;
}

export let payments: Payment[] = [
  { id: 'pay-001', orderId: 'ord-001', amount: 285.00, method: PaymentMethod.CREDIT_CARD, status: 'PAID', paidAt: '2026-07-28T08:05:00Z' },
  { id: 'pay-002', orderId: 'ord-002', amount: 195.50, method: PaymentMethod.BANK_TRANSFER, status: 'PAID', paidAt: '2026-07-20T09:10:00Z' },
  { id: 'pay-003', orderId: 'ord-003', amount: 520.00, method: PaymentMethod.CREDIT_CARD, status: 'PAID', paidAt: '2026-08-01T07:35:00Z' },
  { id: 'pay-005', orderId: 'ord-005', amount: 175.00, method: PaymentMethod.CREDIT_CARD, status: 'PAID', paidAt: '2026-08-03T13:05:00Z' },
];

export function getCustomerName(customerId: string) {
  return users.find(user => user.id === customerId)?.name ?? 'Unknown customer';
}

export function calculateOrderTotal(weightKg: number) {
  return orderTotal(weightKg);
}
