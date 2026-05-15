# Guia de Migração e Publicação - Conexão ICPI

Se você baixou o projeto do GitHub ou ZIP e está tentando rodar na sua própria URL, siga estes passos para resolver o erro "Failed to fetch" e garantir que tudo funcione.

## 1. Configuração do Supabase (Banco de Dados)

O erro "Failed to fetch" ocorre geralmente quando o App não consegue se conectar ao Supabase ou quando as tabelas não existem.

1.  **Crie um projeto no Supabase** (supabase.com).
2.  **Execute o SQL de Inicialização**: No painel do Supabase, vá em **SQL Editor** e cole o conteúdo do arquivo `SETUP_DATABASE.sql` que está na raiz deste projeto. Isso criará todas as tabelas (contatos, filiais, etiquetas, etc).
3.  **Habilite o Google Auth** (Opcional): Se for usar Login social. Caso contrário, use Email/Senha.
4.  **Verifique o usuário Master**: No `SETUP_DATABASE.sql`, substitua o ID na linha 35 pelo ID do seu usuário que você criar no painel de Authentication do Supabase para ter acesso Master.

## 2. Variáveis de Ambiente (.env)

Você deve criar um arquivo chamado `.env` na raiz do projeto (baseado no `.env.example`).

```env
# Supabase (Frontend)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key

# SMS Facilita (Backend)
FACILITA_USER=seu_usuario
FACILITA_PASSWORD=sua_senha
```

## 3. Publicação (Build & Start)

O projeto é "Full-Stack" (React + Express).

1.  **Instale as dependências**: `npm install`
2.  **Build**: `npm run build`
    *   Isso gera a pasta `dist/` (frontend) e o arquivo `dist/server.cjs` (backend).
3.  **Start**: `npm start`
    *   O comando de inicialização no seu servidor deve ser `node dist/server.cjs`.

## 4. Por que não havia a pasta "supabase" no GitHub?

O Supabase é um serviço externo ("Backend as a Service"). O código que você baixou contém o **Cliente** que se conecta a ele (em `src/lib/supabase.ts`) e o **Schema SQL** (`SETUP_DATABASE.sql`) para você reconstruir a estrutura no seu próprio painel do Supabase.

---
**Dúvidas?** Verifique se a URL do Supabase no seu `.env` começa com `https://` e se não há espaços extras nas chaves.
