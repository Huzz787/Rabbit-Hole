# The Rabbit Hole 🐇 — AI Knowledge Explorer

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Aiven-336791?style=flat&logo=postgresql)](https://aiven.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B2?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**The Rabbit Hole** is an interactive, curiosity-driven AI knowledge discovery platform. Users can search any topic or concept, dynamically uncover interrelated ideas powered by Google Gemini AI, delve infinitely deeper through an interactive 2D physics force graph, and bookmark personal discoveries with custom research notes.

---

## 🌟 Key Features

- **Dynamic AI Knowledge Expansion**: Uses Google Gemini (`gemini-2.5-flash`) via the official `@google/genai` SDK to dynamically synthesize rich summaries, fascinating historical/scientific facts, and curated related topics for any query.
- **Interactive Force-Directed Knowledge Graph**: Powered by `react-force-graph-2d`, providing fluid physics-based graph exploration with zoom, pan, node expansion on click, and hover metadata cards.
- **Infinite Rabbit Hole Exploration**: Click any connected node in the graph to branch out into new sub-disciplines, automatically querying Gemini and linking new relational nodes with edge labels and relationship strengths.
- **Saved Discoveries & Research Notebook**: Save topics to your personal discovery notebook with editable markdown research notes.
- **Exploration Journey History**: Tracks session-based exploration journeys and steps with instant revisit capabilities.
- **Resilient Offline & Outage Fallback**: Built-in deterministic synthesis fallback to ensure uninterrupted discovery even during API latency, rate limits, or connectivity interruptions.
- **Enterprise-Grade Security**: Strict server-side isolation for Gemini API keys and database credentials; client requests never receive or leak sensitive tokens.
- **Modern Responsive Design**: Crafted with Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide icons, and Framer Motion animations.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) with React 19 |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database** | [Aiven PostgreSQL](https://aiven.io/) (with SSL/TLS `sslmode=require`) |
| **ORM** | [Prisma ORM 6](https://www.prisma.io/) (with connection pooling & automated schema sync) |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) via `@google/genai` |
| **Visualization** | [React Force Graph 2D](https://github.com/vasturiano/react-force-graph) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod 4](https://zod.dev/) for structured AI output parsing |

---

## 📁 Project Structure

```text
Rabbit Hole/
├── app/                        # Next.js App Router pages and API endpoints
│   ├── about/page.tsx          # About page detailing philosophy & architecture
│   ├── api/                    # Serverless API routes
│   │   ├── graph/route.ts      # Graph data fetcher (nodes and edges)
│   │   ├── health/route.ts     # Health and connectivity probe
│   │   ├── history/route.ts    # Session exploration history endpoint
│   │   ├── saved/route.ts      # Saved discoveries and research notes CRUD
│   │   ├── topics/route.ts     # Topic retrieval and seed list
│   │   └── topics/expand/route.ts # Gemini AI topic expansion
│   ├── explore/page.tsx        # Topic exploration view
│   ├── history/page.tsx        # User journey & session history
│   ├── map/page.tsx            # Fullscreen interactive knowledge universe
│   ├── saved/page.tsx          # Saved discoveries notebook
│   ├── globals.css             # Tailwind CSS v4 styling rules
│   ├── layout.tsx              # Root HTML shell & navigation bar
│   └── page.tsx                # Homepage / Hero with trending discoveries
├── components/                 # Reusable UI components
│   ├── exploration/            # Topic cards, expansion modals, detail panels
│   ├── graph/                  # ForceGraphClient & KnowledgeGraph canvas
│   ├── home/                   # HeroSection and TrendingDiscoveries
│   ├── layout/                 # Navbar, Footer, and responsive wrappers
│   └── ui/                     # Accessible buttons, badges, inputs
├── lib/                        # Server & utility libraries
│   ├── data/                   # Curated starter topics & sample graphs
│   ├── database/prisma.ts      # Prisma client singleton with sanitizer
│   ├── gemini/                 # Gemini AI client and expansion service
│   └── utils/                  # Session tracking and UI helpers
├── prisma/                     # Database schemas
│   └── schema.prisma           # Prisma schema (Topic, TopicConnection, etc.)
├── scripts/                    # Test and verification scripts
│   ├── run-e2e-qa.ts           # Comprehensive 15-point E2E QA test suite
│   ├── verify-aiven.ts         # Aiven PostgreSQL connectivity verifier
│   └── verify-gemini-integration.ts # Gemini API validation script
├── public/                     # Static public assets
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory for local development:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Aiven PostgreSQL Connection String (must include sslmode=require)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Google Gemini API Key (Server-side only)
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

> ⚠️ **Security Notice:** Never commit `.env` or `.env.local` files to Git. Both `DATABASE_URL` and `GEMINI_API_KEY` are server-side environment variables and are never exposed to client browsers.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 20+ installed
- PostgreSQL database (e.g. Aiven PostgreSQL)
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Push Database Schema (if initializing fresh database)
```bash
npm run db:push
```

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

Run the comprehensive end-to-end QA test suite:

```bash
npm run qa:test
```

This automated test suite verifies:
1. **API Key Security & Masking** (server-only isolation)
2. **Database TLS/SSL Security** (`sslmode=require` verification)
3. **Aiven PostgreSQL Connectivity & Introspection Safety**
4. **Database Table Preservation** (zero table dropping or data loss)
5. **Gemini Topic Expansion & Schema Validation**
6. **Graph Persistence in PostgreSQL** (nodes and relational edges)
7. **Duplicate Connection Prevention & Edge Deduplication**
8. **Multi-level Branch Node Expansion**
9. **Saved Discoveries & Custom Research Notes CRUD**
10. **Inline Research Notes Updates**
11. **Exploration Journey History Tracking**
12. **Session Isolation** (user privacy and bookmark isolation)
13. **Graceful Offline Fallback** (AI synthesis during outages)
14. **Input Validation & Edge Case Handling**
15. **Automatic Test Artifact Cleanup**

### Additional Quality Checks
```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint code style check
npm run lint

# Production build verification
npm run build
```

---

## 🚀 Deployment to Vercel

The Rabbit Hole is optimized for zero-config serverless deployment on [Vercel](https://vercel.com/).

### 1. Push to GitHub
Ensure the project is committed and pushed to your GitHub repository:
```bash
git push -u origin main
```

### 2. Import into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository: `https://github.com/Huzz787/Rabbit-Hole`.

### 3. Configure Environment Variables
Under **Environment Variables**, add:
- `DATABASE_URL`: Your full Aiven PostgreSQL connection string (including `?sslmode=require`).
- `GEMINI_API_KEY`: Your Google Gemini API key.

### 4. Deploy
- Vercel automatically runs `postinstall: "prisma generate"` during the install phase.
- Vercel executes `npm run build` using Next.js App Router and Turbopack.
- Click **Deploy** to launch the production site.

---

## 📄 License

This project is licensed under the MIT License.
