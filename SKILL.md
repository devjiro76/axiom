---
name: sec-edgar-search
description: Search and summarize SEC EDGAR filings (10-K, 10-Q, 8-K) for any US public company.
version: 0.1.0
metadata:
  openclaw:
    requires:
      bins:
        - node
        - npx
    emoji: "scroll"
    homepage: https://github.com/virtual-acp/sec-edgar-skill
---

# SEC EDGAR Filing Search & Summary

You can search, retrieve, and summarize SEC filings for any US public company using the EDGAR API.

## Available Commands

Run these commands using `npx tsx` from the skill directory:

### 1. Company Lookup
Find company info by ticker symbol.
```bash
npx tsx src/cli.ts lookup AAPL
```

### 2. Filing List
Get recent filings for a company, optionally filtered by form type.
```bash
npx tsx src/cli.ts filings TSLA --form 10-K --limit 5
```

### 3. Full-Text Search
Search across all SEC filings by keyword.
```bash
npx tsx src/cli.ts search "artificial intelligence" --forms 10-K,10-Q --limit 5
```

### 4. Fetch Filing Content
Retrieve the full text of a specific filing.
```bash
npx tsx src/cli.ts fetch AAPL 0000320193-23-000106 aapl-20230930.htm
```

## Workflow

When a user asks about SEC filings, follow this process:

1. **Identify the company** — Use `lookup` to confirm the ticker and CIK.
2. **Find relevant filings** — Use `filings` (by company) or `search` (by keyword) to locate filings.
3. **Retrieve content** — Use `fetch` to get the filing text.
4. **Summarize** — Read the retrieved text and provide a concise summary focusing on:
   - Key financial metrics (revenue, net income, EPS)
   - Risk factors and forward-looking statements
   - Material changes from prior period
   - Any specific topic the user asked about

## Form Types

| Form | Description |
|------|-------------|
| 10-K | Annual Report — comprehensive yearly financial overview |
| 10-Q | Quarterly Report — unaudited quarterly financials |
| 8-K  | Current Report — material events (acquisitions, leadership changes, etc.) |
| S-1  | IPO Registration Statement |
| DEF 14A | Proxy Statement — executive compensation, shareholder votes |
| 20-F | Foreign company annual report |

## Tips

- For earnings analysis, look at 10-K (annual) or 10-Q (quarterly).
- For breaking news about a company, check recent 8-K filings.
- The `search` command is useful for finding filings that mention specific topics across all companies.
- Filing text can be long. Focus on the sections relevant to the user's question.
