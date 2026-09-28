import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { goal, audience, platform, assets, opportunity } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local to enable the Campaign Generator." }, { status: 200 });

    const intelligence = Array.isArray(assets) ? assets.slice(0, 8).map((a: any) => ({
      product: a?.analysis?.product, category: a?.analysis?.category, health: a?.analysis?.mediaHealth,
      quality: a?.analysis?.quality, readiness: a?.analysis?.platformReadiness,
      tags: a?.analysis?.tags, opportunities: a?.analysis?.opportunities,
      recommendation: a?.analysis?.recommendation, cloudinaryUrl: a?.url
    })) : [];

    const prompt = `You are PixelPilot's AI Campaign Generator.
Create a realistic marketing campaign using the provided media intelligence.
Never invent product claims, prices, discounts, metrics, customers, or features. Use only information present in the media intelligence. If something is unknown, keep the wording generic.
Return concise, ready-to-use copy. Also create platform-specific content packages for Instagram, Story, LinkedIn, and Web. Keep every claim grounded in the provided intelligence.

Goal: ${String(goal || "product awareness").slice(0, 200)}
Audience: ${String(audience || "general audience").slice(0, 150)}
Primary platform: ${String(platform || "LinkedIn").slice(0, 80)}

Active growth signal:
${opportunity ? JSON.stringify({ product: opportunity.product, opportunity: opportunity.opportunity, recommendation: opportunity.recommendation }) : "None selected. Choose the strongest evidence-backed opportunity from the media intelligence."}

Media intelligence:
${JSON.stringify(intelligence)}`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              campaignName: { type: "string" },
              hook: { type: "string" },
              headline: { type: "string" },
              body: { type: "string" },
              cta: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              audienceAngle: { type: "string" },
              platformTips: { type: "array", items: { type: "string" } },
              contentPackages: {
                type: "object",
                properties: {
                  Instagram: { type: "object", properties: { caption: { type: "string" }, cta: { type: "string" }, hashtags: { type: "array", items: { type: "string" } } }, required: ["caption","cta","hashtags"] },
                  Story: { type: "object", properties: { headline: { type: "string" }, body: { type: "string" }, cta: { type: "string" } }, required: ["headline","body","cta"] },
                  LinkedIn: { type: "object", properties: { headline: { type: "string" }, post: { type: "string" }, cta: { type: "string" } }, required: ["headline","post","cta"] },
                  Web: { type: "object", properties: { headline: { type: "string" }, subheadline: { type: "string" }, cta: { type: "string" } }, required: ["headline","subheadline","cta"] }
                },
                required: ["Instagram","Story","LinkedIn","Web"]
              }
            },
            required: ["campaignName","hook","headline","body","cta","hashtags","audienceAngle","platformTips","contentPackages"]
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Campaign generation failed:", detail);
      return NextResponse.json({ error: "Campaign generation failed.", detail: detail.slice(0, 500) }, { status: 502 });
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
    if (!text) return NextResponse.json({ error: "The AI returned no campaign." }, { status: 502 });
    return NextResponse.json({ mode: "ai", campaign: JSON.parse(text) });
  } catch (error) {
    console.error("Campaign route error:", error);
    return NextResponse.json({ error: "Unexpected campaign error." }, { status: 500 });
  }
}