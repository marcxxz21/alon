import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { createWatchlist, getWatchlistsForRequest } from "@/lib/watchlist-api";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getWatchlistsForRequest(request));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await createWatchlist(request);
  } catch (error) {
    return jsonError(error, 400);
  }
}
