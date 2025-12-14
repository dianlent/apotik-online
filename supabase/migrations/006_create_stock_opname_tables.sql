-- Migration: Create stock opname (stock counting) tables

-- Sessions table ============================================================
CREATE TABLE IF NOT EXISTS public.stock_opname_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    notes text,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    started_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at timestamptz,
    total_items integer DEFAULT 0,
    total_adjusted integer DEFAULT 0,
    total_difference integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.stock_opname_sessions IS 'Physical stock count sessions (stock opname)';
COMMENT ON COLUMN public.stock_opname_sessions.reference_code IS 'Human readable reference (e.g., SO-20241201-001)';
COMMENT ON COLUMN public.stock_opname_sessions.status IS 'draft, in_progress, completed';

-- Items table ===============================================================
CREATE TABLE IF NOT EXISTS public.stock_opname_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.stock_opname_sessions(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    system_stock integer NOT NULL DEFAULT 0,
    counted_stock integer,
    note text,
    difference integer GENERATED ALWAYS AS (COALESCE(counted_stock, system_stock) - system_stock) STORED,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.stock_opname_items IS 'Line items that record counted stock per product';
COMMENT ON COLUMN public.stock_opname_items.difference IS 'counted_stock - system_stock';

CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_opname_items_unique_product ON public.stock_opname_items(session_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_opname_items_session ON public.stock_opname_items(session_id);
CREATE INDEX IF NOT EXISTS idx_stock_opname_items_product ON public.stock_opname_items(product_id);

-- Enable RLS ================================================================
ALTER TABLE public.stock_opname_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opname_items ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
DROP POLICY IF EXISTS "Stock opname sessions view" ON public.stock_opname_sessions;
CREATE POLICY "Stock opname sessions view"
ON public.stock_opname_sessions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
);

DROP POLICY IF EXISTS "Stock opname sessions manage" ON public.stock_opname_sessions;
CREATE POLICY "Stock opname sessions manage"
ON public.stock_opname_sessions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
);

-- Policies for items
DROP POLICY IF EXISTS "Stock opname items view" ON public.stock_opname_items;
CREATE POLICY "Stock opname items view"
ON public.stock_opname_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
);

DROP POLICY IF EXISTS "Stock opname items manage" ON public.stock_opname_items;
CREATE POLICY "Stock opname items manage"
ON public.stock_opname_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'apoteker')
    )
);

-- Updated at trigger ========================================================
CREATE OR REPLACE FUNCTION public.update_stock_opname_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stock_opname_sessions_updated_at ON public.stock_opname_sessions;
CREATE TRIGGER stock_opname_sessions_updated_at
    BEFORE UPDATE ON public.stock_opname_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_opname_sessions_updated_at();
