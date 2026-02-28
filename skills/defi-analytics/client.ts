/**
 * DefiLlama API Client
 *
 * 무료 공개 API. API 키 불필요, rate limit 관대.
 * https://defillama.com/docs/api
 */

import type {
  Protocol,
  ProtocolDetail,
  TvlDataPoint,
  YieldPool,
  ChainTvl,
  StablecoinInfo,
} from "./types.js";

const BASE_URL = "https://api.llama.fi";
const YIELDS_URL = "https://yields.llama.fi";
const STABLECOINS_URL = "https://stablecoins.llama.fi";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`DefiLlama API error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

// ─── TVL 상위 프로토콜 ───

export async function getTopProtocols(
  options: { chain?: string; limit?: number } = {}
): Promise<Protocol[]> {
  const { chain, limit = 10 } = options;

  const data = await fetchJson<Array<Record<string, unknown>>>(
    `${BASE_URL}/protocols`
  );

  let protocols = data.map((p) => ({
    name: p.name as string,
    slug: p.slug as string,
    tvl: (p.tvl as number) ?? 0,
    chain: (p.chain as string) ?? null,
    chains: (p.chains as string[]) ?? [],
    category: (p.category as string) ?? null,
    change1h: (p.change_1h as number) ?? null,
    change1d: (p.change_1d as number) ?? null,
    change7d: (p.change_7d as number) ?? null,
    url: (p.url as string) ?? null,
  }));

  if (chain) {
    protocols = protocols.filter((p) =>
      p.chains.some((c) => c.toLowerCase() === chain.toLowerCase())
    );
  }

  return protocols
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit);
}

// ─── 프로토콜 상세 ───

export async function getProtocolDetail(name: string): Promise<ProtocolDetail> {
  const data = await fetchJson<Record<string, unknown>>(
    `${BASE_URL}/protocol/${encodeURIComponent(name)}`
  );

  const tvlRaw = (data.tvl as Array<{ date: number; totalLiquidityUSD: number }>) ?? [];
  const tvlHistory: TvlDataPoint[] = tvlRaw.slice(-90).map((d) => ({
    date: new Date(d.date * 1000).toISOString().split("T")[0],
    tvl: d.totalLiquidityUSD,
  }));

  return {
    name: data.name as string,
    slug: data.slug as string,
    tvl: (data.currentChainTvls as Record<string, number> | undefined)
      ? Object.values(data.currentChainTvls as Record<string, number>).reduce((a, b) => a + b, 0)
      : (data.tvl as Array<{ totalLiquidityUSD: number }> | undefined)?.at(-1)?.totalLiquidityUSD ?? 0,
    description: (data.description as string) ?? null,
    category: (data.category as string) ?? null,
    chains: (data.chains as string[]) ?? [],
    url: (data.url as string) ?? null,
    tvlHistory,
  };
}

// ─── Yield 풀 검색 ───

export async function searchYieldPools(
  options: { chain?: string; minTvl?: number; sortBy?: "apy" | "tvl"; limit?: number } = {}
): Promise<YieldPool[]> {
  const { chain, minTvl = 0, sortBy = "tvl", limit = 10 } = options;

  const data = await fetchJson<{ data: Array<Record<string, unknown>> }>(
    `${YIELDS_URL}/pools`
  );

  let pools = data.data.map((p) => ({
    pool: p.pool as string,
    project: p.project as string,
    chain: p.chain as string,
    symbol: p.symbol as string,
    tvlUsd: (p.tvlUsd as number) ?? 0,
    apy: (p.apy as number) ?? null,
    apyBase: (p.apyBase as number) ?? null,
    apyReward: (p.apyReward as number) ?? null,
  }));

  if (chain) {
    pools = pools.filter((p) => p.chain.toLowerCase() === chain.toLowerCase());
  }
  pools = pools.filter((p) => p.tvlUsd >= minTvl);

  if (sortBy === "apy") {
    pools.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0));
  } else {
    pools.sort((a, b) => b.tvlUsd - a.tvlUsd);
  }

  return pools.slice(0, limit);
}

// ─── 체인별 TVL ───

export async function getChainTvl(
  options: { chains?: string[] } = {}
): Promise<ChainTvl[]> {
  const { chains } = options;

  const data = await fetchJson<Array<{ name: string; tvl: number }>>(
    `${BASE_URL}/v2/chains`
  );

  let result: ChainTvl[] = data.map((c) => ({
    name: c.name,
    tvl: c.tvl,
  }));

  if (chains?.length) {
    const lower = chains.map((c) => c.toLowerCase());
    result = result.filter((c) => lower.includes(c.name.toLowerCase()));
  }

  return result.sort((a, b) => b.tvl - a.tvl);
}

// ─── 스테이블코인 ───

export async function getStablecoins(
  options: { limit?: number } = {}
): Promise<StablecoinInfo[]> {
  const { limit = 10 } = options;

  const data = await fetchJson<{ peggedAssets: Array<Record<string, unknown>> }>(
    `${STABLECOINS_URL}/stablecoins`
  );

  return data.peggedAssets
    .map((s) => ({
      name: s.name as string,
      symbol: s.symbol as string,
      pegType: (s.pegType as string) ?? "USD",
      circulating: ((s.circulating as Record<string, number>)?.peggedUSD) ?? 0,
      price: (s.price as number) ?? null,
    }))
    .sort((a, b) => b.circulating - a.circulating)
    .slice(0, limit);
}
