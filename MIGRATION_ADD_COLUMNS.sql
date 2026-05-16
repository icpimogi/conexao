-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA CORRIGIR AS COLUNAS FALTANTES

-- 1. Adicionar colunas na tabela de Filiais (branches)
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Adicionar colunas na tabela de Usuários (users)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- 3. Atualizar as políticas de segurança para serem mais robustas (Opcional, mas recomendado)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.branches;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.users;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.contacts;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.tags;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.activities;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.automations;

    CREATE POLICY "Allow all for authenticated" ON public.branches FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Allow all for authenticated" ON public.users FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Allow all for authenticated" ON public.contacts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Allow all for authenticated" ON public.tags FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Allow all for authenticated" ON public.activities FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Allow all for authenticated" ON public.automations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
END $$;
