# SEC EDGAR Skill

Search and retrieve SEC filings (10-K, 10-Q, 8-K, etc.) for any US public company.

**No API key required** — SEC EDGAR is a free, public API.

## Install & Run

```bash
git clone https://github.com/virtual-acp/sec-edgar-skill.git
cd sec-edgar-skill
npm install
```

## Usage

### CLI

```bash
# Company lookup
npx tsx src/cli.ts lookup AAPL

# Recent filings (10-K annual reports, last 5)
npx tsx src/cli.ts filings TSLA --form 10-K --limit 5

# Full-text search across all companies
npx tsx src/cli.ts search "artificial intelligence" --forms 10-K,10-Q --limit 5

# Fetch filing content
npx tsx src/cli.ts fetch AAPL 0000320193-23-000106 aapl-20230930.htm
```

### npm Scripts

```bash
npm run lookup -- AAPL
npm run filings -- TSLA --form 10-K
npm run search -- "revenue growth"
npm test                              # Full pipeline test
```

### As a Library

```typescript
import { lookupCompany, getFilings, searchFilings, fetchFiling } from "./src/edgar-client.js";

const company = await lookupCompany("AAPL");
const filings = await getFilings("AAPL", { formType: "10-K", limit: 3 });
const results = await searchFilings("AI risk", { forms: ["10-K"], limit: 5 });
```

## Project Structure

```
src/                        Core skill code (no ACP dependency)
├── edgar-client.ts         EDGAR API client
├── cli.ts                  CLI tool
├── types.ts                Type definitions
├── job-handler.ts          Request handler logic
└── test-local.ts           Local integration test

acp/                        ACP server mode (optional)
├── seller.ts               ACP seller runtime
├── buyer-test.ts           ACP buyer test
├── acp-config.ts           ACP config loader
└── offerings/              ACP offering definition

SKILL.md                    Skill description for AI agents
```

## Environment Variables (Optional)

```bash
# EDGAR User-Agent (recommended — falls back to default if unset)
SEC_EDGAR_USER_AGENT="YourName contact@email.com"
```

## Form Types

| Form | Description |
|------|-------------|
| 10-K | Annual Report |
| 10-Q | Quarterly Report |
| 8-K | Current Report (acquisitions, leadership changes, etc.) |
| S-1 | IPO Registration Statement |
| DEF 14A | Proxy Statement |
| 20-F | Foreign Company Annual Report |

## ACP Server Mode (Optional)

To offer this as a paid service on the Virtual Protocol ACP marketplace, see the `acp/` directory.

```bash
# After configuring .env
npm run seller      # Start seller
npm run buyer:test  # Run buyer test
```

See [SETUP.md](./SETUP.md) for detailed ACP configuration.

## License

MIT
