import { NextResponse } from "next/server";
import { getLeaderboards, jsonError } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await getLeaderboards());
  } catch (error) {
    return jsonError(error);
  }
}

