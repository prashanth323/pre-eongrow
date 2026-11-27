# NextGen Future Network

> **Connect. Learn. Earn. Grow.**  
> India's premier multi-division professional networking and community ecosystem.

NextGen Future Network connects students, professionals, freelancers, creators, entrepreneurs, business owners, and investors under **one unified network**. A single user account can participate in multiple divisions simultaneously with dedicated workspaces, customizable profiles, independent subscription plans, and cryptographic QR event ticketing.

---

## 🌟 The Seven Ecosystem Divisions

| Division | Slug | Tagline | Membership Model |
| :--- | :--- | :--- | :--- |
| **Student Network** | `student` | Future Leaders & Innovators | **100% Free Forever** (Zero subscription fees) |
| **Career & Professional** | `career` | Working Professionals & Tech Talent | Free Basic & Annual Pro Plans |
| **Freelancer & Creator** | `freelancer` | Independent Builders & Designers | Free Basic & Premium Creator Club |
| **Entrepreneur & Startup** | `entrepreneur` | Early-Stage Founders & Builders | Founder Incubator & Growth Plans |
| **Business Owners** | `business` | MSMEs, Retail & Enterprise | Verified Merchant & Business Network |
| **Influencers & Media** | `influencer` | Brand Creators & Journalists | Media Creator Pass |
| **Investors & Strategic** | `investor` | Angels, VCs & Strategic Partners | Accredited Investor Circle |

---

## 🎨 Visual Design Language

Inspired by high-end modern SaaS aesthetics:
- **Primary Dark Green**: `#07583F`
- **Primary Green**: `#087A52`
- **Accent Green**: `#24A675`
- **Light Green Surface**: `#EAF5EF`
- **Main Background**: `#F4F6F4`
- **Card Background**: `#FFFFFF`
- **Primary Text**: `#171C19`
- **Secondary Muted Text**: `#818A84`
- **Border**: `#E8ECE9`
- **Typography**: Plus Jakarta Sans / Inter with clean line heights and balanced spacing.
- **Micro-interactions**: Rounded cards (12–20px), subtle borders over heavy shadows, and accessible status indicators.

---

## 🚀 Key Platform Features

### 1. Single Central Account with Multi-Division Memberships
- One unified identity stored in `public.profiles` linked to Supabase Auth (`auth.users`).
- Users can join multiple divisions without creating new accounts.
- Division-specific metadata stored in `public.user_division_memberships`.

### 2. Student Network Policy Guarantee
- As mandated by the business rules, Student Network registration and membership are completely free.
- Students are never prompted to buy a subscription to explore opportunities, find mentors, or view events.
- Students only pay if they explicitly register for paid summit passes.

### 3. Concurrency-Safe QR Event Ticketing
- Integrated event registry with multi-tier ticket categories (Free Student Passes, General Admission, VIP).
- Instant digital tickets with cryptographically secure QR tokens rendered in real-time via HTML5 canvas.
- Security-gate scanner view (`QRScannerView`) utilizing the backend RPC `validate_event_ticket` with row-level locks (`FOR UPDATE`) to prevent race conditions, duplicate admissions, and fraudulent passes.
- Companion lightweight ticket app support for quick venue entry.

### 4. Interactive Testing Personas
The sidebar contains an instant **Role Persona Switcher** allowing you to test the platform under different lenses with one click:
- 🎓 **Student**: Aarav Sharma (Student + Freelancer member, explore opportunities, free membership guarantee).
- 🚀 **Founder**: Ananya Rao (Startup Founder & MSME business owner, discover talent and co-founders).
- 🛡️ **Admin**: Vikramaditya Verma (Super Admin with staff privileges, verification queue review, quota management, and QR event scanner).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, `qrcode`.
- **Backend & Auth**: Supabase (PostgreSQL 17, Row-Level Security, Edge Functions, Storage Buckets).
- **Database Schema**: 17 version-controlled migrations under `supabase/migrations/` covering 32 relational tables, triggers, indexes, and audited RPCs.
- **Edge Functions**:
  - `create-payment-order`: Prepares payment gateway orders (Razorpay/Stripe compatible).
  - `verify-payment`: Verifies payment signatures idempotently.
  - `payment-webhook`: Processes subscription & ticket webhooks.
  - `validate-ticket`: Venue check-in endpoint with tamper detection.

---

## 📂 Project Directory Structure

```
├── src/
│   ├── components/
│   │   ├── admin/            # Admin dashboard, audit logs, verification queue
│   │   ├── auth/             # Login, register, and forgot password modal
│   │   ├── common/           # Canvas QR code generator
│   │   ├── dashboard/        # Member overview dashboard & 7 Division Hubs
│   │   ├── directory/        # Searchable member directory with warm intros
│   │   ├── events/           # Summit calendar, ticket booking & QR wallet
│   │   ├── layout/           # Sticky Header & collapsible responsive Sidebar
│   │   ├── memberships/      # Tier comparisons & Student Guarantee pricing
│   │   ├── onboarding/       # Multi-step profile and division onboarding
│   │   ├── opportunities/    # Job, internship, gig, and co-founder board
│   │   ├── scanner/          # Gate scanner with camera preview & token validator
│   │   ├── settings/         # Profile editor, document upload & privacy controls
│   │   └── ui/               # Reusable Button, Card, Badge, Input, Modal, Avatar
│   ├── context/
│   │   ├── AuthContext.tsx       # Auth state, session management, demo personas
│   │   └── DivisionContext.tsx   # Active division switcher & catalog metadata
│   ├── lib/
│   │   ├── divisions.ts      # Metadata for all 7 network divisions
│   │   ├── supabase.ts       # Configured Supabase JavaScript client
│   │   └── utils.ts          # Formatters (INR currency, dates, classNames)
│   ├── pages/
│   │   └── LandingPage.tsx   # Public showcase landing page
│   ├── services/
│   │   └── dataService.ts    # Hybrid Supabase RPC client with realistic fallbacks
│   ├── types/
│   │   ├── app.types.ts      # Application view states, divisions, personas
│   │   └── database.types.ts # TypeScript definitions generated from Supabase
│   ├── App.tsx               # Main routing shell with code-split views
│   ├── index.css             # Tailwind v4 theme & color tokens
│   └── main.tsx              # React DOM root
├── supabase/
│   ├── config.toml           # Supabase CLI project configuration
│   ├── functions/            # Deno-based Edge Functions
│   └── migrations/           # 17 SQL migration scripts
└── package.json
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd nextgenfuture
npm install
```

### 2. Environment Configuration
The project is connected to the live Supabase project `zengxnuzpowqeiifdhin`. Create a `.env` file:
```env
VITE_SUPABASE_URL=https://zengxnuzpowqeiifdhin.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qe3gWe20F4t3erq0bCWaFw_wkkBoF0T
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📜 License
Proprietary — Developed for NextGen Future Network.
