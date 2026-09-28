import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, assets } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local to enable the AI Copilot." }, { status: 200 });

    const safeAssets = Array.isArray(assets) ? assets.slice(0, 10).map((a: any) => ({
      product: a?.analysis?.product,
      category: a?.analysis?.category,
      health: a?.analysis?.mediaHealth,
      quality: a?.analysis?.quality,
      readiness: a?.analysis?.platformReadiness,
      opportunities: a?.analysis?.opportunities,
      issues: a?.analysis?.issues,
      recommendation: a?.analysis?.recommendation,
    })) : [];

    const prompt = `You are PixelPilot, an AI business copilot for small businesses.
Answer the user's business question using ONLY the provided media intelligence. Be concise, practical, and action-oriented.
Do not invent sales, customer, revenue, or performance data that is not provided.
If the available media is insufficient, clearly say what additional information is needed.
Return JSON with: answer (string), actions (array of max 4 short strings), opportunity (string), confidence ("High"|"Medium"|"Low").

User question: ${String(question || "").slice(0, 500)}
Media intelligence:
${JSON.stringify(safeAssets)}`;

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
              answer: { type: "string" },
              actions: { type: "array", items: { type: "string" } },
              opportunity: { type: "string" },
              confidence: { type: "string", enum: ["High", "Medium", "Low"] }
            },
            required: ["answer", "actions", "opportunity", "confidence"]
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Copilot failed:", detail);
      return NextResponse.json({ error: "AI Copilot failed.", detail: detail.slice(0, 500) }, { status: 502 });
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
    if (!text) return NextResponse.json({ error: "The AI returned no copilot response." }, { status: 502 });
    return NextResponse.json({ mode: "ai", result: JSON.parse(text) });
  } catch (error) {
    console.error("Copilot route error:", error);
    return NextResponse.json({ error: "Unexpected copilot error." }, { status: 500 });
  }
}