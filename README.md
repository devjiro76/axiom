# axiom — Multi-Market AI Data Agent

7개 금융/리서치 데이터 스킬을 제공하는 AI 에이전트. 복수 마켓플레이스에 동시 배포.

## Skills

| Skill | API | Description |
|-------|-----|-------------|
| SEC EDGAR | SEC (무료) | 10-K, 10-Q, 8-K 등 미국 공시 검색 |
| DeFi Analytics | DefiLlama (무료) | TVL, yield, stablecoin 분석 |
| Wallet Profiler | Etherscan V2 | 지갑 잔고, TX, NFT 조회 |
| Paper Search | Semantic Scholar (무료) | 학술 논문 검색 |
| US Macro Data | FRED | 금리, GDP, CPI 등 경제지표 |
| Patent Search | USPTO PatentsView | 미국 특허 검색 |
| Token Sentiment | CoinGecko (무료) | 암호화폐 감성 분석 |

## Marketplaces

| Market | Status | URL |
|--------|--------|-----|
| **npm** | Published | [axiom-data-mcp](https://www.npmjs.com/package/axiom-data-mcp) |
| **MCPize** | Live | https://mcpize.com/mcp/axiom-mcp |
| **Apify** | Deployed | [Console](https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y) |
| **Virtuals ACP** | 졸업 대기 | https://app.virtuals.io/acp/agents/swag6nltvnmdieiqclqkw4om |
| Fetch.ai Agentverse | 예정 | — |

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

Or use the hosted endpoint: `https://axiom-mcp.mcpize.run`

### ACP Seller (Virtuals Protocol)

```bash
npm run seller
```

### Apify Actor

Run via [Apify Console](https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y) or API.

## Project Structure

```
adapters/
  virtuals-acp/    # Virtuals Protocol ACP seller
  mcp-server/      # MCP server (30 tools)
  apify/           # Apify Actor
skills/            # 7 skill implementations
lib/               # Shared utilities (skill-registry)
```

## Commands

```bash
npm run mcp           # MCP server (stdio)
npm run seller        # ACP seller (WebSocket)
npm run buyer:test    # ACP buyer test
npm run typecheck     # TypeScript check
```

## Deployment

See [docs/markets/README.md](docs/markets/README.md) for full deployment guide.

### Quick Reference

```bash
# MCPize
npx mcpize deploy --yes

# npm
npm publish --access public

# Apify
npx apify-cli push -w 120

# Railway (ACP)
railway up
```

## Environment Variables

```bash
# Required for ACP
WHITELISTED_WALLET_PRIVATE_KEY=0x...
SESSION_ENTITY_KEY_ID=...
AGENT_WALLET_ADDRESS=0x...

# Optional API keys (스킬별)
FRED_API_KEY=...
ETHERSCAN_API_KEY=...
SEC_EDGAR_USER_AGENT=...
PATENTSVIEW_API_KEY=...
```

## License

MIT
