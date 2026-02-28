/** DeFi Analytics 타입 정의 */

export interface Protocol {
  name: string;
  slug: string;
  tvl: number;
  chain: string | null;
  chains: string[];
  category: string | null;
  change1h: number | null;
  change1d: number | null;
  change7d: number | null;
  url: string | null;
}

export interface ProtocolDetail {
  name: string;
  slug: string;
  tvl: number;
  description: string | null;
  category: string | null;
  chains: string[];
  url: string | null;
  tvlHistory: TvlDataPoint[];
}

export interface TvlDataPoint {
  date: string;
  tvl: number;
}

export interface YieldPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
}

export interface ChainTvl {
  name: string;
  tvl: number;
}

export interface StablecoinInfo {
  name: string;
  symbol: string;
  pegType: string;
  circulating: number;
  price: number | null;
}
