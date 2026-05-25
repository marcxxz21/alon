import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { createHolding, getPortfolioForRequest } from "@/lib/portfolio-api";

export async function GET(request: NextRequest) {
  try {
    const portfolio = await getPortfolioForRequest(request);
    return NextResponse.json(portfolio.holdings);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await createHolding(request);
  } catch (error) {
    return jsonError(error, 400);
  }
}
