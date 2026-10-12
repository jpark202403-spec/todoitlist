import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

export async function GET() {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json({ success: false, error: "GOOGLE_SCRIPT_URL is not set" }, { status: 500 });
  }

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json({ success: false, error: "GOOGLE_SCRIPT_URL is not set" }, { status: 500 });
  }

  try {
    const body = await req.json();

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
