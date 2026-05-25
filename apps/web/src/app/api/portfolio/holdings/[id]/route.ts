import { type NextRequest } from "next/server";
import { jsonError } from "@/lib/data";
import { deleteHolding, updateHolding } from "@/lib/portfolio-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await updateHolding(request, id);
  } catch (error) {
    return jsonError(error, 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return await deleteHolding(request, id);
  } catch (error) {
    return jsonError(error, 400);
  }
}
