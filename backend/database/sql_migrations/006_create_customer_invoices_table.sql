-- ==============================================================================
-- Migration: 006_create_customer_invoices_table.sql
-- Description: Creates customer_invoices table for daily/monthly customer invoices
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.customer_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    retailer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    month VARCHAR(7) NOT NULL,
    invoice_date DATE NOT NULL,
    invoice_number VARCHAR(100),
    invoice_title VARCHAR(255),
    amount NUMERIC(15, 2) DEFAULT 0.00,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'UPLOADED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_invoices_cust_month ON public.customer_invoices(customer_id, month);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_ret_month ON public.customer_invoices(retailer_id, month);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_tenant_month ON public.customer_invoices(tenant_id, month);
