import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";

type Params = { params: Promise<{ id: string; symbol: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await params;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return jsonError(error, 400);
  }
}
