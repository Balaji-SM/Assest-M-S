-- ==============================================================================
-- Enterprise Asset Management Platform - Supabase PostgreSQL Schema & Seed Data
-- Run this script in the Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'technician', 'employee')),
  avatar TEXT,
  department TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Terminated')),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Laptop', 'Desktop', 'Monitor', 'Mobile', 'Tablet',
    'Printer', 'Keyboard', 'Mouse', 'Networking', 'Server', 'Other'
  )),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_value NUMERIC(12, 2),
  warranty_expiry DATE,
  vendor TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Under Maintenance', 'Retired', 'Lost')),
  condition TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('New', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  assigned_date TIMESTAMPTZ,
  qr_code TEXT,
  notes TEXT,
  depreciation_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ASSET HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details TEXT,
  previous_state JSONB,
  new_state JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS public.maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id TEXT UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Preventive' CHECK (type IN ('Preventive', 'Corrective', 'Upgrade', 'Inspection')),
  title TEXT NOT NULL,
  description TEXT,
  cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  performed_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_employees_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_id ON public.assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON public.maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance(status);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON public.asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access via anon and service roles (custom JWT managed in backend/app)
DO $$
BEGIN
  -- Users policies
  DROP POLICY IF EXISTS "Allow all for users" ON public.users;
  CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

  -- Employees policies
  DROP POLICY IF EXISTS "Allow all for employees" ON public.employees;
  CREATE POLICY "Allow all for employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

  -- Assets policies
  DROP POLICY IF EXISTS "Allow all for assets" ON public.assets;
  CREATE POLICY "Allow all for assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);

  -- Asset History policies
  DROP POLICY IF EXISTS "Allow all for asset_history" ON public.asset_history;
  CREATE POLICY "Allow all for asset_history" ON public.asset_history FOR ALL USING (true) WITH CHECK (true);

  -- Maintenance policies
  DROP POLICY IF EXISTS "Allow all for maintenance" ON public.maintenance;
  CREATE POLICY "Allow all for maintenance" ON public.maintenance FOR ALL USING (true) WITH CHECK (true);

  -- Activity logs policies
  DROP POLICY IF EXISTS "Allow all for activity_logs" ON public.activity_logs;
END $$;

-- Grant access to Supabase API roles (anon and authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- SEED INITIAL SAMPLE DATA
-- ==============================================================================

-- 1. Seed Admin User (Password: admin123, bcrypt hash)
INSERT INTO public.users (id, name, email, password, role, department, phone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'System Administrator',
  'admin@assetflow.com',
  '$2a$10$tZ2c6FzCglrO8Hq35FknY.1K1h5H4x6e2nN7Iqf5ZJ6L.QeR2wEfe',
  'admin',
  'IT Infrastructure',
  '+1 (555) 123-4567'
) ON CONFLICT (email) DO NOTHING;

-- 2. Seed Sample Employees
INSERT INTO public.employees (id, employee_id, first_name, last_name, email, phone, department, designation, status, join_date)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'EMP001', 'Balaji', 'S', 'balaji@assetflow.com', '+91 98765 43210', 'Engineering', 'Lead Systems Architect', 'Active', '2023-01-15'),
  ('e0000000-0000-0000-0000-000000000002', 'EMP002', 'Sarah', 'Jenkins', 'sarah.j@assetflow.com', '+1 (555) 234-5678', 'Design', 'Senior UI/UX Designer', 'Active', '2023-04-10'),
  ('e0000000-0000-0000-0000-000000000003', 'EMP003', 'David', 'Chen', 'david.c@assetflow.com', '+1 (555) 345-6789', 'Product', 'Product Manager', 'Active', '2022-09-01'),
  ('e0000000-0000-0000-0000-000000000004', 'EMP004', 'Priya', 'Nair', 'priya.n@assetflow.com', '+91 98765 87654', 'Human Resources', 'HR Specialist', 'Active', '2024-02-01')
ON CONFLICT (employee_id) DO NOTHING;

-- 3. Seed Sample Assets
INSERT INTO public.assets (id, asset_id, name, category, brand, model, serial_number, purchase_date, purchase_cost, current_value, warranty_expiry, vendor, location, status, condition, assigned_to, assigned_date, notes)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'AST-2024-001',
    'MacBook Pro 16 M3 Max',
    'Laptop',
    'Apple',
    'MacBook Pro 16" (2023)',
    'C02G1234MD6R',
    '2024-01-10',
    3499.00,
    3150.00,
    '2027-01-10',
    'Apple Enterprise Store',
    'Headquarters - Floor 3',
    'Assigned',
    'New',
    'e0000000-0000-0000-0000-000000000001',
    NOW(),
    'High-performance workstation assigned to engineering lead'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'AST-2024-002',
    'Dell UltraSharp 32 4K USB-C Hub Monitor',
    'Monitor',
    'Dell',
    'U3223QE',
    'CN-0K759F-74261',
    '2024-01-15',
    899.00,
    810.00,
    '2027-01-15',
    'Dell Direct',
    'Headquarters - Floor 3',
    'Assigned',
    'Excellent',
    'e0000000-0000-0000-0000-000000000002',
    NOW(),
    'Assigned to UI/UX team'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'AST-2024-003',
    'Lenovo ThinkPad X1 Carbon Gen 11',
    'Laptop',
    'Lenovo',
    'X1 Carbon Gen 11',
    'PF4ABC12',
    '2023-11-20',
    1850.00,
    1480.00,
    '2026-11-20',
    'Lenovo Commercial',
    'IT Storage Room B',
    'Available',
    'Excellent',
    NULL,
    NULL,
    'Ready for reallocation'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'AST-2024-004',
    'Cisco Catalyst 9300 48-Port Switch',
    'Networking',
    'Cisco',
    'C9300-48P',
    'FCW2248L01B',
    '2023-06-05',
    4200.00,
    3360.00,
    '2028-06-05',
    'Cisco Partners',
    'Server Room Rack 2',
    'Under Maintenance',
    'Good',
    NULL,
    NULL,
    'Scheduled for firmware update'
  )
ON CONFLICT (asset_id) DO NOTHING;

-- 4. Seed Sample Maintenance
INSERT INTO public.maintenance (id, maintenance_id, asset_id, type, title, description, cost, scheduled_date, status, priority, performed_by)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'MNT-2024-001',
    'b0000000-0000-0000-0000-000000000004',
    'Preventive',
    'Core Switch Firmware Upgrade & Health Check',
    'Upgrade Cisco IOS-XE to latest recommended release and inspect thermal sensors',
    150.00,
    CURRENT_DATE + INTERVAL '3 days',
    'Scheduled',
    'High',
    'Network Operations Team'
  )
ON CONFLICT (maintenance_id) DO NOTHING;
