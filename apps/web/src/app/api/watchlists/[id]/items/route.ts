import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(
      {
        watchlistId: id,
        symbol: String(body.symbol ?? "").toUpperCase(),
        note: body.note ?? null,
        addedAt: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error, 400);
  }
}

