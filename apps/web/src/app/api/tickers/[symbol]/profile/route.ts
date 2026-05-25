import { NextResponse, type NextRequest } from "next/server";
import { getTickerProfile, jsonError } from "@/lib/data";

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { symbol } = await params;
    const profile = await getTickerProfile(symbol);
    if (!profile) return NextResponse.json({ error: "Ticker profile not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    return jsonError(error);
  }
}
