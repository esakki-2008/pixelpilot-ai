"use client";

import { useState } from "react";
import CloudinaryUpload from "../components/cloudinary-upload";
import { ArrowUpRight, BarChart3, BrainCircuit, Cloud, ImageIcon, Menu, Sparkles, Zap } from "lucide-react";

type Asset = {
  url?: string;
  public_id?: string;
  format?: string;
  width?: number;
  height?: number;
  analysis?: {
    product: string;
    category: string;
    summary: string;
    mediaHealth: number;
    quality: string;
    platformReadiness: string;
    tags: string[];
    issues: string[];
    opportunities: string[];
    recommendation: string;
  };
  analyzing?: boolean;
  analysisError?: string;
};

const insights = [
  { label: "Media Health", value: "84%", note: "+12% this week", icon: BarChart3 },
  { label: "Assets Ready", value: "128", note: "of 146 assets", icon: ImageIcon },
  { label: "Opportunities", value: "17", note: "AI identified", icon: Sparkles },
  { label: "Cloudinary", value: "Connected", note: "Media pipeline active", icon: Cloud },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);

  const handleUploaded = async (asset: Asset & { secure_url?: string }) => {
    const index = uploadedAssets.length;
    const url = asset.secure_url || asset.url;
    setUploadedAssets((current) => [...current, { ...asset, url, analyzing: Boolean(url) }]);

    if (!url) return;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format: asset.format, width: asset.width, height: asset.height }),
      });
      const data = await response.json();

      setUploadedAssets((current) =>
        current.map((item, i) =>
          i === index
            ? data.analysis
              ? { ...item, analysis: data.analysis, analyzing: false }
              : { ...item, analyzing: false, analysisError: data.error || "AI analysis is not configured yet." }
            : item,
        ),
      );
    } catch {
      setUploadedAssets((current) =>
        current.map((item, i) =>
          i === index ? { ...item, analyzing: false, analysisError: "Analysis request failed." } : item,
        ),
      );
    }
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><div><div className="brand-name">PixelPilot</div><div className="brand-tag">Turn media into business momentum.</div></div></div>
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"><Menu /></button>
        <nav className={mobileOpen ? "nav open" : "nav"}>
          <a href="#dashboard">Dashboard</a><a href="#media">Media</a><a href="#insights">AI Insights</a><a href="#campaigns">Campaigns</a><button className="profile">ES</button>
        </nav>
      </header>

      <section className="hero" id="dashboard">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> AI BUSINESS COPILOT</div>
          <h1>Your media already contains <span>growth signals.</span></h1>
          <p>PixelPilot turns product images and marketing assets into actionable insights, optimized media, and smarter growth decisions.</p>
          <div className="hero-actions">
            <CloudinaryUpload onUploaded={handleUploaded} />
            <button className="secondary"><BrainCircuit size={17} /> Ask PixelPilot</button>
          </div>
        </div>
        <div className="hero-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Sparkles size={30} /></div><div className="orbit-pill pill-a">Analyze</div><div className="orbit-pill pill-b">Optimize</div><div className="orbit-pill pill-c">Grow</div></div>
      </section>

      <section className="stats" id="insights">{insights.map(({ label, value, note, icon: Icon }) => <article className="stat-card" key={label}><div className="stat-icon"><Icon size={18} /></div><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div></article>)}</section>

      <section className="workspace" id="media">
        <div className="section-heading"><div><div className="eyebrow">MEDIA INTELLIGENCE</div><h2>Make every asset work harder.</h2></div><button className="text-button">View media library <ArrowUpRight size={15} /></button></div>
        <div className="workspace-grid">
          <article className="panel media-panel">
            <div className="panel-top"><div><h3>Recent media</h3><p>Managed and delivered through Cloudinary</p></div><span className="status"><span /> Live</span></div>
            <div className="media-grid">
              {uploadedAssets.length ? uploadedAssets.map((asset, i) => (
                <div className="media-tile" key={asset.public_id ?? i}>
                  <img className="uploaded-media" src={asset.url} alt={asset.public_id ?? "Uploaded asset"} />
                  <span>{asset.public_id?.split("/").pop() ?? "Uploaded asset"}</span>
                  {asset.analyzing && <span className="analysis-loading">Analyzing with AI…</span>}
                  {asset.analysis && <div className="analysis-mini"><b>{asset.analysis.mediaHealth}/100 Media Health</b><span>{asset.analysis.product} · {asset.analysis.platformReadiness}</span><small>{asset.analysis.recommendation}</small></div>}
                  {asset.analysisError && <span className="analysis-error">{asset.analysisError}</span>}
                </div>
              )) : ["Product 01","Product 02","Product 03","Product 04","Product 05","Product 06"].map((name, i) => <div className="media-tile" key={name}><div className={"media-placeholder tone-" + (i + 1)}><ImageIcon size={25} /></div><span>{name}</span></div>)}
            </div>
          </article>

          <article className="panel insight-panel"><div className="panel-top"><div><h3>AI recommendations</h3><p>What PixelPilot sees right now</p></div><Zap size={19} /></div>
            <div className="recommendation"><span className="priority high">HIGH</span><strong>5 products are campaign-ready</strong><p>Strong image quality and consistent branding detected.</p></div>
            <div className="recommendation"><span className="priority medium">MEDIUM</span><strong>12 assets need optimization</strong><p>Generate social-ready variants before publishing.</p></div>
            <div className="recommendation"><span className="priority opportunity">OPPORTUNITY</span><strong>Weekend promotion detected</strong><p>PixelPilot can prepare a campaign from your best assets.</p></div>
            <button className="copilot-button"><BrainCircuit size={17} /> Open AI Copilot <ArrowUpRight size={15} /></button>
          </article>
        </div>
      </section>

      <section className="flow" id="campaigns"><div className="eyebrow">THE PIXELPILOT LOOP</div><h2>From pixels to decisions.</h2><div className="flow-row">{["Upload","Understand","Optimize","Recommend","Create","Grow"].map((item, i) => <div className="flow-step" key={item}><span>0{i + 1}</span><strong>{item}</strong>{i < 5 && <ArrowUpRight size={14} />}</div>)}</div></section>
      <footer><span>PixelPilot</span><span>AI-powered business media intelligence</span><span>Cloudinary-first architecture</span></footer>
    </main>
  );
}
