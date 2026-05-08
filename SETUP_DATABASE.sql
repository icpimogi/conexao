-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO DEFINITIVO
-- ==========================================

-- 1. LIMPEZA TOTAL (Ignora se não existirem)
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;

-- 2. CRIAÇÃO DA TABELA DE FILIAIS
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.branches (name) VALUES ('Sede Principal'), ('Filial Oeste');

-- 3. CRIAÇÃO DA TABELA DE USUÁRIOS (PERFIS)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('master', 'admin', 'user')) DEFAULT 'user',
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INSERIR SEU USUÁRIO MASTER
-- Certifique-se de que o ID abaixo é o seu (92cf1565-d89d-41bf-9bcb-ed46d60845e0)
INSERT INTO public.users (id, name, email, role, status)
VALUES (
    '92cf1565-d89d-41bf-9bcb-ed46d60845e0', 
    'Pastor Junior', 
    'info@pastorjunior.com', 
    'master', 
    'active'
) ON CONFLICT (id) DO UPDATE SET role = 'master';

-- 5. CRIAÇÃO DA TABELA DE CONTATOS
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CRIAÇÃO DA TABELA DE ATIVIDADES
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('whatsapp', 'sms', 'call')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. HABILITAR SEGURANÇA (RLS)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE ACESSO (Permitir tudo para usuários logados para este MVP)
CREATE POLICY "Allow all for authenticated" ON public.branches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON public.contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON public.activities FOR ALL USING (auth.role() = 'authenticated');

