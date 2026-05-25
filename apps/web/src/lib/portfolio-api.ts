import { NextResponse, type NextRequest } from "next/server";
import { buildPortfolioSummary, demoHoldingInputs, type HoldingInput } from "./portfolio";
import { getRequestSupabase, hasSupabaseConfig } from "./supabase";

function getToken(request: NextRequest) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
}

async function getUserId(request: NextRequest) {
  const token = getToken(request);
  if (!token || !hasSupabaseConfig()) return null;

  const { data, error } = await getRequestSupabase(token).auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function getPortfolioForRequest(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return buildPortfolioSummary();

  const { data, error } = await getRequestSupabase(getToken(request) ?? undefined)
    .from("portfolio_holdings")
    .select("id,ticker_symbol,shares_owned,average_buy_price,notes")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const holdings: HoldingInput[] = data.map((row) => ({
    id: row.id,
    symbol: row.ticker_symbol,
    sharesOwned: Number(row.shares_owned),
    averageBuyPrice: Number(row.average_buy_price),
    notes: row.notes
  }));

  return buildPortfolioSummary(holdings.length ? holdings : demoHoldingInputs);
}

export async function createHolding(request: NextRequest) {
  const body = await request.json();
  const userId = await getUserId(request);

  if (!body.symbol || Number(body.sharesOwned) <= 0 || Number(body.averageBuyPrice) < 0) {
    return NextResponse.json({ error: "Symbol, shares, and average buy price are required." }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      symbol: String(body.symbol).toUpperCase(),
      sharesOwned: Number(body.sharesOwned),
      averageBuyPrice: Number(body.averageBuyPrice),
      notes: body.notes ?? null,
      mode: "mock"
    }, { status: 201 });
  }

  const { data, error } = await getRequestSupabase(getToken(request) ?? undefined)
    .from("portfolio_holdings")
    .upsert({
      user_id: userId,
      ticker_symbol: String(body.symbol).toUpperCase(),
      shares_owned: Number(body.sharesOwned),
      average_buy_price: Number(body.averageBuyPrice),
      notes: body.notes ?? null,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,ticker_symbol" })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(data, { status: 201 });
}

export async function updateHolding(request: NextRequest, id: string) {
  const body = await request.json();
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ id, ...body, mode: "mock" });

  const { data, error } = await getRequestSupabase(getToken(request) ?? undefined)
    .from("portfolio_holdings")
    .update({
      shares_owned: Number(body.sharesOwned),
      average_buy_price: Number(body.averageBuyPrice),
      notes: body.notes ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(data);
}

export async function deleteHolding(request: NextRequest, id: string) {
  const userId = await getUserId(request);
  if (!userId) return new NextResponse(null, { status: 204 });

  const { error } = await getRequestSupabase(getToken(request) ?? undefined)
    .from("portfolio_holdings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return new NextResponse(null, { status: 204 });
}
