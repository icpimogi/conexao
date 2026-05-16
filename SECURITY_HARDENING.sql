-- SCRIPT DE ENDURECIMENTO DE SEGURANÇA (SECURITY HARDENING)
-- Este script substitui as políticas permissivas por controles de acesso baseados em filiais e cargos.

DO $$ 
BEGIN
    -- 1. Limpeza de políticas antigas e inseguras
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.branches;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.users;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.contacts;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.tags;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.activities;
    DROP POLICY IF EXISTS "Allow all for authenticated" ON public.automations;
EXCEPTION WHEN OTHERS THEN 
    NULL;
END $$;

-- ==========================================
-- POLÍTICAS PARA A TABELA DE USUÁRIOS
-- ==========================================

-- Usuários podem ler seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Masters podem fazer tudo
CREATE POLICY "Master has full control over users" 
ON public.users FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'master')
);

-- ==========================================
-- POLÍTICAS PARA A TABELA DE FILIAIS
-- ==========================================

-- Todos os autenticados podem ver as filiais (necessário para seleção em cadastros)
CREATE POLICY "Anyone authenticated can view branches" 
ON public.branches FOR SELECT 
USING (auth.role() = 'authenticated');

-- Apenas Master pode criar/editar/excluir filiais
CREATE POLICY "Only master can manage branches" 
ON public.branches FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'master')
);

-- ==========================================
-- POLÍTICAS PARA A TABELA DE CONTATOS
-- ==========================================

-- Master vê tudo
CREATE POLICY "Master sees all contacts" 
ON public.contacts FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'master')
);

-- Admins e Users veem apenas contatos da sua filial
CREATE POLICY "Users see branch contacts" 
ON public.contacts FOR ALL 
USING (
    branch_id = (SELECT branch_id FROM public.users WHERE id = auth.uid())
);

-- ==========================================
-- POLÍTICAS PARA A TABELA DE ATIVIDADES
-- ==========================================

-- Similar aos contatos: acesso restrito por filial
CREATE POLICY "Users see branch activities" 
ON public.activities FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.contacts c 
        JOIN public.users u ON u.id = auth.uid()
        WHERE c.id = activities.contact_id 
        AND (u.role = 'master' OR c.branch_id = u.branch_id)
    )
);

-- ==========================================
-- POLÍTICAS PARA A TABELA DE ETIQUETAS (TAGS)
-- ==========================================

-- Todos podem ver etiquetas
CREATE POLICY "Authenticated can view tags" 
ON public.tags FOR SELECT 
USING (auth.role() = 'authenticated');

-- Apenas Master e Admins podem editar etiquetas
CREATE POLICY "Master and Admin can manage tags" 
ON public.tags FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('master', 'admin'))
);

-- ==========================================
-- POLÍTICAS PARA A TABELA DE AUTOMAÇÕES
-- ==========================================

-- Apenas Master gerencia automações do sistema
CREATE POLICY "Only master manages automations" 
ON public.automations FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'master')
);

CREATE POLICY "Authenticated can view automations" 
ON public.automations FOR SELECT 
USING (auth.role() = 'authenticated');
