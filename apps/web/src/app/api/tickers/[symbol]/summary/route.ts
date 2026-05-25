import { NextResponse, type NextRequest } from "next/server";
import { getTickerSummary, jsonError } from "@/lib/data";

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { symbol } = await params;
    const summary = await getTickerSummary(symbol);
    if (!summary) return NextResponse.json({ error: "Ticker not found" }, { status: 404 });
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}

