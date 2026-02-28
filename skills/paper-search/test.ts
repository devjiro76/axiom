#!/usr/bin/env tsx
/**
 * Academic Paper Search — Local test
 */

import { searchPapers, getPaperDetail, getCitations } from "./client.js";

async function main() {
  console.log("=== Paper Search Test ===\n");

  // 1. 검색
  console.log("1) Search: 'transformer attention mechanism'");
  const searchResult = await searchPapers("transformer attention mechanism", { limit: 3 });
  console.log(`   Found ${searchResult.total} papers, showing ${searchResult.papers.length}:`);
  for (const p of searchResult.papers) {
    console.log(`   - [${p.year}] ${p.title} (citations: ${p.citationCount})`);
  }

  if (searchResult.papers.length === 0) {
    console.log("\n   No papers found, skipping detail/citation tests.");
    return;
  }

  const firstPaper = searchResult.papers[0];
  console.log();

  // 2. 상세
  console.log(`2) Paper detail: ${firstPaper.paperId}`);
  const detail = await getPaperDetail(firstPaper.paperId);
  console.log(`   Title: ${detail.title}`);
  console.log(`   Authors: ${detail.authors.map((a) => a.name).join(", ")}`);
  console.log(`   Abstract: ${detail.abstract?.slice(0, 150) ?? "(none)"}...`);
  console.log();

  // 3. 인용
  console.log(`3) Citations for: ${firstPaper.paperId}`);
  const citations = await getCitations(firstPaper.paperId, { limit: 3 });
  console.log(`   ${citations.total} citing papers:`);
  for (const p of citations.papers) {
    console.log(`   - [${p.year}] ${p.title}`);
  }

  console.log("\n=== All tests passed ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
