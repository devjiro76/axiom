#!/usr/bin/env tsx
/**
 * Token Sentiment — Local test
 */

import { getTokenOverview, getTrendingCoins, getMarketOverview } from "./client.js";

async function main() {
  console.log("=== Token Sentiment Test ===\n");

  // 1. Market overview
  console.log("1) Market overview");
  const market = await getMarketOverview();
  console.log(`   Total market cap: $${(market.totalMarketCap / 1e12).toFixed(2)}T`);
  console.log(`   BTC dominance: ${market.btcDominance.toFixed(1)}%`);
  console.log(`   24h change: ${market.marketCapChange24h.toFixed(2)}%`);
  console.log();

  // 2. Token overview
  console.log("2) Token overview: bitcoin");
  const btc = await getTokenOverview("bitcoin");
  console.log(`   ${btc.name} (${btc.symbol}): $${btc.currentPrice?.toLocaleString()}`);
  console.log(`   24h: ${btc.priceChangePercentage24h?.toFixed(2)}%`);
  console.log(`   ATH: $${btc.ath?.toLocaleString()} (${btc.athChangePercentage?.toFixed(1)}%)`);
  console.log();

  // 3. Trending
  console.log("3) Trending coins (top 5)");
  const trending = await getTrendingCoins({ limit: 5 });
  for (const c of trending) {
    console.log(`   - ${c.name} (${c.symbol}) rank #${c.marketCapRank ?? "?"}`);
  }

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
