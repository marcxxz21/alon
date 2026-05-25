import { type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { addWatchlistItem } from "@/lib/watchlist-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await addWatchlistItem(request, id);
  } catch (error) {
    return jsonError(error, 400);
  }
}
