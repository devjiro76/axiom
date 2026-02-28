#!/usr/bin/env tsx
/**
 * Patent Search (USPTO) — Local test
 */

import { searchPatents, getCompanyPatents } from "./client.js";

async function main() {
  console.log("=== Patent Search Test ===\n");

  if (!process.env.PATENTSVIEW_API_KEY) {
    console.log("⚠️  PATENTSVIEW_API_KEY not set. Skipping test.");
    console.log("   Get a free key: https://patentsview.org/apis/keyrequest");
    return;
  }

  // 1. 키워드 검색
  console.log("1) Search: 'machine learning'");
  const results = await searchPatents("machine learning", { limit: 3 });
  console.log(`   Found ${results.total} patents, showing ${results.patents.length}:`);
  for (const p of results.patents) {
    console.log(`   - [${p.date}] ${p.patentNumber}: ${p.title.slice(0, 80)}`);
  }
  console.log();

  // 2. 기업별
  console.log("2) Company patents: Google");
  const google = await getCompanyPatents("Google", { limit: 3 });
  console.log(`   Found ${google.total} patents:`);
  for (const p of google.patents) {
    console.log(`   - [${p.date}] ${p.title.slice(0, 80)}`);
  }

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
