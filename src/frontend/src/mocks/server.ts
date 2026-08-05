import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../api/axiosClient';
import {
  users, orders, shipments, trackingEvents, vehicles,
  drivers, payments, calculateOrderTotal,
  type CargoItem, type Order, type Shipment, type TrackingEvent, type Payment,
} from './db';
import { OrderStatus, ShipmentStatus } from '../constants/enums';

let mock: MockAdapter | null = null;

function enrichShipment(shipment: Shipment) {
  return {
    ...shipment,
    order: orders.find(o => o.id === shipment.orderId),
    vehicle: vehicles.find(v => v.id === shipment.vehicleId),
    driver: drivers.find(d => d.id === shipment.driverId),
  };
}

export function startMockServer() {
  if (mock) return;

  mock = new MockAdapter(axiosClient, { delayResponse: 250 });

  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return [401, { message: 'Invalid email or password.' }];
    const token = btoa(`${user.id}:${user.role}:${Date.now()}`);
    const { password: _pw, ...safeUser } = user;
    return [200, { access_token: token, user: safeUser }];
  });

  mock.onGet('/orders').reply((config) => {
    const customerId = config.params?.customerId;
    const filtered = customerId ? orders.filter(o => o.customerId === customerId) : orders;
    return [200, filtered];
  });

  mock.onPost('/orders').reply((config) => {
    const data = JSON.parse(config.data);
    const cargoItems = (data.cargoItems ?? []).map((item: Omit<CargoItem, 'id'>, index: number) => ({
      ...item,
      id: `cgi-${String(Date.now()).slice(-5)}-${index + 1}`,
    }));
    const totalWeightKg = cargoItems.reduce((sum: number, item: CargoItem) => sum + Number(item.weightKg), 0);
    const distanceKm = Number(data.distanceKm ?? 0);
    const newOrder: Order = {
      id: `ord-${String(orders.length + 1).padStart(3, '0')}`,
      customerId: data.customerId,
      origin: data.origin,
      destination: data.destination,
      distanceKm,
      cargoItems,
      totalWeightKg,
      paymentMethod: data.paymentMethod,
      status: OrderStatus.PENDING,
      totalAmount: calculateOrderTotal(cargoItems, distanceKm),
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    return [201, newOrder];
  });

  mock.onPost(/\/orders\/([^/]+)\/pay/).reply((config) => {
    const orderId = config.url!.split('/')[2];
    const order = orders.find(o => o.id === orderId);
    if (!order) return [404, { message: 'Order not found.' }];
    if (order.status !== OrderStatus.PENDING) {
      return [409, { message: 'Order is not awaiting payment.' }];
    }
    const newPayment: Payment = {
      id: `pay-${String(payments.length + 1).padStart(3, '0')}`,
      orderId: order.id,
      amount: order.totalAmount,
      method: order.paymentMethod,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    order.isPaid = true;
    order.status = OrderStatus.PROCESSING;
    order.updatedAt = new Date().toISOString();
    return [200, newPayment];
  });

  mock.onPost(/\/orders\/([^/]+)\/cancel/).reply((config) => {
    const orderId = config.url!.split('/')[2];
    const order = orders.find(o => o.id === orderId);
    if (!order) return [404, { message: 'Order not found.' }];
    if (order.status === OrderStatus.DELIVERED) {
      return [400, { message: 'Cannot cancel an order that has already been delivered.' }];
    }
    if (order.status === OrderStatus.CANCELLED) {
      return [400, { message: 'Order is already cancelled.' }];
    }

    if (order.isPaid) {
      const refund: Payment = {
        id: `pay-${String(payments.length + 1).padStart(3, '0')}`,
        orderId: order.id,
        amount: -order.totalAmount,
        method: order.paymentMethod,
        status: 'REFUNDED',
        paidAt: new Date().toISOString(),
      };
      payments.push(refund);
      order.isPaid = false;
    }

    const shipment = shipments.find(s => s.orderId === order.id);
    if (shipment && shipment.status !== ShipmentStatus.DELIVERED) {
      const vehicle = vehicles.find(v => v.id === shipment.vehicleId);
      const driver = drivers.find(d => d.id === shipment.driverId);
      if (vehicle) vehicle.status = 'AVAILABLE';
      if (driver) driver.status = 'AVAILABLE';
      for (let i = trackingEvents.length - 1; i >= 0; i -= 1) {
        if (trackingEvents[i].shipmentId === shipment.id) trackingEvents.splice(i, 1);
      }
      const shipmentIndex = shipments.findIndex(s => s.id === shipment.id);
      if (shipmentIndex !== -1) shipments.splice(shipmentIndex, 1);
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date().toISOString();
    return [200, { message: 'Order cancelled successfully.' }];
  });

  mock.onDelete(/\/orders\/([^/]+)$/).reply((config) => {
    const orderId = config.url!.split('/')[2];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return [404, { message: 'Order not found.' }];

    const order = orders[orderIndex];
    if (order.status !== OrderStatus.CANCELLED) {
      return [400, { message: 'Only cancelled orders can be deleted.' }];
    }

    for (let i = payments.length - 1; i >= 0; i -= 1) {
      if (payments[i].orderId === orderId) payments.splice(i, 1);
    }
    const shipmentIndex = shipments.findIndex(s => s.orderId === orderId);
    if (shipmentIndex !== -1) {
      const shipment = shipments[shipmentIndex];
      for (let i = trackingEvents.length - 1; i >= 0; i -= 1) {
        if (trackingEvents[i].shipmentId === shipment.id) trackingEvents.splice(i, 1);
      }
      shipments.splice(shipmentIndex, 1);
    }
    orders.splice(orderIndex, 1);

    return [200, { message: 'Order deleted successfully.' }];
  });

  mock.onGet(/\/orders\/([^/]+)$/).reply((config) => {
    const id = config.url!.split('/').pop()!;
    const order = orders.find(o => o.id === id);
    if (!order) return [404, { message: 'Order not found.' }];
    return [200, order];
  });

  mock.onGet(/\/orders\/([^/]+)\/tracking/).reply((config) => {
    const orderId = config.url!.split('/')[2];
    const events = trackingEvents
      .filter(t => t.orderId === orderId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const shipment = shipments.find(s => s.orderId === orderId);
    const order = orders.find(o => o.id === orderId);
    return [200, { order, shipment: shipment ? enrichShipment(shipment) : null, events }];
  });

  mock.onPost('/payments').reply((config) => {
    const data = JSON.parse(config.data);
    const order = orders.find(o => o.id === data.orderId);
    if (!order) return [404, { message: 'Order not found.' }];
    if (order.status !== OrderStatus.PENDING) {
      return [409, { message: 'Order is not awaiting payment.' }];
    }
    const newPayment: Payment = {
      id: `pay-${String(payments.length + 1).padStart(3, '0')}`,
      orderId: data.orderId,
      amount: order.totalAmount,
      method: order.paymentMethod,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    order.isPaid = true;
    order.status = OrderStatus.PROCESSING;
    order.updatedAt = new Date().toISOString();
    return [201, newPayment];
  });

  mock.onGet('/fleet/vehicles/available').reply((config) => {
    const minCapacity = parseFloat(config.params?.minCapacity ?? '0');
    return [200, vehicles.filter(v => v.status === 'AVAILABLE' && v.capacityKg >= minCapacity)];
  });

  mock.onGet('/drivers').reply(() => {
    return [200, drivers.filter(driver => driver.status === 'AVAILABLE')];
  });

  mock.onGet('/shipments').reply((config) => {
    const driverUserId = config.params?.driverId;
    const filtered = driverUserId
      ? shipments.filter(s => drivers.find(d => d.id === s.driverId)?.userId === driverUserId || s.driverId === driverUserId)
      : shipments;
    return [200, filtered.map(enrichShipment)];
  });

  mock.onPost('/shipments').reply((config) => {
    const data = JSON.parse(config.data);
    const order = orders.find(o => o.id === data.orderId);
    const vehicle = vehicles.find(v => v.id === data.vehicleId);
    const driver = drivers.find(d => d.id === data.driverId);

    if (!order) return [404, { message: 'Order not found.' }];
    if (order.status !== OrderStatus.PROCESSING) return [409, { message: 'Only processing orders can be assigned.' }];
    if (!vehicle || vehicle.status !== 'AVAILABLE' || vehicle.capacityKg < order.totalWeightKg) {
      return [409, { message: 'Vehicle is not available for this cargo weight.' }];
    }
    if (!driver || driver.status !== 'AVAILABLE') return [409, { message: 'Driver is not available.' }];

    const newShipment: Shipment = {
      id: `shp-${String(shipments.length + 1).padStart(3, '0')}`,
      orderId: data.orderId,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      status: ShipmentStatus.ASSIGNED,
      estimatedDelivery: data.estimatedDelivery ?? new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    shipments.push(newShipment);
    order.status = OrderStatus.SHIPPED;
    order.updatedAt = new Date().toISOString();
    vehicle.status = 'IN_USE';
    driver.status = 'ASSIGNED';

    const initEvent: TrackingEvent = {
      id: `trk-${String(trackingEvents.length + 1).padStart(3, '0')}`,
      shipmentId: newShipment.id,
      orderId: data.orderId,
      location: vehicle.currentLocation,
      note: `Shipment assigned to ${driver.name}.`,
      timestamp: new Date().toISOString(),
    };
    trackingEvents.push(initEvent);

    return [201, enrichShipment(newShipment)];
  });

  mock.onPatch(/\/shipments\/([^/]+)\/status/).reply((config) => {
    const id = config.url!.split('/')[2];
    const { status, location, description } = JSON.parse(config.data);
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return [404, { message: 'Shipment not found.' }];
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();

    const order = orders.find(o => o.id === shipment.orderId);
    const vehicle = vehicles.find(v => v.id === shipment.vehicleId);
    const driver = drivers.find(d => d.id === shipment.driverId);

    if (order && status === ShipmentStatus.DELIVERED) {
      order.status = OrderStatus.DELIVERED;
      order.updatedAt = new Date().toISOString();
      if (vehicle) vehicle.status = 'AVAILABLE';
      if (driver) driver.status = 'AVAILABLE';
    }

    const eventLocation = location || order?.destination || 'Unknown location';
    const eventNote = description || `Shipment status changed to ${status}`;
    const newEvent: TrackingEvent = {
      id: `trk-${String(trackingEvents.length + 1).padStart(3, '0')}`,
      shipmentId: id,
      orderId: shipment.orderId,
      location: eventLocation,
      note: eventNote,
      timestamp: new Date().toISOString(),
    };
    trackingEvents.push(newEvent);

    return [200, enrichShipment(shipment)];
  });

  mock.onPost(/\/shipments\/([^/]+)\/tracking/).reply((config) => {
    const id = config.url!.split('/')[2];
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return [404, { message: 'Shipment not found.' }];
    const data = JSON.parse(config.data);
    const newEvent: TrackingEvent = {
      id: `trk-${String(trackingEvents.length + 1).padStart(3, '0')}`,
      shipmentId: id,
      orderId: shipment.orderId,
      location: data.location,
      note: data.note,
      timestamp: new Date().toISOString(),
    };
    trackingEvents.push(newEvent);
    return [201, newEvent];
  });

  mock.onGet('/reports/revenue').reply((config) => {
    const startDate = config.params?.startDate;
    const endDate = config.params?.endDate;
    let filteredOrders = orders;
    if (startDate) filteredOrders = filteredOrders.filter(o => o.createdAt >= startDate);
    if (endDate) filteredOrders = filteredOrders.filter(o => o.createdAt <= `${endDate}T23:59:59Z`);

    const paidPayments = payments.filter(p =>
      filteredOrders.some(o => o.id === p.orderId) && p.status === 'PAID',
    );
    const byStatus = Object.values(OrderStatus).reduce<Record<string, number>>((acc, status) => {
      acc[status] = filteredOrders.filter(o => o.status === status).length;
      return acc;
    }, {});
    const monthlyMap: Record<string, number> = {};
    for (const payment of paidPayments) {
      const key = new Date(payment.paidAt!).toLocaleString('en-AU', { month: 'short', year: 'numeric' });
      monthlyMap[key] = (monthlyMap[key] ?? 0) + payment.amount;
    }

    return [200, {
      totalRevenue: parseFloat(paidPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)),
      totalOrders: filteredOrders.length,
      deliveredOrders: filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      byStatus,
      monthly: Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })),
    }];
  });

  console.log('[MockServer] Started - all API endpoints are mocked.');
}
