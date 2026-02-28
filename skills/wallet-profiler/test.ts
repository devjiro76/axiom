#!/usr/bin/env tsx
/**
 * On-chain Wallet Profiler — Local test
 * Requires BASESCAN_API_KEY or ETHERSCAN_API_KEY
 */

import { getBalance, getTxHistory, getTxSummary } from "./client.js";

async function main() {
  console.log("=== Wallet Profiler Test ===\n");

  if (!process.env.BASESCAN_API_KEY && !process.env.ETHERSCAN_API_KEY) {
    console.log("⚠️  BASESCAN_API_KEY or ETHERSCAN_API_KEY not set. Skipping test.");
    return;
  }

  // Vitalik's address on Ethereum
  const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  const chain = process.env.ETHERSCAN_API_KEY ? "ethereum" as const : "base" as const;

  console.log(`1) Balance: ${address.slice(0, 10)}... on ${chain}`);
  const balance = await getBalance(address, { chain });
  console.log(`   ${balance.balanceEth} ETH`);
  console.log();

  console.log("2) Recent transactions (5)");
  const txs = await getTxHistory(address, { chain, limit: 5 });
  for (const tx of txs) {
    const date = new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString().split("T")[0];
    console.log(`   - ${date} ${tx.hash.slice(0, 14)}... ${tx.functionName || "transfer"}`);
  }
  console.log();

  console.log("3) Transaction summary");
  const summary = await getTxSummary(address, { chain });
  console.log(`   Total: ${summary.totalTx}, In: ${summary.inbound}, Out: ${summary.outbound}`);
  console.log(`   Unique counterparties: ${summary.uniqueCounterparties}`);

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
