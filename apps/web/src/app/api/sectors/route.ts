import { NextResponse } from "next/server";
import { getSectors, jsonError } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getSectors());
  } catch (error) {
    return jsonError(error);
  }
}

