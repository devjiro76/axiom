#!/usr/bin/env tsx
/**
 * SEC EDGAR CLI
 *
 * Usage:
 *   tsx src/cli.ts lookup AAPL
 *   tsx src/cli.ts search "artificial intelligence" --forms 10-K --limit 5
 *   tsx src/cli.ts filings AAPL --form 10-K --limit 5
 *   tsx src/cli.ts fetch AAPL <accessionNumber> <primaryDocument>
 */

import { lookupCompany, getFilings, searchFilings, fetchFiling } from "./edgar-client.js";
import { FORM_DESCRIPTIONS, type FormType } from "./types.js";

const [, , command, ...args] = process.argv;

function printHelp() {
  console.log(`
SEC EDGAR CLI

Commands:
  lookup <ticker>                          티커로 회사 정보 조회
  filings <ticker> [--form TYPE] [--limit N]  공시 목록 조회
  search <query> [--forms TYPE,...] [--limit N]  전문 검색
  fetch <ticker> <accession> <document>    공시 본문 가져오기

Form Types:
${Object.entries(FORM_DESCRIPTIONS)
  .map(([k, v]) => `  ${k.padEnd(10)} ${v}`)
  .join("\n")}

Examples:
  tsx src/cli.ts lookup AAPL
  tsx src/cli.ts filings TSLA --form 10-K --limit 3
  tsx src/cli.ts search "revenue growth" --forms 10-K,10-Q --limit 5
  tsx src/cli.ts fetch AAPL 0000320193-23-000106 aapl-20230930.htm
`);
}

function parseFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

async function main() {
  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  switch (command) {
    case "lookup": {
      const ticker = args[0];
      if (!ticker) {
        console.error("Usage: lookup <ticker>");
        process.exit(1);
      }
      const company = await lookupCompany(ticker);
      if (!company) {
        console.error(`Ticker "${ticker}" not found`);
        process.exit(1);
      }
      console.log(JSON.stringify(company, null, 2));
      break;
    }

    case "filings": {
      const ticker = args[0];
      if (!ticker) {
        console.error("Usage: filings <ticker> [--form TYPE] [--limit N]");
        process.exit(1);
      }
      const formType = parseFlag(args, "--form");
      const limit = parseInt(parseFlag(args, "--limit") ?? "10", 10);
      const result = await getFilings(ticker, { formType, limit });

      console.log(`\n${result.company.name} (${result.company.ticker}) — CIK: ${result.company.cik}\n`);
      console.log(`Found ${result.totalCount} filing(s)${formType ? ` (${formType})` : ""}:\n`);

      for (const f of result.filings) {
        console.log(`  ${f.filingDate}  ${f.form.padEnd(10)}  ${f.description}`);
        console.log(`    Accession: ${f.accessionNumber}`);
        console.log(`    Document:  ${f.primaryDocument}\n`);
      }
      break;
    }

    case "search": {
      const query = args[0];
      if (!query) {
        console.error("Usage: search <query> [--forms TYPE,...] [--limit N]");
        process.exit(1);
      }
      const formsStr = parseFlag(args, "--forms");
      const forms = formsStr ? formsStr.split(",") : undefined;
      const limit = parseInt(parseFlag(args, "--limit") ?? "10", 10);

      const result = await searchFilings(query, { forms, limit });
      console.log(`\nSearch: "${result.query}" — ${result.totalHits} total hits\n`);

      for (const hit of result.hits) {
        console.log(`  [${hit.score.toFixed(1)}] ${hit.filingDate}  ${hit.form.padEnd(10)}  ${hit.companyName}`);
        console.log(`    ${hit.description}`);
        console.log(`    Accession: ${hit.accessionNumber}\n`);
      }
      break;
    }

    case "fetch": {
      const [ticker, accession, document] = args;
      if (!ticker || !accession || !document) {
        console.error("Usage: fetch <ticker> <accession> <document>");
        process.exit(1);
      }
      const result = await fetchFiling(ticker, accession, document);
      console.log(`\nURL: ${result.url}`);
      console.log(`Truncated: ${result.truncated}\n`);
      console.log(result.text);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
