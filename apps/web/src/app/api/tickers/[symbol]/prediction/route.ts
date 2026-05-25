import { NextResponse, type NextRequest } from "next/server";
import { getPrediction, jsonError } from "@/lib/data";

type Params = { params: Promise<{ symbol: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { symbol } = await params;
    return NextResponse.json(await getPrediction(symbol));
  } catch (error) {
    return jsonError(error);
  }
}

