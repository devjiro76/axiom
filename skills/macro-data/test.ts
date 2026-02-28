#!/usr/bin/env tsx
/**
 * US Macro Data (FRED) — Local test
 * Requires FRED_API_KEY in environment
 */

import { searchSeries, getSeriesObservations, getPopularIndicators } from "./client.js";

async function main() {
  console.log("=== US Macro Data (FRED) Test ===\n");

  if (!process.env.FRED_API_KEY) {
    console.log("⚠️  FRED_API_KEY not set. Skipping test.");
    console.log("   Get a free key: https://fred.stlouisfed.org/docs/api/api_key.html");
    return;
  }

  // 1. 검색
  console.log("1) Search: 'inflation rate'");
  const search = await searchSeries("inflation rate", { limit: 3 });
  for (const s of search.series) {
    console.log(`   - ${s.id}: ${s.title}`);
  }
  console.log();

  // 2. 시계열
  console.log("2) Series: FEDFUNDS (last 12 observations)");
  const series = await getSeriesObservations("FEDFUNDS");
  console.log(`   ${series.meta.title} (${series.meta.units})`);
  for (const obs of series.observations.slice(-5)) {
    console.log(`   ${obs.date}: ${obs.value}`);
  }
  console.log();

  // 3. 주요 지표
  console.log("3) Popular indicators");
  const popular = await getPopularIndicators();
  for (const p of popular) {
    console.log(`   - ${p.id}: ${p.latestValue} (${p.latestDate})`);
  }

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
