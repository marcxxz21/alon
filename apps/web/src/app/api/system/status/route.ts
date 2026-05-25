import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/system-status";
import { jsonError } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getSystemStatus());
  } catch (error) {
    return jsonError(error);
  }
}
