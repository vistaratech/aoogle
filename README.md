<div align="center">

# 🌐 Aoogle — The Next-Gen AI Search Engine
### **Google Alternative for AI Discovery • Built with React 19 & Vite**
*Find the exact AI tool for any task in milliseconds. No 25-page affiliate blogs. No sponsored ads. Pure utility.*

[![Commercial Asset](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge&logo=shopify)](#-commercial--acquisition-overview)
[![Monetization](https://img.shields.io/badge/Monetization-4%20Built--in%20Engines-blue?style=for-the-badge&logo=stripe)](#-monetization-architecture)
[![Server Cost](https://img.shields.io/badge/Hosting%20Cost-%240%20%2F%20mo%20(Serverless)-orange?style=for-the-badge&logo=cloudflare)](#-zero-infrastructure-cost)
[![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Vite%208-61DAFB?style=for-the-badge&logo=react)](#-technical-architecture)
[![Live Web Search](https://img.shields.io/badge/Search-Dual--Engine%20Crawler-34A853?style=for-the-badge&logo=google)](#-dual-engine-search-pipeline)
[![Cloudflare Ready](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare)](#-deployment-guide)

<br/>

[**Live Demo**](http://localhost:5173) •
[**Core Features**](#-core-features--capabilities) •
[**Deep Dive Analysis**](#-deep-dive-project-architecture) •
[**Monetization**](#-monetization-architecture) •
[**Deployment**](#-deployment-guide) •
[**SEO & Indexing**](#-google-search-indexing--faq) •
[**Acquisition**](#-commercial--acquisition-overview)

</div>

---

## 📌 Executive Overview: What is Aoogle?

**Aoogle** (`/eɪ-uː-ɡəl/`) is an open-source, Google-alternative search engine engineered specifically for the **$1.3 Trillion Artificial Intelligence ecosystem**. 

### The Core Problem with Google Today
When users search Google for tools:
> *"Best AI tool to remove background from video"* or *"AI tool to review code"*

They are bombarded with:
1. **Top 4-5 sponsored Google Ads** bidding for ad dollars rather than quality.
2. **SEO affiliate listicle spam** (*"Top 35 AI Tools in 2026 - You Won't Believe #7!"*) written solely to harvest clicks.
3. **Outdated directory spreadsheets** with broken links and discontinued tools.
4. **Zero direct answers** regarding pricing (Free, Freemium, or Paid) without forcing a signup.

### The Aoogle Solution
Aoogle eliminates the noise:
- **Search by Task, Not by Brand**: Users search for real human intents (*"remove a background"*, *"clone a voice"*, *"review my code"*, *"summarize a meeting"*).
- **AI Decision Engine**: Instantly generates an AI overview comparing the **Top Recommendation**, **Best Free Option**, and **Quick Alternative** with actionable verdicts.
- **Dual-Engine Search**: Combines a verified local database of 200+ top AI tools with an **active real-time internet crawler** for zero-latency discovery.
- **Voice Search**: Hands-free search powered natively by the Web Speech API.
- **Pixel-Perfect Single-Page UX**: Zero-scroll Google aesthetic with dark glassmorphism and crisp light modes.
- **$0/month Serverless Cost**: Runs entirely on the edge (Cloudflare Workers / Pages / Vercel / Netlify) with 99%+ profit margins.

---

## ✨ Core Features & Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                AOOGLE SEARCH SYSTEM                              │
└──────────────────────────────────────────────────────────────────────────────────┘
         │                                                        │
         ▼                                                        ▼
┌─────────────────────────────────┐              ┌─────────────────────────────────┐
│       FRONTEND EXPERIENCE       │              │      SEARCH & REASONING CORE    │
├─────────────────────────────────┤              ├─────────────────────────────────┤
│ • Zero-scroll Single-Page Home  │              │ • Task-First Relevance Scorer   │
│ • Google-style Results Page     │              │ • Real-time AI Decision Guide   │
│ • Web Speech API Voice Search   │              │ • Live Internet Fallback Crawler│
│ • Sub-5ms Autocomplete Dropdown │              │ • 1000+ AI Tools Extended DB    │
│ • Pricing Filters (Free/Paid)   │              │ • Edge Worker Proxy (/api/...)  │
│ • Persistent Dark/Light Themes  │              │ • Community Tool Indexer        │
└─────────────────────────────────┘              └─────────────────────────────────┘
```

| Feature | Technical Implementation | User Benefit |
| :--- | :--- | :--- |
| 🎯 **Task-First Ranking** | `src/lib/search.js` weighted multi-word scoring | Directly answers *"what tool does this job?"* in under 5ms. |
| 🧠 **AI Decision Guide** | `src/components/AiDecisionGuide.jsx` + `aiDecision.js` | Highlights #1 Top Pick, Best Free Tool, and Quick Alternative. |
| 🌐 **Live Web Search** | `src/lib/webSearch.js` + `src/worker.js` edge handler | Searches the live web for newly released tools not yet in index. |
| 🎙️ **Voice Search** | `src/components/SearchBar.jsx` via Web Speech API | Hands-free voice query input with animated waveform pulse. |
| 🏷️ **15+ Category Explorers** | `src/data/tools.js` taxonomy across all AI domains | Image, Video, Audio, Code, Writing, 3D, Design, Meetings, etc. |
| 💰 **Pricing Tier Filter** | Instant reactive filtering in `src/App.jsx` | One-click filter for **Free**, **Freemium**, and **Paid** tools. |
| ➕ **Creator Submissions** | `src/components/SubmitToolModal.jsx` | Lets AI founders submit tools with instant `localStorage` caching. |
| 🌗 **Dark & Light Mode** | `src/index.css` design tokens with persistent memory | Sleek ambient glassmorphism or clean Google daylight theme. |
| 📱 **Adaptive Viewport** | CSS `dvh` units + responsive media queries | Zero-overflow, strictly unified single-page layout on mobile & PC. |

---

## 🔍 Deep-Dive Project Architecture

### 1. File Structure & Component Breakdown

```
aoogle/
├── 📁 public/
│   ├── favicon.svg             # Multi-layer SVG vector logo with coral pulse dot
│   └── poster.html             # Clean product showcase & media preview asset
├── 📁 src/
│   ├── 📁 components/          # 10 modular React 19 UI components
│   │   ├── AiDecisionGuide.jsx # Smart "Which AI tool is best?" recommendation panel
│   │   ├── CategoryIcons.jsx   # 6-card primary category grid with tinted glass
│   │   ├── ResultCard.jsx      # Tool card with pricing badges, task tags & links
│   │   ├── SearchBar.jsx       # Search input with voice recognition & autocomplete
│   │   ├── SearchHeader.jsx    # Sticky Google-style results header
│   │   ├── SubmitToolModal.jsx # Community tool submission modal
│   │   ├── ThemeToggle.jsx     # Smooth Dark/Light mode toggle switch
│   │   ├── TrendingChips.jsx   # Horizontal trending task pills
│   │   ├── WebSearchResults.jsx# Live internet crawler results shelf
│   │   └── icons.jsx           # Pure SVG icon library (zero heavy icon dependencies)
│   ├── 📁 data/
│   │   └── tools.js            # Curated database of 200+ categorized AI tools
│   ├── 📁 lib/
│   │   ├── aiDecision.js       # Real-time AI verdict synthesis & local heuristic engine
│   │   ├── search.js           # Multi-word weighted relevance scoring algorithm
│   │   └── webSearch.js        # Live internet discovery crawler & 1000+ extended DB
│   ├── App.jsx                 # Central application state, routing & view controller
│   ├── index.css               # Unified design system tokens, themes & layout rules
│   ├── main.jsx                # React 19 DOM root mount
│   └── worker.js               # Cloudflare Worker for edge routing & /api/websearch
├── index.html                  # SEO metadata, Open Graph, Twitter & Schema.org JSON-LD
├── package.json                # Dependencies, scripts & build config
├── vite.config.js              # Vite 8 config with local dev server web search proxy
└── wrangler.json               # Cloudflare Workers Builds configuration
```

---

## 🔬 How the Search & Ranking Algorithms Work

### Layer 1: In-Memory Multi-Word Relevance Scorer (`src/lib/search.js`)
Unlike naive string `indexOf` or bloated fuzzy libraries that yield false positives, Aoogle uses a **weighted intent formula**:

$$\text{Score} = (\text{Exact Phrase} \times 15) + (\text{Multi-Word Tag} \times 10) + (\text{Category Match} \times 6) + (\text{Token Match} \times 4) + (\text{Fuzzy Partial} \times 1.5)$$

1. **Stopword Stripping**: Removes noise words (`"best"`, `"top"`, `"for"`, `"how"`, `"tool"`, `"ai"`, `"app"`).
2. **Precomputed Haystacks**: Normalizes `name`, `tags`, `description`, `category`, and `bestFor` once into an in-memory index on initial boot.
3. **Threshold Gate**: Any tool scoring below 35% of the highest matching candidate is purged to prevent irrelevant spam.

### Layer 2: Real-Time Internet Fallback Crawler (`src/lib/webSearch.js` & `worker.js`)
When a user searches, Aoogle doesn't just check its database:
1. It simultaneously executes a background query to `/api/websearch?q={task}`.
2. The edge handler (Cloudflare Worker or Vite dev proxy) queries real-time web engines, filters ads, extracts clean metadata, and returns newly launched tools.
3. Results are displayed in a dedicated **`🟢 Live from the Web`** shelf with instant external links.

### Layer 3: AI Decision Engine (`src/lib/aiDecision.js`)
Every search triggers an intelligent evaluation that extracts:
- **🏆 Top Recommendation**: Highest-scored industry-standard tool.
- **⚡ Best Free Option**: Best tool with a zero-cost tier or open-source license.
- **💡 Quick Alternative**: Browser-friendly or lightweight substitute.

---

## 💰 Monetization Architecture

Aoogle is built with **4 pre-architected revenue channels**, creating an immediate turnkey business:

```
                            ┌──────────────────────────────────────────────┐
                            │          AOOGLE REVENUE CHANNELS             │
                            └──────────────────────────────────────────────┘
                                                    │
         ┌──────────────────┬───────────────────────┴───────────────────────┬──────────────────┐
         ▼                  ▼                                               ▼                  ▼
  ┌──────────────┐   ┌──────────────┐                                ┌──────────────┐   ┌──────────────┐
  │  AI Tool     │   │  Sponsored   │                                │  Creator Sub-│   │ White-Label  │
  │  Affiliates  │   │  Placements  │                                │  mission Fee │   │ Enterprise   │
  │  20% - 50%   │   │  $199 - $599 │                                │  $49 - $149  │   │ $2k - $10k   │
  │  Recurring   │   │  /mo/keyword │                                │  Fast-Track  │   │ Licensing    │
  └──────────────┘   └──────────────┘                                └──────────────┘   └──────────────┘
```

1. **AI Tool Affiliate Commissions**:
   - Major AI tools (Jasper, ElevenLabs, Copy.ai, Cursor, CodeRabbit) offer **20% to 50% recurring lifetime commissions**.
   - Simply insert your affiliate tracking tags into `src/data/tools.js`.
2. **Sponsored Keyword Slots**:
   - Charge AI startups to be pinned as the *"Top Recommendation"* or top search result for high-intent keywords (*"voice clone"*, *"video edit"*, *"code assistant"*).
3. **Creator Fast-Track Submissions**:
   - Charge AI creators $49 – $149 for guaranteed 24-hour verification, do-follow backlink, and permanent indexing.
4. **White-Label Reselling**:
   - Resell vertical instances (e.g., *"Legal AI Search"*, *"Medical AI Search"*, *"Internal Enterprise AI Hub"*).

---

## ⚡ Zero Infrastructure Cost

| Metric | Traditional Web App | Aoogle |
| :--- | :--- | :--- |
| **Server Hosting** | $150 – $600 / month (EC2, Heroku) | **$0.00 / month** (Cloudflare Pages, Vercel, Netlify) |
| **Database Cost** | $50 – $200 / month (PostgreSQL, Mongo) | **$0.00** (In-memory + client LocalStorage) |
| **Scaling Limit** | Crashes on viral traffic spikes | **Infinite auto-scale** via global Cloudflare Edge |
| **Maintenance** | High (DB backups, patches, migrations) | **Zero maintenance** |
| **Profit Margin** | 40% – 60% | **95% – 99%** |

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/vistaratech/aoogle.git

# 2. Navigate to project folder
cd aoogle

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Open your browser at **`http://localhost:5173`**.

### Production Build

```bash
# Compile optimized production bundle
npm run build

# Preview build locally
npm run preview
```

---

## ☁️ Deployment Guide

Aoogle can be deployed to any modern static or edge hosting platform in seconds:

### Option 1: Cloudflare Workers (Recommended)
This repository includes a native [`wrangler.json`](wrangler.json) and [`src/worker.js`](src/worker.js):

```bash
# Login to Cloudflare
npx wrangler login

# Deploy directly to Cloudflare edge
npx wrangler deploy
```

### Option 2: Vercel / Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Click **Deploy**!

---

## ⌨️ Power Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| <kbd>/</kbd> | Instantly focus the search bar from anywhere |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Navigate autocomplete suggestions |
| <kbd>Enter</kbd> | Execute search / select active suggestion |
| <kbd>Escape</kbd> | Dismiss suggestions / return to Home page |

---

## ❓ Google Search Indexing & FAQ

### Is there an open-source Google alternative for finding AI tools on GitHub?
**Yes! Aoogle is an open-source Google alternative search engine built specifically for discovering AI tools.** Instead of returning 20 affiliate blog posts or sponsored ad links, Aoogle allows you to search by actual task intent (*"remove background"*, *"transcribe audio"*, *"code review"*), giving you immediate verdicts with top recommendations, best free options, and real-time internet discoveries.

### What makes Aoogle different from other AI tool directories on GitHub?
Most AI directories are static spreadsheets or cluttered tables with no search intelligence. Aoogle features:
1. **A Google-grade single-page user interface** with instantaneous sub-millisecond response times.
2. **An AI Decision Engine** that automatically picks the #1 top recommendation and best free tool.
3. **A Live Internet Web Crawler** that discovers fresh tools across GitHub and open web directories in real time.
4. **Speech-to-Text Voice Search** for seamless, hands-free query input.

### How does the search algorithm find the right AI tool?
Aoogle uses a weighted relevance algorithm that scores exact multi-word task intents (`+10 pts`), keyword tags (`+3 pts`), brand names (`+2 pts`), and description summaries (`+1 pt`). Low-confidence spam matches are automatically filtered out.

### Can I run this AI search engine locally or self-host it?
Yes. Aoogle runs 100% client-side with zero backend server dependencies. You can clone the repository, run `npm install && npm run dev`, and deploy it for $0/month on Cloudflare Pages, Vercel, Netlify, or GitHub Pages.

---

## 🔍 Discovery Tags & Search Keywords

`ai tools search engine` • `google alternative for ai` • `find best ai tools github` • `ai search engine open source` • `task based ai search` • `ai tools directory 2026` • `free ai tools finder` • `best ai tool recommendation engine` • `google clone for ai tools` • `ai search react vite` • `speech to text ai search` • `live internet ai crawler`

---

## 💼 Commercial & Acquisition Overview

Aoogle is available for **complete asset acquisition, full IP transfer, or exclusive commercial licensing**.

### Included in Acquisition:
- ✅ **100% Full IP & Source Code Ownership** (No royalties, zero vendor lock-in)
- ✅ **Complete Commercial Freedom** (Rebrand, resell, or integrate into your product suite)
- ✅ **Curated 200+ Verified AI Tools Index + 1000+ Extended Knowledge Base**
- ✅ **Full Deployment Assets** (`wrangler.json`, `src/worker.js`, Vite configuration)
- ✅ **Direct Founder Handover & Transition Assistance**

### 📩 Acquisition Inquiries:
- **Founder / Seller**: Yohesh ([@vistaratech](https://github.com/vistaratech))
- **GitHub**: [github.com/vistaratech/aoogle](https://github.com/vistaratech/aoogle)
- **Direct Inquiry**: Submit an inquiry via GitHub Issues or platform messaging.

---

<div align="center">

### **Own the Future of AI Search Today.**

⭐ **Star this repository to support independent open-source search!** ⭐

Crafted with ❤️ by [Yohesh](https://github.com/vistaratech)

</div>
