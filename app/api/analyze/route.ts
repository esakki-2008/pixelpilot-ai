import { NextRequest, NextResponse } from "next/server";

type Analysis = {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url : "";
    const format = typeof body?.format === "string" ? body.format : "jpg";
    const width = Number(body?.width || 0);
    const height = Number(body?.height || 0);

    if (!url) {
      return NextResponse.json({ error: "Cloudinary asset URL is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        mode: "setup_required",
        error: "Add GEMINI_API_KEY to .env.local to enable live AI media intelligence.",
      }, { status: 200 });
    }

    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Could not fetch the uploaded Cloudinary asset." }, { status: 502 });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const mimeType = imageResponse.headers.get("content-type") || `image/${format}`;
    const base64 = imageBuffer.toString("base64");

    const prompt = `You are PixelPilot, an AI business media copilot for small businesses.

Analyze this uploaded product/marketing image and return ONLY valid JSON matching the requested schema.

Business goal:
- determine what the media is useful for
- assess visual quality and commercial readiness
- identify concrete issues
- find realistic marketing opportunities
- give one clear next action

Do not invent facts that cannot be reasonably inferred from the image.
The media dimensions are ${width}x${height} and format is ${format}.

Score mediaHealth from 0 to 100. Consider clarity, composition, product visibility, lighting, background, consistency/readiness for commercial use.
quality must be one of: Excellent, Good, Fair, Poor.
platformReadiness must be one of: Ready, Needs optimization, Not ready.
Keep tags to at most 6 items, issues/opportunities to at most 3 items each.`;

    const schema = {
      type: "object",
      properties: {
        product: { type: "string" },
        category: { type: "string" },
        summary: { type: "string" },
        mediaHealth: { type: "integer" },
        quality: { type: "string", enum: ["Excellent", "Good", "Fair", "Poor"] },
        platformReadiness: { type: "string", enum: ["Ready", "Needs optimization", "Not ready"] },
        tags: { type: "array", items: { type: "string" } },
        issues: { type: "array", items: { type: "string" } },
        opportunities: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" },
      },
      required: [
        "product", "category", "summary", "mediaHealth", "quality",
        "platformReadiness", "tags", "issues", "opportunities", "recommendation"
      ],
    };

    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
      },
    );

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      console.error("Gemini analysis failed:", detail);
      return NextResponse.json({
        error: "AI analysis failed.",
        detail: process.env.NODE_ENV === "development" ? detail : undefined,
      }, { status: 502 });
    }

    const payload = await aiResponse.json();
    const text = payload?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text;

    if (!text) {
      return NextResponse.json({ error: "The AI returned no analysis." }, { status: 502 });
    }

    const analysis = JSON.parse(text) as Analysis;
    return NextResponse.json({ mode: "ai", analysis });
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json({ error: "Unexpected analysis error." }, { status: 500 });
  }
}
