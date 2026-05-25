import { NextResponse, type NextRequest } from "next/server";
import { getWatchlists, jsonError } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getWatchlists());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        name: body.name ?? "New Watchlist",
        items: []
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error, 400);
  }
}

