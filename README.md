# PixelPilot

> **Turn media into business momentum.**

PixelPilot is an AI growth operating system for small businesses that turns existing media into business intelligence, optimized content, and actionable growth campaigns.

## HackIndia — Pixels to Products — Cloudinary AI Hackathon 2026

| Field | Details |
|---|---|
| Product | PixelPilot |
| Team | Quantum Nexus |
| Track | PS-03 — Your Media-Savvy Startup |
| Core technology | Cloudinary + Gemini 2.5 Flash |
| Live demo | https://pixelpilot-ai-neon.vercel.app/ |
| GitHub | https://github.com/esakki-2008/pixelpilot-ai |
| Video demo | https://youtu.be/N2amHpHvfVA?si=c2xFoQKQduppfPFp |

## The problem

Small businesses create product images and other media every day, but often lack the time and tools to understand which assets are useful, which need improvement, and how to turn them into campaigns.

## The solution

PixelPilot creates a continuous loop:

**Upload → Understand → Optimize → Recommend → Create → Grow**

A business can upload media, receive AI-powered asset intelligence, generate Cloudinary-optimized variants, discover growth opportunities, activate campaigns, generate platform-specific content, and ask the Business Copilot questions grounded in its workspace.

## Why Cloudinary is core

Cloudinary is part of the product workflow, not just hosting:

1. **Upload** — media enters the workspace through Cloudinary.
2. **Delivery** — assets are delivered through Cloudinary URLs.
3. **Optimization** — PixelPilot creates responsive variants using Cloudinary transformations such as `c_fill`, `q_auto`, and `f_auto`.
4. **Multi-channel creative delivery** — Instagram, Story, LinkedIn, and Web variants are generated from Cloudinary assets.
5. **Asset workflow** — source assets are connected to AI analysis, campaigns, and saved workspace history.

The judging flow can therefore demonstrate a visible Cloudinary chain:

**Upload → Cloudinary storage → AI understanding → Cloudinary transformation → optimized delivery → campaign creative**

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

```
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
```

## Tech stack

- Next.js 15.5.26
- React 19
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

Create `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
GEMINI_API_KEY=your_gemini_api_key
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo path

The demo video will be recorded only after the final QA and compliance checks.

Recommended product walkthrough:

1. Open PixelPilot and show the connected Cloudinary workspace.
2. Upload a product image.
3. Show Asset Intelligence with Media Health, readiness, issues, opportunities, and recommendation.
4. Open Creative Studio and show Cloudinary's optimized channel variants.
5. Activate a Growth Opportunity.
6. Generate a campaign and show Campaign Creatives plus Content Intelligence.
7. Ask Business Copilot: **“What should I promote first?”**
8. Finish with the AI Action Center.

## Submission assets

HackIndia final submission form: https://forms.gle/GtukHAhcua6fviicA  
Code freeze: **October 4, 2026 · 00:15 IST**. The final submission must include the public GitHub repository, live demo, 2–4 minute demo video, LinkedIn and X project-post links, team details, and confirmation of the mandatory Cloudinary feedback survey.


Before final submission, keep these ready:

- Public GitHub repository: https://github.com/esakki-2008/pixelpilot-ai
- Production demo: https://pixelpilot-ai-neon.vercel.app/
- 2–4 minute demo video
- HackIndia team/project submission
- Cloudinary feedback survey confirmation
- Final end-to-end smoke-test confirmation

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
- [x] Production deployment configured
- [ ] Final production smoke test
- [ ] Record 2–4 minute demo video
- [ ] Complete required Cloudinary feedback survey
- [ ] Final HackIndia submission form/repository links

## Security

Never commit API keys or secrets. Keep `.env.local` private and use environment variables for deployment. The public repository should contain only `.env.example` placeholders.
