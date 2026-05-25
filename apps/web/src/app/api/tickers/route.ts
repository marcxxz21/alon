import { NextResponse } from "next/server";
import { getTickers, jsonError } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getTickers());
  } catch (error) {
    return jsonError(error);
  }
}

