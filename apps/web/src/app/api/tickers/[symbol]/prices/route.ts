import { NextResponse, type NextRequest } from "next/server";
import { getPrices, jsonError } from "@/lib/data";

type Params = { params: Promise<{ symbol: string }> };

const rangeDays: Record<string, number> = {
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
  "5y": 1825
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { symbol } = await params;
    const range = request.nextUrl.searchParams.get("range") ?? "3m";
    const days = rangeDays[range] ?? 90;
    const prices = await getPrices(symbol);
    return NextResponse.json(prices.slice(-days));
  } catch (error) {
    return jsonError(error);
  }
}

