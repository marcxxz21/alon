import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { getPortfolioForRequest } from "@/lib/portfolio-api";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getPortfolioForRequest(request));
  } catch (error) {
    return jsonError(error);
  }
}
