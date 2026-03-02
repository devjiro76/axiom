# axiom — Multi-Market AI Data Agent

[![MCPize](https://mcpize.com/badge/@devjiro76/axiom-mcp?type=install&style=flat)](https://mcpize.com/mcp/axiom-mcp)
[![npm](https://img.shields.io/npm/v/axiom-data-mcp)](https://www.npmjs.com/package/axiom-data-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Markets](https://img.shields.io/badge/Markets-5-brightgreen)](https://github.com/devjiro76/axiom#marketplaces)
[![Skills](https://img.shields.io/badge/Skills-7-orange)](https://github.com/devjiro76/axiom#skills)

AI agent providing 7 financial & research data skills. Deployed simultaneously across multiple agent marketplaces.

## Skills

| Skill | API | Description |
|-------|-----|-------------|
| SEC EDGAR | SEC (free) | Search 10-K, 10-Q, 8-K and other US filings |
| DeFi Analytics | DefiLlama (free) | TVL, yield, stablecoin analysis |
| Wallet Profiler | Etherscan V2 | Wallet balance, TX, NFT lookup |
| Paper Search | Semantic Scholar (free) | Academic paper search |
| US Macro Data | FRED | Interest rates, GDP, CPI and other indicators |
| Patent Search | USPTO PatentsView | US patent search |
| Token Sentiment | CoinGecko (free) | Crypto sentiment analysis |

## Marketplaces

| Market | Status | URL |
|--------|--------|-----|
| **npm** | Published | [axiom-data-mcp](https://www.npmjs.com/package/axiom-data-mcp) |
| **MCPize** | Live | [axiom-mcp](https://mcpize.com/mcp/axiom-mcp) |
| **Apify** | Deployed | [Actor](https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y) |
| **Virtuals ACP** | Live | [Agent](https://app.virtuals.io/acp/agents/swag6nltvnmdieiqclqkw4om) |
| **Fetch.ai Agentverse** | Deployed | Railway hosted |

## Quick Start

### MCP Server (Claude Desktop / Cursor)

```json
{
  "mcpServers": {
    "axiom": {
      "command": "npx",
      "args": ["-y", "axiom-data-mcp"],
      "env": {
        "FRED_API_KEY": "your-key",
        "ETHERSCAN_API_KEY": "your-key"
      }
    }
  }
}
```

Or install via MCPize:

```bash
npx -y mcpize connect @devjiro76/axiom-mcp --client claude
```

### Apify Actor

Run via [Apify Console](https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y) or API.

## Project Structure

```
adapters/
  virtuals-acp/    # Virtuals Protocol ACP seller
  mcp-server/      # MCP server (30 tools)
  apify/           # Apify Actor
  agentverse/      # Fetch.ai Agentverse adapter
skills/            # 7 skill implementations
lib/               # Shared utilities (skill-registry)
```

## Environment Variables

```bash
# Optional API keys (per skill)
FRED_API_KEY=...
ETHERSCAN_API_KEY=...
SEC_EDGAR_USER_AGENT=...
```

## License

MIT
