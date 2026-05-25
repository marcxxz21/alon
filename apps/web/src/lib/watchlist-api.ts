import { NextResponse, type NextRequest } from "next/server";
import type { Watchlist } from "@stocksage/contracts";
import { mockWatchlists } from "@/lib/mock-data";
import { getServiceSupabase, hasSupabaseConfig } from "@/lib/supabase";

async function getUserId(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !hasSupabaseConfig()) return null;

  const { data, error } = await getServiceSupabase().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function getWatchlistsForRequest(request: NextRequest): Promise<Watchlist[]> {
  const userId = await getUserId(request);
  if (!userId) return mockWatchlists;

  const supabase = getServiceSupabase();
  const { data: watchlists, error } = await supabase
    .from("watchlists")
    .select("id,name,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  if (!watchlists.length) {
    const { data: created, error: createError } = await supabase
      .from("watchlists")
      .insert({ user_id: userId, name: "Core PH Watchlist" })
      .select("id,name,created_at")
      .single();

    if (createError) throw createError;
    return [{ id: created.id, name: created.name, items: [] }];
  }

  const ids = watchlists.map((watchlist) => watchlist.id);
  const { data: items, error: itemsError } = await supabase
    .from("watchlist_items")
    .select("watchlist_id,symbol,note,added_at")
    .in("watchlist_id", ids)
    .order("added_at", { ascending: false });

  if (itemsError) throw itemsError;

  return watchlists.map((watchlist) => ({
    id: watchlist.id,
    name: watchlist.name,
    items: items
      .filter((item) => item.watchlist_id === watchlist.id)
      .map((item) => ({
        symbol: item.symbol,
        note: item.note,
        addedAt: item.added_at
      }))
  }));
}

export async function createWatchlist(request: NextRequest) {
  const body = await request.json();
  const userId = await getUserId(request);
  const name = body.name ?? "New Watchlist";

  if (!userId) {
    return NextResponse.json({ id: crypto.randomUUID(), name, items: [], mode: "mock" }, { status: 201 });
  }

  const { data, error } = await getServiceSupabase()
    .from("watchlists")
    .insert({ user_id: userId, name })
    .select("id,name,created_at")
    .single();

  if (error) throw error;
  return NextResponse.json({ id: data.id, name: data.name, items: [] }, { status: 201 });
}

export async function addWatchlistItem(request: NextRequest, watchlistId: string) {
  const body = await request.json();
  const userId = await getUserId(request);
  const symbol = String(body.symbol ?? "").toUpperCase().trim();

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required." }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({
      watchlistId,
      symbol,
      note: body.note ?? null,
      addedAt: new Date().toISOString(),
      mode: "mock"
    }, { status: 201 });
  }

  const supabase = getServiceSupabase();
  const { data: watchlist, error: watchlistError } = await supabase
    .from("watchlists")
    .select("id")
    .eq("id", watchlistId)
    .eq("user_id", userId)
    .maybeSingle();

  if (watchlistError) throw watchlistError;
  if (!watchlist) return NextResponse.json({ error: "Watchlist not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("watchlist_items")
    .upsert({
      watchlist_id: watchlistId,
      symbol,
      note: body.note ?? null
    }, { onConflict: "watchlist_id,symbol" })
    .select("watchlist_id,symbol,note,added_at")
    .single();

  if (error) throw error;
  return NextResponse.json({
    watchlistId: data.watchlist_id,
    symbol: data.symbol,
    note: data.note,
    addedAt: data.added_at
  }, { status: 201 });
}

export async function deleteWatchlistItem(request: NextRequest, watchlistId: string, symbol: string) {
  const userId = await getUserId(request);
  if (!userId) return new NextResponse(null, { status: 204 });

  const { data: watchlist, error: watchlistError } = await getServiceSupabase()
    .from("watchlists")
    .select("id")
    .eq("id", watchlistId)
    .eq("user_id", userId)
    .maybeSingle();

  if (watchlistError) throw watchlistError;
  if (!watchlist) return NextResponse.json({ error: "Watchlist not found." }, { status: 404 });

  const { error } = await getServiceSupabase()
    .from("watchlist_items")
    .delete()
    .eq("watchlist_id", watchlistId)
    .eq("symbol", symbol.toUpperCase());

  if (error) throw error;
  return new NextResponse(null, { status: 204 });
}
