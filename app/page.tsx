"use client";

import { useEffect, useState } from "react";
import CloudinaryUpload from "../components/cloudinary-upload";
import { ArrowUpRight, BarChart3, BrainCircuit, Cloud, ImageIcon, Menu, Sparkles, Zap, WandSparkles } from "lucide-react";

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

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);
  const [workspaceHydrated, setWorkspaceHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("pixelpilot-assets-v1");
      if (saved) setUploadedAssets(JSON.parse(saved));
    } catch {
      // Ignore malformed or unavailable browser storage.
    } finally {
      setWorkspaceHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!workspaceHydrated) return;
    try {
      window.localStorage.setItem("pixelpilot-assets-v1", JSON.stringify(uploadedAssets));
    } catch {
      // Ignore storage quota/privacy-mode errors; Cloudinary remains the source media store.
    }
  }, [uploadedAssets, workspaceHydrated]);
  const [copilotQuestion, setCopilotQuestion] = useState("Which uploaded product should I promote first?");
  const [copilotResult, setCopilotResult] = useState<{answer:string;actions:string[];opportunity:string;confidence:string} | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [campaignGoal, setCampaignGoal] = useState("Product awareness");
  const [campaignAudience, setCampaignAudience] = useState("Developers and tech-savvy users");
  const [campaignPlatform, setCampaignPlatform] = useState("LinkedIn");
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  const cloudinaryVariant = (url: string, width: number, height: number) => url.replace("/upload/", `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
  const analyzedAssets = uploadedAssets.filter((asset) => asset.analysis);
  const avgHealth = analyzedAssets.length
    ? Math.round(analyzedAssets.reduce((sum, asset) => sum + (asset.analysis?.mediaHealth ?? 0), 0) / analyzedAssets.length)
    : 0;
  const readyAssets = analyzedAssets.filter((asset) => asset.analysis?.platformReadiness === "Ready").length;
  const opportunityCount = analyzedAssets.reduce((sum, asset) => sum + (asset.analysis?.opportunities?.length ?? 0), 0);
  const issueCount = analyzedAssets.reduce((sum, asset) => sum + (asset.analysis?.issues?.length ?? 0), 0);
  const needsOptimization = analyzedAssets.filter((asset) => asset.analysis?.platformReadiness !== "Ready").length;
  const growthOpportunities = analyzedAssets.flatMap((asset) =>
    (asset.analysis?.opportunities ?? []).map((opportunity) => ({
      product: asset.analysis?.product || "Uploaded product",
      opportunity,
      health: asset.analysis?.mediaHealth ?? 0,
      readiness: asset.analysis?.platformReadiness || "Unknown",
      recommendation: asset.analysis?.recommendation || "Review this asset and activate the strongest available channel.",
    })),
  ).slice(0, 6);

  const askCopilot = async () => {
    if (!copilotQuestion.trim() || copilotLoading) return;
    setCopilotLoading(true); setCopilotResult(null);
    try {
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: copilotQuestion, assets: uploadedAssets }) });
      const data = await response.json();
      if (data.result) setCopilotResult(data.result); else setCopilotResult({ answer: data.error || "Copilot is not configured yet.", actions: [], opportunity: "", confidence: "Low" });
    } catch { setCopilotResult({ answer: "Copilot request failed.", actions: [], opportunity: "", confidence: "Low" }); }
    finally { setCopilotLoading(false); }
  };

  const generateCampaign = async () => {
    if (campaignLoading || uploadedAssets.length === 0) return;
    setCampaignLoading(true); setCampaign(null);
    try {
      const response = await fetch("/api/campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: campaignGoal, audience: campaignAudience, platform: campaignPlatform, assets: uploadedAssets }) });
      const data = await response.json();
      setCampaign(data.campaign || { error: data.error || "Campaign generation failed." });
    } catch { setCampaign({ error: "Campaign request failed." }); }
    finally { setCampaignLoading(false); }
  };

  const handleUploaded = async (asset: Asset & { secure_url?: string }) => {
    const url = asset.secure_url || asset.url;
    const assetKey = asset.public_id || url || `asset-${Date.now()}`;
    setUploadedAssets((current) => [...current, { ...asset, url, public_id: asset.public_id || assetKey, analyzing: Boolean(url) }]);

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
          (item.public_id || item.url) === assetKey
            ? data.analysis
              ? { ...item, analysis: data.analysis, analyzing: false }
              : { ...item, analyzing: false, analysisError: data.error || "AI analysis is not configured yet." }
            : item,
        ),
      );
    } catch {
      setUploadedAssets((current) =>
        current.map((item, i) =>
          (item.public_id || item.url) === assetKey ? { ...item, analyzing: false, analysisError: "Analysis request failed." } : item,
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
          <a href="#dashboard">Overview</a><a href="#media">Media Library</a><a href="#insights">Intelligence</a><a href="#campaigns">Growth</a><button className="profile">ES</button>
        </nav>
      </header>

      <section className="business-strip">
        <div><span className="business-kicker">WORKSPACE</span><strong>EsakkiAI</strong><span className="business-status"><i /> Growth workspace active</span></div>
        <div className="business-meta"><span>Business Copilot</span><span>Cloudinary connected</span><span>AI intelligence live</span></div>
      </section>

      <section className="hero" id="dashboard">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> AI BUSINESS COPILOT</div>
          <h1>Your media already contains <span>growth signals.</span></h1>
          <p>PixelPilot turns product images and marketing assets into actionable insights, optimized media, and smarter growth decisions.</p>
          <div className="hero-actions">
            <CloudinaryUpload onUploaded={handleUploaded} />
            <button className="secondary" onClick={() => document.getElementById("copilot")?.scrollIntoView({ behavior: "smooth" })}><BrainCircuit size={17} /> Ask PixelPilot</button>
          </div>
        </div>
        <div className="hero-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Sparkles size={30} /></div><div className="orbit-pill pill-a">Analyze</div><div className="orbit-pill pill-b">Optimize</div><div className="orbit-pill pill-c">Grow</div></div>
      </section>

      <section className="stats" id="insights">
        <article className="stat-card"><div className="stat-icon"><BarChart3 size={18} /></div><div><div className="stat-label">Media Health</div><div className="stat-value">{analyzedAssets.length ? `${avgHealth}%` : "0%"}</div><div className="stat-note">{analyzedAssets.length ? `${analyzedAssets.length} analyzed assets` : "Upload assets to measure"}</div></div></article>
        <article className="stat-card"><div className="stat-icon"><ImageIcon size={18} /></div><div><div className="stat-label">Media Assets</div><div className="stat-value">{uploadedAssets.length}</div><div className="stat-note">{uploadedAssets.length ? `${readyAssets} campaign-ready` : "Cloudinary library"}</div></div></article>
        <article className="stat-card"><div className="stat-icon"><Sparkles size={18} /></div><div><div className="stat-label">AI Opportunities</div><div className="stat-value">{opportunityCount}</div><div className="stat-note">{opportunityCount ? "Detected from your media" : "Waiting for intelligence"}</div></div></article>
        <article className="stat-card"><div className="stat-icon"><Cloud size={18} /></div><div><div className="stat-label">Optimization Queue</div><div className="stat-value">{needsOptimization}</div><div className="stat-note">{analyzedAssets.length ? "Assets needing attention" : "Cloudinary transforms ready"}</div></div></article>
      </section>

      <section className="business-overview">
        <div className="section-heading"><div><div className="eyebrow">BUSINESS OVERVIEW</div><h2>Know what deserves attention.</h2></div><span className="overview-note">Live from your workspace</span></div>
        <div className="overview-grid">
          <article className="overview-card overview-health"><div className="overview-top"><span>Portfolio health</span><strong>{analyzedAssets.length ? `${avgHealth}/100` : "0/100"}</strong></div><div className="health-track"><span style={{ width: `${avgHealth}%` }} /></div><p>{analyzedAssets.length ? "Based on AI analysis across your uploaded media." : "Upload product media to build your business intelligence layer."}</p></article>
          <article className="overview-card"><span>Campaign readiness</span><strong>{analyzedAssets.length ? `${readyAssets} ready` : "No data yet"}</strong><p>{analyzedAssets.length ? "Products with media ready for immediate activation." : "PixelPilot will identify campaign-ready assets."}</p></article>
          <article className="overview-card"><span>Next action</span><strong>{analyzedAssets.length ? (needsOptimization ? "Optimize media" : "Launch a campaign") : "Connect your media"}</strong><p>{analyzedAssets.length ? (needsOptimization ? "Generate platform-specific variants for assets that need work." : "Your analyzed library is ready for the growth workflow.") : "Start by uploading your product images or marketing assets."}</p></article>
        </div>
      </section>

      <section className="product-intelligence">
        <div className="section-heading"><div><div className="eyebrow">PRODUCT INTELLIGENCE</div><h2>From media to business signals.</h2></div><span className="overview-note">{analyzedAssets.length} products understood</span></div>
        <div className="signal-grid">
          <article className="signal-card"><div className="signal-number">{readyAssets}</div><div><strong>Campaign-ready</strong><p>Strong assets PixelPilot can activate now.</p></div></article>
          <article className="signal-card"><div className="signal-number">{needsOptimization}</div><div><strong>Need optimization</strong><p>Media that can improve before publishing.</p></div></article>
          <article className="signal-card"><div className="signal-number">{opportunityCount}</div><div><strong>Growth signals</strong><p>AI opportunities discovered in your library.</p></div></article>
        </div>
      </section>

      <section className="growth-opportunities" id="growth-opportunities">
        <div className="section-heading"><div><div className="eyebrow">GROWTH OPPORTUNITIES</div><h2>Turn signals into actions.</h2></div><span className="overview-note">{growthOpportunities.length} opportunities surfaced</span></div>\n        {growthOpportunities.length ? <div className="opportunity-grid">{growthOpportunities.map((item, index) => <article className="opportunity-card" key={item.product + item.opportunity + index}><div className="opportunity-top"><span className="priority opportunity">OPPORTUNITY</span><span className="opportunity-health">{item.health}/100</span></div><h3>{item.opportunity}</h3><div className="opportunity-product">{item.product} · {item.readiness}</div><p>{item.recommendation}</p><button className="opportunity-action" onClick={() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })}><Sparkles size={14} /> Create campaign</button></article>)}</div> : <div className="opportunity-empty"><Sparkles size={18} /><strong>Analyze your media to surface growth opportunities.</strong><span>PixelPilot will connect media signals to practical business actions.</span></div>}
      </section>

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
                  {asset.url && <div className="optimization-box"><div className="optimization-title"><WandSparkles size={12} /> Cloudinary Optimizer</div><div className="variant-row"><a href={cloudinaryVariant(asset.url, 1080, 1080)} target="_blank" rel="noreferrer">Instagram</a><a href={cloudinaryVariant(asset.url, 1080, 1920)} target="_blank" rel="noreferrer">Story</a><a href={cloudinaryVariant(asset.url, 1200, 627)} target="_blank" rel="noreferrer">LinkedIn</a><a href={cloudinaryVariant(asset.url, 1600, 900)} target="_blank" rel="noreferrer">Web</a></div></div>}
                  {asset.analyzing && <span className="analysis-loading">Analyzing with AI…</span>}
                  {asset.analysis && <div className="analysis-mini"><b>{asset.analysis.mediaHealth}/100 Media Health</b><span>{asset.analysis.product} · {asset.analysis.platformReadiness}</span><small>{asset.analysis.recommendation}</small></div>}
                  {asset.analysisError && <span className="analysis-error">{asset.analysisError}</span>}
                </div>
              )) : <div className="media-empty"><ImageIcon size={24} /><strong>Your media library is ready.</strong><span>Upload product images or marketing assets to build your intelligence layer.</span></div>}
            </div>
          </article>

          <article className="panel insight-panel" id="copilot"><div className="panel-top"><div><h3>AI recommendations</h3><p>What PixelPilot sees right now</p></div><Zap size={19} /></div>
            {analyzedAssets.length ? <>
              <div className="recommendation"><span className="priority high">HIGH</span><strong>{readyAssets} campaign-ready {readyAssets === 1 ? "asset" : "assets"}</strong><p>{readyAssets ? "Strong media that PixelPilot can activate in your growth workflow." : "Analyze your media to identify campaign-ready assets."}</p></div>
              <div className="recommendation"><span className="priority medium">MEDIUM</span><strong>{needsOptimization} {needsOptimization === 1 ? "asset needs" : "assets need"} optimization</strong><p>{needsOptimization ? "Generate platform-ready variants before publishing." : "No optimization blockers detected in the analyzed library."}</p></div>
              <div className="recommendation"><span className="priority opportunity">OPPORTUNITY</span><strong>{opportunityCount} growth {opportunityCount === 1 ? "signal" : "signals"} discovered</strong><p>{opportunityCount ? "PixelPilot found practical actions inside your uploaded media." : "Upload and analyze more media to discover business opportunities."}</p></div>
            </> : <div className="recommendation-empty"><Sparkles size={17} /><strong>Your AI recommendations will appear here.</strong><p>Upload media and PixelPilot will identify quality, readiness, issues, and growth opportunities.</p></div>}
            <div className="copilot-box"><div className="copilot-label">ASK YOUR BUSINESS COPILOT</div><textarea value={copilotQuestion} onChange={(e) => setCopilotQuestion(e.target.value)} placeholder="Ask about your uploaded media..." /><button className="copilot-button" onClick={askCopilot} disabled={copilotLoading}><BrainCircuit size={17} /> {copilotLoading ? "Thinking…" : "Ask PixelPilot"} <ArrowUpRight size={15} /></button>{copilotResult && <div className="copilot-result"><b>{copilotResult.answer}</b>{copilotResult.opportunity && <p><strong>Opportunity:</strong> {copilotResult.opportunity}</p>}{copilotResult.actions.length > 0 && <ol>{copilotResult.actions.map((action) => <li key={action}>{action}</li>)}</ol>}<small>Confidence: {copilotResult.confidence}</small></div>}</div>
          </article>
        </div>
      </section>

      <section className="campaign-section" id="campaigns"><div className="eyebrow">AI CAMPAIGN GENERATOR</div><h2>Turn insights into a campaign.</h2><p className="campaign-intro">Select your goal, audience and platform. PixelPilot creates ready-to-use campaign copy from your analyzed Cloudinary media.</p><div className="campaign-grid"><div className="panel campaign-controls"><label>Campaign goal<select value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)}><option>Product awareness</option><option>Lead generation</option><option>Developer adoption</option><option>Social engagement</option></select></label><label>Audience<input value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)} /></label><label>Platform<select value={campaignPlatform} onChange={(e) => setCampaignPlatform(e.target.value)}><option>LinkedIn</option><option>Instagram</option><option>X</option><option>Developer community</option></select></label><button className="campaign-button" onClick={generateCampaign} disabled={campaignLoading || uploadedAssets.length === 0}><Sparkles size={16} /> {campaignLoading ? "Creating campaign…" : uploadedAssets.length ? "Generate Campaign" : "Upload media first"}</button></div><div className="panel campaign-output">{campaign ? (campaign.error ? <div className="campaign-error">{campaign.error}</div> : <><div className="campaign-name">{campaign.campaignName}</div><h3>{campaign.headline}</h3><div className="campaign-hook">{campaign.hook}</div><p>{campaign.body}</p><div className="campaign-cta">{campaign.cta}</div><div className="campaign-meta"><span>Audience: {campaign.audienceAngle}</span><span>#{campaign.hashtags?.join(" #")}</span></div><ul>{campaign.platformTips?.map((tip:string) => <li key={tip}>{tip}</li>)}</ul></>) : <div className="campaign-empty"><Sparkles size={22} /><strong>{uploadedAssets.length ? "Your campaign will appear here" : "Upload media to unlock campaign creation"}</strong><span>Powered by your uploaded media intelligence.</span></div>}</div></div></section><section className="flow"><div className="eyebrow">THE PIXELPILOT LOOP</div><h2>From pixels to decisions.</h2><div className="flow-row">{["Upload","Understand","Optimize","Recommend","Create","Grow"].map((item, i) => <div className="flow-step" key={item}><span>0{i + 1}</span><strong>{item}</strong>{i < 5 && <ArrowUpRight size={14} />}</div>)}</div></section>
      <footer><span>PixelPilot</span><span>AI-powered business media intelligence</span><span>Cloudinary-first architecture</span></footer>
    </main>
  );
}
