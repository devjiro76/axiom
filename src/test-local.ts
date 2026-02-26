#!/usr/bin/env tsx
/**
 * 로컬 자체 테스트
 *
 * ACP 등록 없이 EDGAR 검색 로직을 검증합니다.
 * 실제 셀러가 받을 요청을 시뮬레이션합니다.
 *
 * Usage:
 *   tsx src/test-local.ts
 */

import { lookupCompany, getFilings, searchFilings, fetchFiling } from "./edgar-client.js";

interface TestCase {
  name: string;
  action: string;
  params: Record<string, unknown>;
}

const TESTS: TestCase[] = [
  { name: "lookup AAPL", action: "lookup", params: { ticker: "AAPL" } },
  { name: "lookup invalid", action: "lookup", params: { ticker: "ZZZZZZ" } },
  { name: "filings TSLA 10-K", action: "filings", params: { ticker: "TSLA", formType: "10-K", limit: 2 } },
  { name: "filings NVDA 10-Q", action: "filings", params: { ticker: "NVDA", formType: "10-Q", limit: 2 } },
  { name: "search AI in 10-K", action: "search", params: { query: "artificial intelligence", formType: "10-K", limit: 2 } },
  { name: "search revenue risk", action: "search", params: { query: "revenue growth risk", limit: 2 } },
  { name: "fetch TSLA 10-K (latest)", action: "fetch-latest", params: { ticker: "TSLA", formType: "10-K" } },
];

async function simulateHandleJob(action: string, params: Record<string, unknown>): Promise<unknown> {
  const { ticker, query, formType, limit, accessionNumber, primaryDocument } = params as Record<string, string | number | undefined>;

  switch (action) {
    case "lookup": {
      const company = await lookupCompany(ticker as string);
      if (!company) return { error: `Ticker "${ticker}" not found` };
      return { success: true, data: company };
    }
    case "filings": {
      const result = await getFilings(ticker as string, { formType: formType as string, limit: (limit as number) ?? 5 });
      return { success: true, data: result };
    }
    case "search": {
      const forms = formType ? [formType as string] : undefined;
      const result = await searchFilings(query as string, { forms, limit: (limit as number) ?? 5 });
      return { success: true, data: result };
    }
    case "fetch": {
      const result = await fetchFiling(ticker as string, accessionNumber as string, primaryDocument as string, { maxChars: 2000 });
      return { success: true, url: result.url, textLength: result.text.length, truncated: result.truncated, preview: result.text.slice(0, 300) };
    }
    case "fetch-latest": {
      // 먼저 최신 공시를 찾고, 그 문서를 fetch
      const filings = await getFilings(ticker as string, { formType: formType as string, limit: 1 });
      if (filings.filings.length === 0) return { error: "No filings found" };
      const f = filings.filings[0];
      const result = await fetchFiling(ticker as string, f.accessionNumber, f.primaryDocument, { maxChars: 2000 });
      return { success: true, filing: `${f.form} ${f.filingDate}`, url: result.url, textLength: result.text.length, truncated: result.truncated, preview: result.text.slice(0, 300) };
    }
    default:
      return { error: `Unknown action: ${action}` };
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    process.stdout.write(`  ${test.name} ... `);
    try {
      const result = await simulateHandleJob(test.action, test.params);
      const resultObj = result as Record<string, unknown>;

      // "lookup invalid"는 error 반환이 정상
      if (test.name === "lookup invalid") {
        if (resultObj.error) {
          console.log(`PASS (expected error: ${resultObj.error})`);
          passed++;
        } else {
          console.log("FAIL (expected error but got success)");
          failed++;
        }
        continue;
      }

      if (resultObj.success) {
        const summary = JSON.stringify(result).slice(0, 120);
        console.log(`PASS ${summary}...`);
        passed++;
      } else {
        console.log(`FAIL ${JSON.stringify(result)}`);
        failed++;
      }
    } catch (err) {
      console.log(`ERROR ${err instanceof Error ? err.message : err}`);
      failed++;
    }

    // EDGAR rate limit 준수 (100ms 간격)
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed, ${TESTS.length} total`);
  process.exit(failed > 0 ? 1 : 0);
}

console.log("SEC EDGAR Skill — Local Test\n");
main();
