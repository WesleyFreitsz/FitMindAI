# 🧠 FitMind AI - Assistente de Fitness e Nutrição com IA

## 🚀 Sobre o Projeto

O **FitMind AI** é uma aplicação **fullstack de fitness e nutrição** que utiliza **Inteligência Artificial** para proporcionar uma experiência de usuário intuitiva e inteligente.

O objetivo é ajudar os usuários a **monitorar sua dieta, registrar exercícios e obter insights personalizados** de forma simplificada.

A principal funcionalidade é um **chatbot com IA** (usando a API do **Google Gemini**) que interpreta a linguagem natural do usuário para registrar refeições — eliminando a necessidade de preencher formulários manuais.

🔗 **Versão ao vivo:** [fitmind-ai-blue.vercel.app](https://fitmind-ai-blue.vercel.app)

---

## ✨ Principais Funcionalidades

- **🤖 Registro de Refeições por IA:**
  Registre alimentos conversando com o assistente.
  Exemplo: `comi 200g de frango e 150g de arroz`.
  A IA processa, calcula os nutrientes e salva automaticamente.

- **📊 Dashboard Diário:**
  Visualize um resumo completo do seu dia, incluindo:

  - Anel de calorias líquidas
  - Barras de progresso para macronutrientes
  - Resumo de todas as refeições

- **👤 Perfil e Metas:**
  Personalize seu perfil com peso, altura e nível de atividade.
  O app calcula suas metas diárias de calorias e macros automaticamente.

- **🗓️ Calendário de Progresso:**
  Acompanhe seu histórico diário em um calendário visual com marcações dos dias em que você atingiu suas metas.

- **🔐 Autenticação Completa:**
  Sistema de login e registro de usuários com sessões seguras gerenciadas via **express-session** e **passport.js**.

---

## 🚧 Recursos em Desenvolvimento

- **🏋️ Registro de Treinos por IA:**
  A IA será capaz de interpretar e registrar atividades físicas, calculando as calorias queimadas.
  Exemplo: `corri por 30 minutos em ritmo moderado`.

- **💬 Chat para Perguntas Gerais:**
  O assistente responderá dúvidas sobre nutrição, fitness e bem-estar, atuando como um **coach de bolso**.

- **⏰ Alarmes Personalizados:**
  Crie lembretes inteligentes para refeições, treinos e hidratação, ajudando a manter sua rotina em dia.

---

## 🛠️ Stack Tecnológico

### **Front-End**

- ⚛️ Framework: **React** com **Vite**
- 🟦 Linguagem: **TypeScript**
- 🎨 Estilização: **Tailwind CSS**
- 🔁 Gerenciamento de Estado: **TanStack Query (React Query)**
- 🧩 Componentes: **Shadcn UI (Radix UI customizados)**
- 🧭 Roteamento: **Wouter**

### **Back-End**

- 🟢 Runtime: **Node.js**
- 🚀 Framework: **Express.js**
- 🟦 Linguagem: **TypeScript**
- 🗄️ Banco de Dados: **PostgreSQL (NeonDB)**
- 🧱 ORM: **Drizzle ORM**
- 🔐 Autenticação: **Passport.js (passport-local)**
- 🧠 Inteligência Artificial: **Google Gemini API**

---

## 🔧 Rodando o Projeto Localmente

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/WesleyFreitsz/FitMindAI.git
cd FitMindAI
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure o Banco de Dados

O projeto utiliza **PostgreSQL**. Você pode usar uma instância local ou um serviço em nuvem (como o **Neon**).

Crie um arquivo `.env` na raiz do projeto e adicione:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### 4️⃣ Configure a API de IA

Obtenha uma chave da **Google Gemini API** em [Google AI Studio](https://aistudio.google.com/).

Adicione ao `.env`:

```env
GOOGLE_API_KEY="SUA_CHAVE_API_AQUI"
```

### 5️⃣ Aplique as migrações do banco de dados

```bash
npm run db:push
```

### 6️⃣ Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O comando acima iniciará tanto o **back-end (Express)** quanto o **front-end (Vite)** em um único processo.

Acesse o app em:
👉 [http://localhost:5000](http://localhost:5000)

---

💡 **FitMind AI** — unindo dados, IA e motivação para transformar sua rotina fitness.
