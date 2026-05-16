import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const API_URL = "https://translation.googleapis.com/language/translate/v2";

export async function POST(req: Request) {
  try {
    const { q, target, source = "en", format = "text" } = await req.json();

    if (!API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const userIp = req.headers.get("x-forwarded-for") || "anonymous";
    const res = await fetch(`${API_URL}?key=${API_KEY}&quotaUser=${encodeURIComponent(userIp)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, target, source, format }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Google Translate API Error Details:", {
        status: res.status,
        statusText: res.statusText,
        error: errorData,
        keyUsed: API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : "NONE"
      });
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
