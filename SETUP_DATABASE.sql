-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO DEFINITIVO E SEGURO
-- ==========================================

-- 1. CRIAÇÃO DA TABELA DE FILIAIS
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir filiais básicas se não existirem
INSERT INTO public.branches (name) 
SELECT 'Sede Principal' WHERE NOT EXISTS (SELECT 1 FROM public.branches WHERE name = 'Sede Principal');

-- 2. CRIAÇÃO DA TABELA DE USUÁRIOS (PERFIS)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('master', 'admin', 'user')) DEFAULT 'user',
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    avatar_url TEXT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INSERIR SEU USUÁRIO MASTER
-- Vincula o usuário da autenticação ao perfil master
INSERT INTO public.users (id, name, email, role, status)
VALUES (
    '92cf1565-d89d-41bf-9bcb-ed46d60845e0', 
    'Pastor Junior', 
    'info@pastorjunior.com', 
    'master', 
    'active'
) ON CONFLICT (id) DO UPDATE SET role = 'master';

-- 4. CRIAÇÃO DA TABELA DE ETIQUETAS (TAGS)
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir etiquetas padrão se não existirem
INSERT INTO public.tags (name, color) 
SELECT 'Membro', 'bg-blue-100 text-blue-700 border-blue-200' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Membro');
INSERT INTO public.tags (name, color) 
SELECT 'Visitante', 'bg-green-100 text-green-700 border-green-200' WHERE NOT EXISTS (SELECT 1 FROM public.tags WHERE name = 'Visitante');

-- 5. CRIAÇÃO DA TABELA DE CONTATOS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'O')),
    tag_ids UUID[] DEFAULT '{}',
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CRIAÇÃO DA TABELA DE ATIVIDADES
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('whatsapp', 'sms', 'call')),
    status TEXT DEFAULT 'sent',
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CRIAÇÃO DA TABELA DE AUTOMAÇÕES
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('birthday', 'welcome', 'custom')) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    channel TEXT CHECK (channel IN ('whatsapp', 'sms', 'both')) DEFAULT 'sms',
    message_template TEXT NOT NULL,
    last_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir automação de aniversário se não existir
INSERT INTO public.automations (name, type, enabled, channel, message_template)
SELECT 'Mensagem de Aniversário', 'birthday', true, 'sms', 'Parabéns {name}! Desejamos a você um dia repleto de bênçãos e alegria.'
WHERE NOT EXISTS (SELECT 1 FROM public.automations WHERE type = 'birthday');

-- 8. HABILITAR SEGURANÇA (RLS)
DO $$ 
BEGIN
    ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN 
    NULL; -- Ignora erros se já estiver habilitado
END $$;

-- 9. POLÍTICAS DE ACESSO
DO $$ 
BEGIN
    -- Branches
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'branches') THEN
        CREATE POLICY "Allow all for authenticated" ON public.branches FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    -- Users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'users') THEN
        CREATE POLICY "Allow all for authenticated" ON public.users FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Contacts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'contacts') THEN
        CREATE POLICY "Allow all for authenticated" ON public.contacts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Tags
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'tags') THEN
        CREATE POLICY "Allow all for authenticated" ON public.tags FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Activities
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'activities') THEN
        CREATE POLICY "Allow all for authenticated" ON public.activities FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Automations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for authenticated' AND tablename = 'automations') THEN
        CREATE POLICY "Allow all for authenticated" ON public.automations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

