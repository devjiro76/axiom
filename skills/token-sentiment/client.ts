/**
 * CoinGecko API Client
 *
 * 무료 공개 API. API 키 불필요 (Pro 키로 rate limit 상향 가능).
 * 무료: 10-30 calls/min
 * https://docs.coingecko.com/v3.0.1/reference
 */

import type {
  TokenOverview,
  SentimentScore,
  TrendingCoin,
  MarketOverview,
} from "./types.js";

const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;
const BASE_HEADERS: Record<string, string> = {
  ...(API_KEY ? { "x-cg-demo-api-key": API_KEY } : {}),
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: BASE_HEADERS });
  if (res.status === 429) {
    throw new Error("CoinGecko rate limit exceeded. Try again in a minute.");
  }
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

// ─── 토큰 기본 정보 ───

export async function getTokenOverview(coinId: string): Promise<TokenOverview> {
  const data = await fetchJson<Record<string, unknown>>(
    `${BASE_URL}/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`
  );

  const md = data.market_data as Record<string, unknown> | undefined;

  return {
    id: data.id as string,
    symbol: data.symbol as string,
    name: data.name as string,
    currentPrice: (md?.current_price as Record<string, number>)?.usd ?? null,
    marketCap: (md?.market_cap as Record<string, number>)?.usd ?? null,
    marketCapRank: (data.market_cap_rank as number) ?? null,
    totalVolume: (md?.total_volume as Record<string, number>)?.usd ?? null,
    priceChange24h: (md?.price_change_24h as number) ?? null,
    priceChangePercentage24h: (md?.price_change_percentage_24h as number) ?? null,
    priceChangePercentage7d: (md?.price_change_percentage_7d as number) ?? null,
    priceChangePercentage30d: (md?.price_change_percentage_30d as number) ?? null,
    ath: (md?.ath as Record<string, number>)?.usd ?? null,
    athChangePercentage: (md?.ath_change_percentage as Record<string, number>)?.usd ?? null,
  };
}

// ─── Sentiment 점수 계산 ───

export async function getTokenSentiment(coinId: string): Promise<SentimentScore> {
  const data = await fetchJson<Record<string, unknown>>(
    `${BASE_URL}/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&community_data=true&developer_data=true&sparkline=false`
  );

  const md = data.market_data as Record<string, unknown> | undefined;
  const cd = data.community_data as Record<string, unknown> | undefined;
  const dd = data.developer_data as Record<string, unknown> | undefined;

  const price24h = (md?.price_change_percentage_24h as number) ?? 0;
  const price7d = (md?.price_change_percentage_7d as number) ?? 0;

  // Volume change: current vs average
  const totalVol = (md?.total_volume as Record<string, number>)?.usd ?? 0;
  const marketCap = (md?.market_cap as Record<string, number>)?.usd ?? 1;
  const volToMcap = totalVol / marketCap;

  // Community score (Twitter followers + Reddit subscribers)
  const twitterFollowers = (cd?.twitter_followers as number) ?? 0;
  const redditSubscribers = (cd?.reddit_subscribers as number) ?? 0;
  const communityRaw = Math.log10(Math.max(twitterFollowers + redditSubscribers, 1));

  // Developer score (GitHub activity)
  const commits = (dd?.commit_count_4_weeks as number) ?? 0;
  const devRaw = Math.min(commits / 50, 1); // normalize to 0-1

  // Composite scores (0-100)
  const priceScore = Math.min(Math.max(50 + price24h * 2 + price7d * 0.5, 0), 100);
  const volumeScore = Math.min(volToMcap * 500, 100); // vol/mcap ratio → score
  const socialScore = Math.min((communityRaw / 7) * 100, 100); // log10 scale, max ~10M
  const developerScore = devRaw * 100;

  const score = Math.round(
    priceScore * 0.35 +
    volumeScore * 0.25 +
    socialScore * 0.25 +
    developerScore * 0.15
  );

  return {
    id: data.id as string,
    name: data.name as string,
    symbol: data.symbol as string,
    score,
    priceScore: Math.round(priceScore),
    volumeScore: Math.round(volumeScore),
    socialScore: Math.round(socialScore),
    breakdown: {
      price24hChange: price24h,
      price7dChange: price7d,
      volumeChange24h: volToMcap,
      communityScore: twitterFollowers + redditSubscribers,
      developerScore: commits,
    },
  };
}

// ─── 트렌딩 토큰 ───

export async function getTrendingCoins(
  options: { limit?: number } = {}
): Promise<TrendingCoin[]> {
  const { limit = 10 } = options;

  const data = await fetchJson<{ coins: Array<{ item: Record<string, unknown> }> }>(
    `${BASE_URL}/search/trending`
  );

  return data.coins.slice(0, limit).map((c, i) => ({
    id: c.item.id as string,
    name: c.item.name as string,
    symbol: c.item.symbol as string,
    marketCapRank: (c.item.market_cap_rank as number) ?? null,
    priceChangePercentage24h: (c.item.data as Record<string, unknown>)?.price_change_percentage_24h as Record<string, number> | null
      ? ((c.item.data as Record<string, unknown>).price_change_percentage_24h as Record<string, number>)?.usd ?? null
      : null,
    score: data.coins.length - i, // rank by trending position
  }));
}

// ─── 복수 토큰 비교 ───

export async function compareTokens(
  coinIds: string[]
): Promise<TokenOverview[]> {
  const data = await fetchJson<Array<Record<string, unknown>>>(
    `${BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(",")}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d,30d`
  );

  return data.map((d) => ({
    id: d.id as string,
    symbol: d.symbol as string,
    name: d.name as string,
    currentPrice: (d.current_price as number) ?? null,
    marketCap: (d.market_cap as number) ?? null,
    marketCapRank: (d.market_cap_rank as number) ?? null,
    totalVolume: (d.total_volume as number) ?? null,
    priceChange24h: (d.price_change_24h as number) ?? null,
    priceChangePercentage24h: (d.price_change_percentage_24h as number) ?? null,
    priceChangePercentage7d: (d.price_change_percentage_7d_in_currency as number) ?? null,
    priceChangePercentage30d: (d.price_change_percentage_30d_in_currency as number) ?? null,
    ath: (d.ath as number) ?? null,
    athChangePercentage: (d.ath_change_percentage as number) ?? null,
  }));
}

// ─── 시장 개요 ───

export async function getMarketOverview(): Promise<MarketOverview> {
  const data = await fetchJson<{ data: Record<string, unknown> }>(
    `${BASE_URL}/global`
  );

  const d = data.data;
  const totalMcap = d.total_market_cap as Record<string, number>;
  const totalVol = d.total_volume as Record<string, number>;
  const mcapPct = d.market_cap_percentage as Record<string, number>;

  return {
    totalMarketCap: totalMcap?.usd ?? 0,
    totalVolume: totalVol?.usd ?? 0,
    btcDominance: mcapPct?.btc ?? 0,
    ethDominance: mcapPct?.eth ?? 0,
    marketCapChange24h: (d.market_cap_change_percentage_24h_usd as number) ?? 0,
    activeCryptocurrencies: (d.active_cryptocurrencies as number) ?? 0,
  };
}
