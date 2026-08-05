-- ============================================================
-- USERS
-- Passwords are PLAINTEXT.
-- Run your bcrypt migration script afterwards.
-- ============================================================

DO $$
DECLARE
    customer_id UUID := uuid_generate_v4();
    staff_id UUID := uuid_generate_v4();

    driver1_id UUID := uuid_generate_v4();
    driver2_id UUID := uuid_generate_v4();
    driver3_id UUID := uuid_generate_v4();
BEGIN

---------------------------------------------------------------
-- CUSTOMER
---------------------------------------------------------------

INSERT INTO users(id,email,password,name,role)
VALUES (
    customer_id,
    'customer@test.com',
    'customer123',
    'John Customer',
    'CUSTOMER'
);

INSERT INTO customers(user_id,phone,address)
VALUES (
    customer_id,
    '0400000001',
    '123 Swanston Street, Melbourne'
);

---------------------------------------------------------------
-- STAFF
---------------------------------------------------------------

INSERT INTO users(id,email,password,name,role)
VALUES (
    staff_id,
    'staff@test.com',
    'staff123',
    'Sarah Staff',
    'STAFF'
);

INSERT INTO staff(user_id,staff_id)
VALUES (
    staff_id,
    'STF001'
);

---------------------------------------------------------------
-- DRIVER 1
---------------------------------------------------------------

INSERT INTO users(id,email,password,name,role)
VALUES (
    driver1_id,
    'driver1@test.com',
    'driver123',
    'David Driver',
    'DRIVER'
);

INSERT INTO drivers(user_id,license_number,is_available)
VALUES (
    driver1_id,
    'DRV-1001',
    TRUE
);

---------------------------------------------------------------
-- DRIVER 2
---------------------------------------------------------------

INSERT INTO users(id,email,password,name,role)
VALUES (
    driver2_id,
    'driver2@test.com',
    'driver123',
    'Emily Driver',
    'DRIVER'
);

INSERT INTO drivers(user_id,license_number,is_available)
VALUES (
    driver2_id,
    'DRV-1002',
    TRUE
);

---------------------------------------------------------------
-- DRIVER 3
---------------------------------------------------------------

INSERT INTO users(id,email,password,name,role)
VALUES (
    driver3_id,
    'driver3@test.com',
    'driver123',
    'Michael Driver',
    'DRIVER'
);

INSERT INTO drivers(user_id,license_number,is_available)
VALUES (
    driver3_id,
    'DRV-1003',
    FALSE
);

---------------------------------------------------------------
-- VEHICLES
---------------------------------------------------------------

INSERT INTO vehicles
(
    registration,
    capacity_weight,
    is_available,
    type,
    current_location
)
VALUES

('ABC-101',1000,TRUE ,'Van','Melbourne'),
('ABC-202',2500,TRUE ,'Truck','Melbourne'),
('ABC-303',5000,TRUE ,'Semi Trailer','Sydney'),
('ABC-404',750 ,TRUE ,'Utility','Geelong'),
('ABC-505',1200,FALSE,'Van','Maintenance');

END $$;