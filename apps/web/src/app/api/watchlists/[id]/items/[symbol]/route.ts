import { type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { deleteWatchlistItem } from "@/lib/watchlist-api";

type Params = { params: Promise<{ id: string; symbol: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id, symbol } = await params;
    return await deleteWatchlistItem(request, id, symbol);
  } catch (error) {
    return jsonError(error, 400);
  }
}
