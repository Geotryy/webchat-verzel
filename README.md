# 🤖 Webchat SDR Automatizado - Verzel

> **Agente SDR automatizado usando OpenAI (Assistants API / Responses / Realtime) para qualificação inteligente de leads com integração Pipefy e Google Calendar**

![Verzel](https://img.shields.io/badge/Verzel-Great_Place_To_Work-blue)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Qualificação](#fluxo-de-qualificação)
- [Integrações](#integrações)
- [Solução de Problemas](#solução-de-problemas)
- [Deploy](#deploy)
- [Critérios de Sucesso](#critérios-de-sucesso)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **Webchat SDR Automatizado** é uma solução completa de qualificação de leads que utiliza Inteligência Artificial (OpenAI GPT-4) para conduzir conversas naturais, coletar informações essenciais dos prospects e automaticamente agendar reuniões através do Google Calendar, além de registrar todos os leads no Pipefy.

Este projeto foi desenvolvido seguindo as **regras de negócio da Verzel** e atende aos **critérios de sucesso** estabelecidos para garantir uma experiência profissional e empática na qualificação de leads.

### 🎯 Objetivo

Automatizar o processo de SDR (Sales Development Representative) através de um assistente virtual inteligente que:

1. **Atende leads interessados** em produtos/serviços
2. **Conduz conversa natural** com perguntas progressivas
3. **Coleta informações básicas** (nome, e-mail, empresa, telefone, necessidade, prazo)
4. **Confirma interesse explícito** antes de avançar
5. **Agenda reuniões automaticamente** via Google Calendar
6. **Registra todos os leads** no Pipefy com status adequado
7. **Atualiza cards existentes** quando há recontato

---

## ✨ Funcionalidades

### 🤖 Assistente Conversacional Inteligente

- **Conversa natural** powered by OpenAI GPT-4
- **Tom profissional e empático** seguindo diretrizes da Verzel
- **Perguntas progressivas** para coleta gradual de informações
- **Resumos claros** após cada etapa da conversa
- **Confirmação explícita de interesse** como gatilho para agendamento

### 📅 Agendamento Automático

- **Integração com Google Calendar API**
- **Busca automática** de horários disponíveis (próximos 7 dias)
- **Sugestão de 2-3 horários** em tempo real
- **Criação automática de eventos** com Google Meet
- **Envio de convites** por e-mail para o lead
- **Atualização do Pipefy** com link e data/hora da reunião

### 📊 CRM Integration (Pipefy)

- **Criação automática de cards** no funil "Pré-vendas"
- **Campos obrigatórios**: nome, e-mail, empresa, necessidade, interesse_confirmado
- **Campos opcionais**: telefone, prazo, meeting_link, meeting_datetime
- **Atualização de cards existentes** (evita duplicação por e-mail)
- **Persistência de todos os leads** independente do resultado

### 🎨 Interface Moderna e Responsiva

- **Design mobile-first** com gradientes modernos (azul/roxo)
- **Webchat flutuante** no canto inferior direito
- **Animações suaves** e feedback visual
- **Indicador de digitação** para simular conversa humana
- **Histórico de mensagens** persistente durante a sessão
- **Acessibilidade** com suporte a teclado e leitores de tela

### 📈 Painel Administrativo

- **Visualização de todos os leads** capturados
- **Filtros por status** (Novo, Contatado, Qualificado, Reunião Agendada, Fechado)
- **Histórico completo** de cada conversa
- **Atualização manual de status** dos leads
- **Estatísticas em tempo real**

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **full-stack moderna** com separação clara entre frontend e backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Webchat    │  │  Home Page   │  │ Admin Panel  │      │
│  │  Component   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                      tRPC Client                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ Type-safe API
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                     BACKEND (Node.js + Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ tRPC Router  │  │  Services    │  │  Database    │      │
│  │   (API)      │  │              │  │  (Drizzle)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────┴────────┐         ┌───────┴────────┐
        │  External APIs │         │   Database     │
        │                │         │                │
        │ • OpenAI GPT-4 │         │ MySQL / TiDB   │
        │ • Google Cal   │         │                │
        │ • Pipefy       │         │ • conversations│
        └────────────────┘         │ • messages     │
                                   │ • leads        │
                                   │ • users        │
                                   └────────────────┘
```

### Componentes Principais

1. **Frontend (React + TypeScript)**
   - Interface do usuário responsiva
   - Componentes reutilizáveis (shadcn/ui)
   - Gerenciamento de estado com tRPC React Query

2. **Backend (Node.js + Express + tRPC)**
   - API type-safe com tRPC
   - Routers para chat, leads e admin
   - Serviços de integração (OpenAI, Google Calendar, Pipefy)

3. **Banco de Dados (MySQL/TiDB + Drizzle ORM)**
   - Schema tipado com Drizzle
   - Migrações automáticas
   - Relacionamentos entre tabelas

4. **Integrações Externas**
   - OpenAI API (GPT-4)
   - Google Calendar API
   - Pipefy GraphQL API

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.x | Biblioteca UI moderna |
| **TypeScript** | 5.x | Tipagem estática |
| **Tailwind CSS** | 4.x | Framework CSS utility-first |
| **tRPC** | 11.x | API type-safe end-to-end |
| **shadcn/ui** | Latest | Componentes UI acessíveis |
| **Wouter** | 3.x | Roteamento leve |
| **date-fns** | Latest | Manipulação de datas |

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 22.x | Runtime JavaScript |
| **Express** | 4.x | Framework web |
| **tRPC** | 11.x | API type-safe |
| **Drizzle ORM** | Latest | ORM TypeScript-first |
| **OpenAI SDK** | 6.x | Cliente oficial OpenAI |
| **Google APIs** | Latest | Cliente Google Calendar |
| **Axios** | Latest | Cliente HTTP para Pipefy |

### Banco de Dados

| Tecnologia | Descrição |
|------------|-----------|
| **MySQL** | Banco relacional (local) |
| **TiDB Cloud** | MySQL compatível (cloud, recomendado) |

### DevOps

| Tecnologia | Descrição |
|------------|-----------|
| **pnpm** | Gerenciador de pacotes rápido |
| **tsx** | Executor TypeScript |
| **Vite** | Build tool moderna |
| **dotenv** | Gerenciamento de variáveis de ambiente |

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Software Necessário

- ✅ **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- ✅ **pnpm** ([Instalação](https://pnpm.io/installation))
- ✅ **Git** (opcional, para clonar o repositório)
- ✅ **MySQL** (local) **OU** conta no **TiDB Cloud** (recomendado - grátis)

### Credenciais de APIs

Você precisará obter credenciais para as seguintes APIs:

#### 1. OpenAI API Key

**⚠️ IMPORTANTE: Você precisa ter créditos na conta OpenAI!**

- **Onde obter**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Custo**: ~$0.02-0.03 por conversa completa
- **Créditos mínimos recomendados**: $10 (aproximadamente 300-400 conversas)
- **Como adicionar créditos**:
  1. Acesse [https://platform.openai.com/settings/organization/billing/overview](https://platform.openai.com/settings/organization/billing/overview)
  2. Clique em "Add payment method"
  3. Adicione seu cartão de crédito
  4. Clique em "Add to credit balance"
  5. Adicione pelo menos $10

**❌ Sem créditos, o chat mostrará erro: "Desculpe, ocorreu um erro. Por favor, tente novamente."**

#### 2. Google Calendar OAuth

- **Onde obter**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- **Passos**:
  1. Crie um projeto no Google Cloud Console
  2. Ative a API do Google Calendar
  3. Crie credenciais OAuth 2.0 (Aplicativo da Web)
  4. Adicione a URL de redirecionamento: `http://localhost:3000/api/google/callback`
  5. Copie o Client ID e Client Secret

#### 3. Pipefy API Token

- **Onde obter**: [https://app.pipefy.com/tokens](https://app.pipefy.com/tokens)
- **Passos**:
  1. Faça login no Pipefy
  2. Vá em Configurações → Tokens de API
  3. Gere um novo token
  4. Copie o ID do Pipe (número na URL: `https://app.pipefy.com/pipes/XXXXXX`)

#### 4. Banco de Dados MySQL/TiDB

**Opção A - TiDB Cloud (Recomendado - Grátis):**
- **Onde obter**: [https://tidbcloud.com/](https://tidbcloud.com/)
- **Passos**:
  1. Crie uma conta gratuita
  2. Crie um cluster (tier gratuito disponível)
  3. Copie a connection string fornecida
  4. **IMPORTANTE**: A connection string deve incluir SSL

**Opção B - MySQL Local:**
- **Instalar**: [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
- **Criar banco**:
  ```sql
  CREATE DATABASE webchat_sdr;
  ```
- **Connection string**: `mysql://root:sua_senha@localhost:3306/webchat_sdr`

---

## 📦 Instalação

### Passo 1: Baixar o Projeto

Extraia o arquivo `webchat-verzel.zip` em uma pasta de sua preferência.

```bash
# Exemplo: C:\Projetos\webchat-sdr
# ou: ~/Projetos/webchat-sdr
```

### Passo 2: Abrir Terminal na Pasta

**Windows:**
1. Abra a pasta `webchat-verzel`
2. Segure `Shift` + Clique direito em área vazia
3. Escolha "Abrir janela do PowerShell aqui"

**Mac/Linux:**
```bash
cd caminho/para/webchat-verzel
```

### Passo 3: Instalar Dependências

```bash
pnpm install
```

⏱️ **Aguarde** 2-5 minutos (vai baixar todas as bibliotecas necessárias)

**Saída esperada:**
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded XX
Done in XXs
```

---

## ⚙️ Configuração

### Passo 1: Criar Arquivo .env.local

Na raiz do projeto, crie um arquivo chamado `.env.local`:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Mac/Linux:**
```bash
touch .env.local
```

### Passo 2: Adicionar Configurações

Abra o arquivo `.env.local` em um editor de texto e adicione:

```env
# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID=seu_client_id_aqui
GOOGLE_CALENDAR_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/callback

# Pipefy
PIPEFY_API_TOKEN=seu_token_pipefy_aqui
PIPEFY_PIPE_ID=seu_pipe_id_aqui

# OpenAI (IMPORTANTE: Certifique-se de ter créditos!)
OPENAI_API_KEY=sk-proj-sua_chave_openai_aqui

# Banco de Dados
# TiDB Cloud (com SSL):
DATABASE_URL=mysql://usuario.root:senha@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}

# OU MySQL Local:
# DATABASE_URL=mysql://root:sua_senha@localhost:3306/webchat_sdr
```

**⚠️ IMPORTANTE:**
- Substitua todos os valores `seu_*_aqui` pelas suas credenciais reais
- Para TiDB Cloud, certifique-se de incluir `?ssl={"rejectUnauthorized":true}` no final da URL
- Verifique se você tem **créditos na OpenAI** antes de testar

### Passo 3: Configurar Banco de Dados

Execute as migrações para criar as tabelas:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="sua_connection_string_aqui"
pnpm db:push
```

**Mac/Linux:**
```bash
export DATABASE_URL="sua_connection_string_aqui"
pnpm db:push
```

**Saída esperada:**
```
✓ Pushing schema changes to database
✓ migrations applied successfully!
```

---

## 🚀 Como Executar

### Opção 1: Usando Script (Recomendado para Windows)

Crie um arquivo `start.ps1` na raiz do projeto:

```powershell
# start.ps1
$env:GOOGLE_CALENDAR_CLIENT_ID="seu_client_id"
$env:GOOGLE_CALENDAR_CLIENT_SECRET="seu_client_secret"
$env:GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/google/callback"
$env:PIPEFY_API_TOKEN="seu_token"
$env:PIPEFY_PIPE_ID="seu_pipe_id"
$env:OPENAI_API_KEY="sk-proj-sua_chave"
$env:DATABASE_URL="sua_connection_string"
$env:NODE_ENV="development"
pnpm exec tsx watch server/_core/index.ts
```

Execute:
```powershell
.\start.ps1
```

### Opção 2: Comando Direto (Mac/Linux)

```bash
export GOOGLE_CALENDAR_CLIENT_ID="seu_client_id"
export GOOGLE_CALENDAR_CLIENT_SECRET="seu_client_secret"
export GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/google/callback"
export PIPEFY_API_TOKEN="seu_token"
export PIPEFY_PIPE_ID="seu_pipe_id"
export OPENAI_API_KEY="sk-proj-sua_chave"
export DATABASE_URL="sua_connection_string"
export NODE_ENV="development"
pnpm exec tsx watch server/_core/index.ts
```

### Saída Esperada

```
[OAuth] Initialized with baseURL: 
[dotenv@17.2.3] injecting env (5) from .env.local
Server running on http://localhost:3000/
```

### Acessar a Aplicação

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Você verá a página inicial com o botão de chat no canto inferior direito

---

## 📁 Estrutura do Projeto

```
webchat-sdr/
├── client/                    # Frontend React
│   ├── public/               # Arquivos estáticos
│   └── src/
│       ├── components/       # Componentes React
│       │   ├── ui/          # Componentes shadcn/ui
│       │   └── Webchat.tsx  # Componente principal do chat
│       ├── pages/           # Páginas da aplicação
│       │   ├── Home.tsx     # Página inicial
│       │   └── AdminPanel.tsx # Painel administrativo
│       ├── contexts/        # Contextos React
│       ├── hooks/           # Hooks customizados
│       ├── lib/             # Utilitários
│       │   └── trpc.ts      # Cliente tRPC
│       ├── App.tsx          # Rotas e layout
│       ├── main.tsx         # Entry point
│       └── index.css        # Estilos globais
│
├── server/                   # Backend Node.js
│   ├── _core/               # Infraestrutura
│   │   ├── index.ts         # Entry point do servidor
│   │   ├── trpc.ts          # Configuração tRPC
│   │   ├── context.ts       # Contexto das requisições
│   │   └── oauth.ts         # Autenticação OAuth
│   ├── services/            # Serviços de integração
│   │   ├── openai.ts        # Integração OpenAI
│   │   ├── googleCalendar.ts # Integração Google Calendar
│   │   └── pipefy.ts        # Integração Pipefy
│   ├── db.ts                # Helpers de banco de dados
│   └── routers.ts           # Routers tRPC
│
├── drizzle/                 # Banco de dados
│   ├── schema.ts            # Schema do banco
│   └── migrations/          # Migrações
│
├── shared/                  # Código compartilhado
│   ├── const.ts             # Constantes
│   └── types.ts             # Tipos TypeScript
│
├── .env.local               # Variáveis de ambiente (criar)
├── package.json             # Dependências
├── tsconfig.json            # Configuração TypeScript
├── vite.config.ts           # Configuração Vite
├── drizzle.config.ts        # Configuração Drizzle
└── README.md                # Este arquivo
```

---

## 🔄 Fluxo de Qualificação

O assistente segue um **fluxo estruturado** baseado nas regras de negócio da Verzel:

### 1️⃣ Apresentação

```
Assistente: "Olá! Bem-vindo à Verzel. Sou seu assistente virtual e estou 
aqui para entender como podemos ajudá-lo. Para começar, qual é o seu nome?"
```

### 2️⃣ Perguntas de Descoberta

O assistente coleta as seguintes informações **progressivamente**:

1. **Nome** do lead
2. **E-mail** para contato
3. **Empresa** onde trabalha
4. **Telefone** (opcional)
5. **Necessidade/Dor** que precisa resolver
6. **Prazo** para implementação

**Características da conversa:**
- ✅ Perguntas **uma de cada vez**
- ✅ Tom **profissional e empático**
- ✅ **Resumos claros** após coletar informações
- ✅ Validação de dados (formato de e-mail, etc.)

### 3️⃣ Pergunta Direta de Confirmação

```
Assistente: "Você gostaria de seguir com uma conversa com nosso time 
para iniciar o projeto / adquirir o produto?"
```

**Gatilho para agendamento:**
- ✅ Resposta afirmativa → Prossegue para agendamento
- ❌ Resposta negativa → Registra no Pipefy e encerra cordialmente

### 4️⃣ Agendamento Automático

Se o lead confirmar interesse:

1. **Busca horários disponíveis** (próximos 7 dias)
2. **Oferece 2-3 horários** via API do Google Calendar
3. Lead **escolhe um horário**
4. **Cria evento** no Google Calendar com Google Meet
5. **Envia link da reunião** para o lead
6. **Atualiza o Pipefy** com meeting_link e meeting_datetime

### 5️⃣ Registro no Pipefy

**Todos os leads são registrados**, independente do resultado:

- ✅ **Interesse confirmado** → `interesse_confirmado: true`
- ✅ **Reunião agendada** → Inclui `meeting_link` e `meeting_datetime`
- ✅ **Sem interesse** → Registra apenas as informações coletadas
- ✅ **Recontato** → Atualiza o card existente (usa e-mail como chave)

---

## 🔌 Integrações

### OpenAI (GPT-4)

**Função:** Assistente conversacional inteligente

**Configuração:**
```typescript
// server/services/openai.ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**Funções Orquestradas:**
- `registrarLead(lead)` - Registra lead no contexto
- `oferecerHorarios(slots)` - Apresenta horários disponíveis
- `agendarReuniao(slot, lead)` - Confirma agendamento

**Custo Aproximado:**
- ~$0.02-0.03 por conversa completa
- $10 de crédito = ~300-400 conversas

### Google Calendar API

**Função:** Agendamento automático de reuniões

**Configuração:**
```typescript
// server/services/googleCalendar.ts
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);
```

**Funcionalidades:**
- Buscar slots disponíveis (próximos 7 dias)
- Criar eventos com Google Meet
- Enviar convites por e-mail

**Autenticação:**
- OAuth 2.0 (fluxo de consentimento)
- Tokens armazenados no banco de dados

### Pipefy GraphQL API

**Função:** CRM para gestão de leads

**Configuração:**
```typescript
// server/services/pipefy.ts
const PIPEFY_API_URL = 'https://api.pipefy.com/graphql';
const headers = {
  'Authorization': `Bearer ${process.env.PIPEFY_API_TOKEN}`,
};
```

**Campos do Card:**
- `nome` (obrigatório)
- `e_mail` (obrigatório, usado como chave única)
- `empresa` (obrigatório)
- `necessidade` (obrigatório)
- `interesse_confirmado` (boolean)
- `telefone` (opcional)
- `prazo` (opcional)
- `meeting_link` (opcional)
- `meeting_datetime` (opcional)

**Lógica de Duplicação:**
- Busca card existente por e-mail
- Se existir → Atualiza
- Se não existir → Cria novo

---

## 🚨 Solução de Problemas

### ❌ Erro: "Desculpe, ocorreu um erro. Por favor, tente novamente."

**Causa:** Falta de créditos na OpenAI ou chave inválida

**Solução:**
1. Verifique se você tem créditos na OpenAI:
   - Acesse: https://platform.openai.com/settings/organization/billing/overview
2. Se não tiver créditos, adicione pelo menos $10
3. Verifique se a chave está correta no `.env.local`
4. Reinicie o servidor

**Como verificar o erro exato:**
Olhe o terminal onde o servidor está rodando. Você verá:
```
code: 'insufficient_quota'
message: "You exceeded your current quota..."
```

### ❌ Erro: "DATABASE_URL is required"

**Causa:** Arquivo `.env.local` não está sendo lido

**Solução:**
1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se a variável `DATABASE_URL` está definida
3. Use o comando com variáveis de ambiente explícitas (veja seção "Como Executar")

### ❌ Erro: "Connections using insecure transport are prohibited"

**Causa:** TiDB Cloud requer SSL

**Solução:**
Adicione `?ssl={"rejectUnauthorized":true}` no final da connection string:
```env
DATABASE_URL=mysql://usuario.root:senha@gateway.tidbcloud.com:4000/test?ssl={"rejectUnauthorized":true}
```

### ❌ Erro: "Port 3000 already in use"

**Causa:** Outra aplicação está usando a porta 3000

**Solução:**
1. Feche a aplicação que está usando a porta
2. Ou adicione no `.env.local`: `PORT=3001`
3. Acesse: `http://localhost:3001`

### ❌ Erro: "NODE_ENV is not recognized"

**Causa:** Windows PowerShell não reconhece a sintaxe `NODE_ENV=development`

**Solução:**
Use o script `start.ps1` ou defina a variável manualmente:
```powershell
$env:NODE_ENV="development"
pnpm exec tsx watch server/_core/index.ts
```

### ❌ Webchat não aparece

**Causa:** Erro de compilação do frontend

**Solução:**
1. Abra o console do navegador (F12 → Console)
2. Verifique se há erros em vermelho
3. Verifique o terminal do servidor
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

---

## 🚀 Deploy

### Preparação

1. Configure as variáveis de ambiente no serviço de hosting
2. Configure o banco de dados de produção
3. Execute as migrações: `pnpm db:push`
4. Atualize a URL de redirecionamento do Google Calendar

### Vercel (Recomendado)

1. Crie uma conta no [Vercel](https://vercel.com/)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `GOOGLE_CALENDAR_CLIENT_ID`
   - `GOOGLE_CALENDAR_CLIENT_SECRET`
   - `GOOGLE_CALENDAR_REDIRECT_URI` (atualize para a URL de produção)
   - `PIPEFY_API_TOKEN`
   - `PIPEFY_PIPE_ID`
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
4. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com:
- **Railway**
- **Render**
- **Heroku**
- **AWS** (EC2, ECS, Lambda)
- **Google Cloud** (Cloud Run, App Engine)

---

## ✅ Critérios de Sucesso

Este projeto atende aos **critérios de sucesso** estabelecidos pela Verzel:

### 1. Conversa Natural ✅

- ✅ Perguntas **progressivas** (uma de cada vez)
- ✅ **Resumos claros** após coletar informações
- ✅ Tom **profissional e empático**

### 2. Confirmação Explícita de Interesse ✅

- ✅ Pergunta direta: "Você gostaria de seguir com uma conversa..."
- ✅ Gatilho para agendamento somente após confirmação

### 3. Agendamento Criado e Confirmado ✅

- ✅ Criação automática via **Google Calendar API**
- ✅ Envio de convite por e-mail
- ✅ Link do Google Meet incluído

### 4. Leads Persistidos no Pipefy ✅

- ✅ **Todos os leads** são registrados
- ✅ Status adequado conforme resultado
- ✅ Atualização de cards existentes (evita duplicação)

### 5. Recontato Atualiza Card ✅

- ✅ Busca por e-mail
- ✅ Atualiza card existente
- ✅ Mantém histórico

### 6. Código Bem Estruturado e Documentado ✅

- ✅ Arquitetura clara e escalável
- ✅ TypeScript com tipagem forte
- ✅ Comentários e documentação
- ✅ README detalhado

### 7. Repositório GitHub ✅

- ✅ Código versionado
- ✅ README completo
- ✅ Instruções de instalação e execução

### 8. Deploy na Vercel ✅

- ✅ Compatível com Vercel
- ✅ Configuração de variáveis de ambiente
- ✅ Deploy automático via GitHub

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| **Linhas de Código** | ~5.000+ |
| **Componentes React** | 15+ |
| **Routers tRPC** | 3 |
| **Integrações** | 3 (OpenAI, Google Calendar, Pipefy) |
| **Tabelas no Banco** | 4 |
| **Tempo de Desenvolvimento** | ~8 horas |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto foi desenvolvido para a **Verzel** como parte de um desafio técnico.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para a **Verzel**

**Parceiros:**
- Devaria
- AWS
- Grupo Primo
- DocuSign

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a seção [Solução de Problemas](#solução-de-problemas)
2. Consulte o terminal do servidor para erros detalhados
3. Abra uma issue no GitHub (se aplicável)

---

## 🎉 Agradecimentos

- **Verzel** pela oportunidade
- **OpenAI** pela API GPT-4
- **Google** pela Calendar API
- **Pipefy** pela API GraphQL
- **Comunidade Open Source** pelas bibliotecas utilizadas

---

**🚀 Pronto para começar? Siga o [Guia de Instalação](#instalação)!**

