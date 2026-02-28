/** Token Sentiment 타입 정의 */

export interface TokenOverview {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
  totalVolume: number | null;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  priceChangePercentage7d: number | null;
  priceChangePercentage30d: number | null;
  ath: number | null;
  athChangePercentage: number | null;
}

export interface SentimentScore {
  id: string;
  name: string;
  symbol: string;
  score: number;         // 0-100 composite
  priceScore: number;    // price momentum
  volumeScore: number;   // volume trend
  socialScore: number;   // community engagement
  breakdown: {
    price24hChange: number | null;
    price7dChange: number | null;
    volumeChange24h: number | null;
    communityScore: number | null;
    developerScore: number | null;
  };
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number | null;
  priceChangePercentage24h: number | null;
  score: number;
}

export interface MarketOverview {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
  activeCryptocurrencies: number;
}
