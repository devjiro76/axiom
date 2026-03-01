#!/usr/bin/env node
/**
 * axiom MCP Server
 *
 * 7개 데이터 스킬을 MCP tool로 노출합니다.
 * Claude Desktop, Cursor, Windsurf 등 MCP 호환 클라이언트에서 사용 가능.
 *
 * Usage:
 *   npx tsx adapters/mcp-server/server.ts          # stdio transport
 */

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─── Skill Handlers ───
import { handleJobRequest as edgarHandler } from "../../skills/sec-edgar/handler.js";
import { handleJobRequest as paperHandler } from "../../skills/paper-search/handler.js";
import { handleJobRequest as defiHandler } from "../../skills/defi-analytics/handler.js";
import { handleJobRequest as macroHandler } from "../../skills/macro-data/handler.js";
import { handleJobRequest as walletHandler } from "../../skills/wallet-profiler/handler.js";
import { handleJobRequest as patentHandler } from "../../skills/patent-search/handler.js";
import { handleJobRequest as sentimentHandler } from "../../skills/token-sentiment/handler.js";

const server = new McpServer({
  name: "axiom",
  version: "0.2.0",
  description: "Financial & research data tools — SEC filings, DeFi analytics, wallet profiling, academic papers, US macro data, patent search, token sentiment",
});

// ─── 1. SEC EDGAR ───
server.tool(
  "sec_edgar_lookup",
  "Look up a company by ticker symbol in SEC EDGAR",
  { ticker: z.string().describe("Stock ticker symbol (e.g. AAPL, TSLA)") },
  async ({ ticker }) => {
    const result = await edgarHandler({ action: "lookup", ticker });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "sec_edgar_filings",
  "Get recent SEC filings (10-K, 10-Q, 8-K, etc.) for a company",
  {
    ticker: z.string().describe("Stock ticker symbol"),
    formType: z.string().optional().describe("Filing type filter (e.g. 10-K, 10-Q, 8-K)"),
    limit: z.number().optional().default(5).describe("Max results to return"),
  },
  async ({ ticker, formType, limit }) => {
    const result = await edgarHandler({ action: "filings", ticker, formType, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "sec_edgar_search",
  "Full-text search across SEC EDGAR filings",
  {
    query: z.string().describe("Search query (e.g. 'artificial intelligence', 'revenue growth')"),
    formType: z.string().optional().describe("Filing type filter"),
    limit: z.number().optional().default(5).describe("Max results to return"),
  },
  async ({ query, formType, limit }) => {
    const result = await edgarHandler({ action: "search", query, formType, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 2. DeFi Analytics ───
server.tool(
  "defi_top_protocols",
  "Get top DeFi protocols by TVL, optionally filtered by chain",
  {
    chain: z.string().optional().describe("Blockchain name filter (e.g. ethereum, bsc, arbitrum)"),
    limit: z.number().optional().default(10).describe("Max results"),
  },
  async ({ chain, limit }) => {
    const result = await defiHandler({ action: "top_protocols", chain, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "defi_protocol_detail",
  "Get detailed info about a specific DeFi protocol",
  { name: z.string().describe("Protocol name (e.g. aave, uniswap, lido)") },
  async ({ name }) => {
    const result = await defiHandler({ action: "protocol_detail", name });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "defi_yield_search",
  "Search yield farming pools with filters",
  {
    chain: z.string().optional().describe("Chain filter"),
    minTvl: z.number().optional().describe("Minimum TVL in USD"),
    sortBy: z.enum(["apy", "tvl"]).optional().describe("Sort by APY or TVL"),
    limit: z.number().optional().default(10).describe("Max results"),
  },
  async ({ chain, minTvl, sortBy, limit }) => {
    const result = await defiHandler({ action: "yield_search", chain, minTvl, sortBy, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "defi_chain_tvl",
  "Get TVL data for blockchain(s)",
  { chains: z.array(z.string()).optional().describe("Chain names to compare") },
  async ({ chains }) => {
    const result = await defiHandler({ action: "chain_tvl", chains });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "defi_stablecoin_stats",
  "Get stablecoin market cap and stats",
  { limit: z.number().optional().default(10).describe("Max results") },
  async ({ limit }) => {
    const result = await defiHandler({ action: "stablecoin_stats", limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 3. Wallet Profiler ───
server.tool(
  "wallet_balance",
  "Get native token balance for a wallet address",
  {
    address: z.string().describe("Wallet address (0x...)"),
    chain: z.enum(["base", "ethereum"]).optional().default("base").describe("Chain to query"),
  },
  async ({ address, chain }) => {
    const result = await walletHandler({ action: "balance", address, chain });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "wallet_tokens",
  "Get ERC-20 token holdings for a wallet",
  {
    address: z.string().describe("Wallet address"),
    chain: z.enum(["base", "ethereum"]).optional().default("base").describe("Chain"),
  },
  async ({ address, chain }) => {
    const result = await walletHandler({ action: "tokens", address, chain });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "wallet_tx_history",
  "Get recent transaction history for a wallet",
  {
    address: z.string().describe("Wallet address"),
    chain: z.enum(["base", "ethereum"]).optional().default("base").describe("Chain"),
    limit: z.number().optional().default(10).describe("Max transactions"),
  },
  async ({ address, chain, limit }) => {
    const result = await walletHandler({ action: "tx_history", address, chain, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "wallet_tx_summary",
  "Get transaction summary stats for a wallet",
  {
    address: z.string().describe("Wallet address"),
    chain: z.enum(["base", "ethereum"]).optional().default("base").describe("Chain"),
  },
  async ({ address, chain }) => {
    const result = await walletHandler({ action: "tx_summary", address, chain });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "wallet_nfts",
  "Get NFT holdings for a wallet",
  {
    address: z.string().describe("Wallet address"),
    chain: z.enum(["base", "ethereum"]).optional().default("base").describe("Chain"),
  },
  async ({ address, chain }) => {
    const result = await walletHandler({ action: "nft_holdings", address, chain });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 4. Paper Search ───
server.tool(
  "paper_search",
  "Search academic papers via Semantic Scholar",
  {
    query: z.string().describe("Search query"),
    year: z.string().optional().describe("Year filter (e.g. '2024', '2020-2024')"),
    fields: z.string().optional().describe("Fields of study filter"),
    limit: z.number().optional().default(5).describe("Max results"),
  },
  async ({ query, year, fields, limit }) => {
    const result = await paperHandler({ action: "search", query, year, fields, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "paper_detail",
  "Get detailed info about a specific paper",
  { paperId: z.string().describe("Semantic Scholar paper ID or DOI") },
  async ({ paperId }) => {
    const result = await paperHandler({ action: "paper_detail", paperId });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "paper_citations",
  "Get citations or references for a paper",
  {
    paperId: z.string().describe("Paper ID"),
    direction: z.enum(["citations", "references"]).optional().default("citations").describe("Citation direction"),
    limit: z.number().optional().default(10).describe("Max results"),
  },
  async ({ paperId, direction, limit }) => {
    const result = await paperHandler({ action: "citations", paperId, direction, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "paper_author",
  "Get papers by a specific author",
  {
    authorId: z.string().describe("Semantic Scholar author ID"),
    limit: z.number().optional().default(10).describe("Max results"),
  },
  async ({ authorId, limit }) => {
    const result = await paperHandler({ action: "author_papers", authorId, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 5. US Macro Data (FRED) ───
server.tool(
  "macro_search",
  "Search FRED economic data series",
  {
    query: z.string().describe("Search query (e.g. 'GDP', 'unemployment rate')"),
    limit: z.number().optional().default(5).describe("Max results"),
  },
  async ({ query, limit }) => {
    const result = await macroHandler({ action: "search", query, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "macro_series",
  "Get observations/data points for a FRED series",
  {
    seriesId: z.string().describe("FRED series ID (e.g. GDP, UNRATE, CPIAUCSL)"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    frequency: z.string().optional().describe("Frequency (d, w, bw, m, q, sa, a)"),
  },
  async ({ seriesId, startDate, endDate, frequency }) => {
    const result = await macroHandler({ action: "series", seriesId, startDate, endDate, frequency });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "macro_popular",
  "Get popular economic indicators (GDP, CPI, unemployment, etc.)",
  {},
  async () => {
    const result = await macroHandler({ action: "popular" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "macro_compare",
  "Compare multiple FRED series side by side",
  {
    seriesIds: z.array(z.string()).describe("Array of FRED series IDs to compare"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
  },
  async ({ seriesIds, startDate }) => {
    const result = await macroHandler({ action: "compare", seriesIds, startDate });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 6. Patent Search ───
server.tool(
  "patent_search",
  "Search US patents via USPTO PatentsView",
  {
    query: z.string().describe("Search query"),
    dateRange: z.string().optional().describe("Date range (e.g. '2020-2024')"),
    limit: z.number().optional().default(5).describe("Max results"),
  },
  async ({ query, dateRange, limit }) => {
    const result = await patentHandler({ action: "search", query, dateRange, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "patent_detail",
  "Get detailed info about a specific patent",
  { patentNumber: z.string().describe("US patent number") },
  async ({ patentNumber }) => {
    const result = await patentHandler({ action: "patent_detail", patentNumber });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "patent_company",
  "Get patents by a company/assignee",
  {
    assignee: z.string().describe("Company/assignee name"),
    limit: z.number().optional().default(5).describe("Max results"),
  },
  async ({ assignee, limit }) => {
    const result = await patentHandler({ action: "company_patents", assignee, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "patent_inventor",
  "Get patents by a specific inventor",
  {
    inventor: z.string().describe("Inventor name"),
    limit: z.number().optional().default(5).describe("Max results"),
  },
  async ({ inventor, limit }) => {
    const result = await patentHandler({ action: "inventor_patents", inventor, limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "patent_trending",
  "Get trending patent technology fields",
  { limit: z.number().optional().default(10).describe("Max results") },
  async ({ limit }) => {
    const result = await patentHandler({ action: "trending_fields", limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── 7. Token Sentiment ───
server.tool(
  "token_overview",
  "Get overview data for a cryptocurrency (price, market cap, volume)",
  { coinId: z.string().describe("CoinGecko coin ID (e.g. bitcoin, ethereum)") },
  async ({ coinId }) => {
    const result = await sentimentHandler({ action: "overview", coinId });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "token_sentiment",
  "Get community sentiment score for a cryptocurrency",
  { coinId: z.string().describe("CoinGecko coin ID") },
  async ({ coinId }) => {
    const result = await sentimentHandler({ action: "sentiment", coinId });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "token_trending",
  "Get trending cryptocurrencies",
  { limit: z.number().optional().default(10).describe("Max results") },
  async ({ limit }) => {
    const result = await sentimentHandler({ action: "trending", limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "token_compare",
  "Compare multiple tokens side by side",
  { coinIds: z.array(z.string()).describe("Array of CoinGecko coin IDs to compare") },
  async ({ coinIds }) => {
    const result = await sentimentHandler({ action: "compare", coinIds });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "token_market_overview",
  "Get overall crypto market overview (total market cap, dominance, etc.)",
  {},
  async () => {
    const result = await sentimentHandler({ action: "market_overview" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ─── Start Server ───
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP stdio server: all logging must go to stderr
  console.error("[axiom-mcp] Server running on stdio");
}

main().catch((err) => {
  console.error("[axiom-mcp] Fatal error:", err);
  process.exit(1);
});
