# axiom MCP Server — Installation Guide for AI Agents

## Overview

axiom is a multi-skill data agent providing 30 MCP tools across 7 data domains:
SEC filings, DeFi analytics, wallet profiling, academic papers, US macro data, patent search, and crypto sentiment.

## Installation

Run the server using npx (no clone needed):

```bash
npx axiom-data-mcp
```

## Configuration

Add to your MCP settings (e.g. `cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "axiom": {
      "command": "npx",
      "args": ["-y", "axiom-data-mcp"],
      "env": {
        "FRED_API_KEY": "optional-fred-api-key",
        "ETHERSCAN_API_KEY": "optional-etherscan-api-key",
        "SEC_EDGAR_USER_AGENT": "optional-email-for-sec"
      }
    }
  }
}
```

## Environment Variables

All API keys are **optional**. Skills with missing keys will still work with free-tier APIs or be disabled gracefully.

| Variable | Required | Description |
|----------|----------|-------------|
| `FRED_API_KEY` | Optional | Federal Reserve (FRED) API key for US macro data |
| `ETHERSCAN_API_KEY` | Optional | Etherscan V2 key for wallet profiling |
| `SEC_EDGAR_USER_AGENT` | Optional | Email address for SEC EDGAR rate limit compliance |

## Available Tools (30 total)

### SEC EDGAR (4 tools)
- `sec_edgar_lookup` — Company CIK lookup by ticker
- `sec_edgar_filings` — Recent SEC filings (10-K, 10-Q, 8-K, etc.)
- `sec_edgar_filing_detail` — Full text of a specific filing
- `sec_edgar_search` — Full-text search across all SEC filings

### DeFi Analytics (5 tools)
- `defi_top_protocols` — Top DeFi protocols by TVL
- `defi_protocol_detail` — Protocol TVL history and details
- `defi_chain_tvl` — Chain-level TVL data
- `defi_top_yields` — Highest yield farming opportunities
- `defi_stablecoin_overview` — Stablecoin market overview

### Wallet Profiler (4 tools)
- `wallet_eth_balance` — ETH balance for an address
- `wallet_token_balances` — ERC-20 token holdings
- `wallet_recent_transactions` — Recent transaction history
- `wallet_nft_holdings` — NFT collection holdings

### Paper Search (3 tools)
- `paper_search` — Search academic papers by keyword
- `paper_detail` — Get paper details by Semantic Scholar ID
- `paper_citations` — Get citing/referenced papers

### US Macro Data (4 tools)
- `macro_series` — Get economic data series from FRED
- `macro_search` — Search for FRED data series
- `macro_category` — Browse FRED categories
- `macro_releases` — Recent FRED data releases

### Patent Search (4 tools)
- `patent_search` — Search US patents by keyword
- `patent_detail` — Get patent details by number
- `patent_inventor` — Search patents by inventor
- `patent_assignee` — Search patents by assignee/company

### Token Sentiment (6 tools)
- `token_price` — Current crypto price and market data
- `token_market_chart` — Historical price chart
- `token_trending` — Trending cryptocurrencies
- `token_search` — Search for a cryptocurrency
- `token_global_market` — Global crypto market overview
- `token_sentiment_score` — AI-generated sentiment score

## Verification

After installation, verify the server is working:

```bash
npx axiom-data-mcp
```

The server should start without errors on stdio. Tools will be available immediately in your MCP client.
