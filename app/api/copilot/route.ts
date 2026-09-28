import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { question, assets, campaigns } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Add GEMINI_API_KEY to .env.local to enable the AI Copilot." },
        { status: 200 }
      );
    }

    const safeCampaigns = Array.isArray(campaigns)
      ? campaigns.slice(0, 12).map((c: any) => ({
          campaignName: c?.campaign?.campaignName,
          headline: c?.campaign?.headline,
          goal: c?.goal,
          audience: c?.audience,
          platform: c?.platform,
          createdAt: c?.createdAt,
        }))
      : [];

    const safeAssets = Array.isArray(assets)
      ? assets.slice(0, 10).map((a: any) => ({
          product: a?.analysis?.product,
          category: a?.analysis?.category,
          health: a?.analysis?.mediaHealth,
          quality: a?.analysis?.quality,
          readiness: a?.analysis?.platformReadiness,
          opportunities: a?.analysis?.opportunities,
          issues: a?.analysis?.issues,
          recommendation: a?.analysis?.recommendation,
        }))
      : [];

    const prompt = `You are PixelPilot, an AI business copilot for small businesses.
Answer the user's business question using ONLY the provided workspace intelligence. Be concise, practical, and action-oriented.
Do not invent sales, customer, revenue, or performance data that is not provided.
Use campaign history when relevant, but never treat campaign creation as campaign performance. If workspace data is insufficient, clearly say what additional information is needed.
Return JSON with: answer (string), actions (array of max 4 short strings), opportunity (string), confidence ("High"|"Medium"|"Low").

User question: ${String(question || "").slice(0, 500)}
Media intelligence:
${JSON.stringify(safeAssets)}`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            actions: { type: "array", items: { type: "string" } },
            opportunity: { type: "string" },
            confidence: { type: "string", enum: ["High", "Medium", "Low"] },
          },
          required: ["answer", "actions", "opportunity", "confidence"],
        },
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    let response: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      try {
        response = await fetch(GEMINI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body,
          signal: controller.signal,
        });

        if (response.ok) break;

        const detail = await response.text();
        console.error(`Copilot Gemini HTTP ${response.status} (attempt ${attempt}):`, detail);

        if (response.status < 500 || attempt === 2) {
          return NextResponse.json(
            { error: "AI Copilot failed.", detail: detail.slice(0, 500) },
            { status: 502 }
          );
        }
      } catch (error) {
        lastError = error;
        console.error(`Copilot Gemini request failed (attempt ${attempt}):`, error);
        if (attempt === 2) throw error;
      } finally {
        clearTimeout(timeout);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!response?.ok) {
      console.error("Copilot Gemini failed after retries:", lastError);
      return NextResponse.json(
        { error: "AI Copilot failed after retrying the Gemini connection." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.find(
      (p: { text?: string }) => p.text
    )?.text;

    if (!text) {
      return NextResponse.json(
        { error: "The AI returned no copilot response." },
        { status: 502 }
      );
    }

    try {
      return NextResponse.json({ mode: "ai", result: JSON.parse(text) });
    } catch {
      console.error("Copilot returned invalid JSON:", text);
      return NextResponse.json(
        { error: "The AI returned an invalid copilot response." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Copilot route error:", error);
    return NextResponse.json({ error: "Unexpected copilot error." }, { status: 500 });
  }
}
