# PixelPilot

> Turn media into business momentum.

PixelPilot is an AI growth operating system for small businesses that turns existing media into business intelligence, optimized content, and actionable growth campaigns.

## HackIndia — Pixels to Products — Cloudinary AI Hackathon 2026

- Track: PS-03 — Your Media-Savvy Startup
- Team: Quantum Nexus
- Core technology: Cloudinary + Gemini 2.5 Flash
- Product: PixelPilot

## The problem

Small businesses create product images and other media every day, but often lack the time and tools to understand which assets are useful, which need improvement, and how to turn them into campaigns.

## The solution

PixelPilot creates a continuous loop:

**Upload → Understand → Optimize → Recommend → Create → Grow**

A business can upload media, receive AI-powered asset intelligence, generate Cloudinary-optimized variants, discover growth opportunities, activate campaigns, generate platform-specific content, and ask the Business Copilot questions grounded in its workspace.

## Why Cloudinary is core

Cloudinary is part of the product workflow, not just hosting:

1. Upload — media enters the workspace through Cloudinary.
2. Delivery — assets are delivered through Cloudinary URLs.
3. Optimization — PixelPilot creates responsive variants using Cloudinary transformations such as c_fill, q_auto, and f_auto.
4. Multi-channel creative delivery — Instagram, Story, LinkedIn, and Web variants are generated from Cloudinary assets.
5. Asset workflow — source assets are connected to AI analysis, campaigns, and saved workspace history.

## AI intelligence

Gemini 2.5 Flash analyzes accessible media and returns structured intelligence including product, category, summary, media health, quality, platform readiness, tags, issues, opportunities, and recommendations.

The application avoids inventing business performance metrics such as revenue, conversion, or customer counts when those data sources are not connected.

## Product workflow

### 1. Media Library
Upload and search business media, filter analyzed assets, and inspect asset intelligence.

### 2. Asset Intelligence
Understand quality, readiness, issues, opportunities, and recommendations for each asset.

### 3. Creative Studio
Generate Cloudinary-delivered variants for Instagram 1080×1080, Story 1080×1920, LinkedIn 1200×627, and Web 1600×900.

### 4. Growth Opportunities
Convert AI-detected opportunities into campaign signals.

### 5. Campaign Studio
Generate campaign strategy, creatives, and platform-specific content packages.

### 6. Business Copilot
Ask practical business questions using analyzed workspace and saved campaign creation context.

### 7. AI Action Center
Turn detected issues and opportunities into executable next actions.

## Architecture

Business Media
     |
     v
Cloudinary Upload
     |
     +-- Optimized Delivery / Transformations
     |
     v
Next.js Application
     |
     +-- Gemini 2.5 Flash
     |      +-- Media Intelligence
     |
     +-- Business Intelligence
     |      +-- Health
     |      +-- Readiness
     |      +-- Opportunities
     |      +-- Action Center
     |
     +-- Campaign Intelligence
            +-- Content Packages
            +-- Cloudinary Creatives
            +-- Campaign History

## Tech stack

- Next.js 16
- React
- TypeScript
- Cloudinary
- next-cloudinary
- Gemini 2.5 Flash
- lucide-react
- Browser localStorage for demo workspace persistence

## Local setup

```bash
git clone https://github.com/esakki-2008/pixelpilot-ai.git
cd pixelpilot-ai
npm install
```

Create .env.local:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
GEMINI_API_KEY=your_gemini_api_key
```

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## Demo path

For a 2–4 minute presentation:

1. Open PixelPilot and show the connected Cloudinary workspace.
2. Upload a few product images.
3. Analyze an asset and show Media Health, readiness, issues, and opportunities.
4. Open Creative Studio and show Cloudinary's optimized channel variants.
5. Select a Growth Opportunity and activate a campaign.
6. Show generated campaign creatives and platform-specific content.
7. Open Business Copilot and ask: “What should I promote first?”
8. Finish at the AI Action Center and execute an action.

## Demo talking point

> PixelPilot does not stop at understanding media. It connects media intelligence to optimized delivery, growth recommendations, campaign creation, and concrete next actions.

## Submission checklist

- [x] Public GitHub repository
- [x] Cloudinary used as a core product workflow
- [x] AI media intelligence
- [x] Cloudinary transformations and optimized delivery
- [x] Campaign generation
- [x] Business Copilot
- [x] Action Center
- [x] Responsive startup-style UI
- [x] Environment template
- [ ] Record 2–4 minute demo video
- [ ] Verify public live demo before submission
- [ ] Complete required Cloudinary feedback survey
- [ ] Final submission form/repository links
- [ ] Final end-to-end smoke test

## Security

Never commit API keys or secrets. Keep .env.local private and use environment variables for deployment.
