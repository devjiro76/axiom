#!/usr/bin/env tsx
/**
 * DeFi Analytics — Local test
 */

import { getTopProtocols, getProtocolDetail, getChainTvl, getStablecoins } from "./client.js";

async function main() {
  console.log("=== DeFi Analytics Test ===\n");

  // 1. Top protocols
  console.log("1) Top 5 protocols by TVL");
  const top = await getTopProtocols({ limit: 5 });
  for (const p of top) {
    console.log(`   - ${p.name}: $${(p.tvl / 1e9).toFixed(2)}B`);
  }
  console.log();

  // 2. Protocol detail
  console.log("2) Protocol detail: aave-v3");
  const detail = await getProtocolDetail("aave-v3");
  console.log(`   Name: ${detail.name}`);
  console.log(`   TVL: $${(detail.tvl / 1e9).toFixed(2)}B`);
  console.log(`   Chains: ${detail.chains.join(", ")}`);
  console.log(`   TVL history points: ${detail.tvlHistory.length}`);
  console.log();

  // 3. Chain TVL
  console.log("3) Chain TVL: Ethereum, Arbitrum, Base");
  const chains = await getChainTvl({ chains: ["Ethereum", "Arbitrum", "Base"] });
  for (const c of chains) {
    console.log(`   - ${c.name}: $${(c.tvl / 1e9).toFixed(2)}B`);
  }
  console.log();

  // 4. Stablecoins
  console.log("4) Top 3 stablecoins");
  const stables = await getStablecoins({ limit: 3 });
  for (const s of stables) {
    console.log(`   - ${s.name} (${s.symbol}): $${(s.circulating / 1e9).toFixed(2)}B`);
  }

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
