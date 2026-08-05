-- ============================================================
-- SmartFM Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Drop Existing Tables
-- ============================================================

DROP TABLE IF EXISTS tracking_records CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS cargo CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    phone TEXT NOT NULL,
    address TEXT NOT NULL
);

-- ============================================================
-- STAFF
-- ============================================================

CREATE TABLE staff (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    staff_id TEXT UNIQUE NOT NULL
);

-- ============================================================
-- DRIVERS
-- ============================================================

CREATE TABLE drivers (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    license_number TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- VEHICLES
-- ============================================================

CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration TEXT NOT NULL,
    capacity_weight NUMERIC NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    type TEXT,
    current_location TEXT
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    order_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'PENDING',
    total_amount NUMERIC DEFAULT 0,
    origin TEXT,
    destination TEXT,
    payment_method TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    total_weight_kg NUMERIC DEFAULT 0,
    distance_km DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================
-- CARGO
-- ============================================================

CREATE TABLE cargo (
    cargo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    description TEXT,
    cargo_type TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    dimensions TEXT NOT NULL
);

CREATE INDEX idx_cargo_order ON cargo(order_id);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id),
    amount NUMERIC NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    issue_date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id),
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    paid_at TIMESTAMP DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING'
);

-- ============================================================
-- SHIPMENTS
-- ============================================================

CREATE TABLE shipments (
    shipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id),
    vehicle_id UUID REFERENCES vehicles(vehicle_id),
    driver_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'DISPATCHED',
    estimated_delivery TIMESTAMP
);

-- ============================================================
-- TRACKING
-- ============================================================

CREATE TABLE tracking_records (
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(shipment_id),
    timestamp TIMESTAMP DEFAULT NOW(),
    current_location TEXT NOT NULL,
    description TEXT NOT NULL
);