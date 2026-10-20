# Zen Internal Super-App (PWA)

Operational Progressive Web Application for **Zen Family Spa & Reflexology**.

## 🌟 Key Features
- **Mobile-Adaptive Architecture**: Seamless mobile layout (sticky header, bottom navigation bar) and desktop experience (expanded modular sidebar).
- **Zen Brand Identity**: Tailored color palette using Zen Matcha (`#889D35`), Sand (`#D2C0A7`), Linen (`#F8F5F1`), River Stone (`#3C3C32`), and Moss (`#6E8027`).
- **Progressive Web App (PWA)**: Offline precaching, installable on Android & iOS, powered by `vite-plugin-pwa` and Workbox.
- **Enterprise Authentication**: Google OAuth integration mapped to Supabase (`profiles` and `users_profile`) with default role `12` (`OPERATIONAL_STAFF`).

## 🛠️ Tech Stack
- **Framework**: React 18, TypeScript, Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend / Auth**: Supabase JS Client (`@supabase/supabase-js`)
- **PWA**: `vite-plugin-pwa`

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in the required Supabase credentials:
```bash
cp .env.example .env
```

### 4. Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```
