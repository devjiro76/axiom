# axiom — Fetch.ai Agentverse Adapter

Python uAgent that exposes axiom's 7 data skills on Fetch.ai Agentverse.

## Architecture

```
Agentverse (Almanac) ← uAgent (Python) → Apify Actor API → skill handlers
```

No Node.js dependency — reuses the already-deployed Apify Actor as backend.

## Setup

```bash
cd adapters/agentverse
pip install -r requirements.txt
```

## Configuration

```bash
export AGENT_SEED="your-unique-seed-phrase"
export APIFY_TOKEN="your-apify-api-token"        # optional for public actor
export APIFY_ACTOR_ID="Nma9xvyeLgNeNXz9Y"        # default
export AGENT_PORT=8000                             # default
```

## Run

```bash
python agent.py
```

On first run, the agent registers with Agentverse via mailbox.
Follow the Agent Inspector URL to connect.

## Protocol

### ListSkillsRequest → ListSkillsResponse
```json
// Request: {}
// Response:
{
  "skills": ["sec-edgar", "defi-analytics", ...],
  "description": "axiom: Multi-skill AI data agent..."
}
```

### SkillRequest → SkillResponse
```json
// Request:
{
  "skill": "sec-edgar",
  "action": "filings",
  "params": {"ticker": "AAPL", "limit": 5}
}
// Response:
{
  "success": true,
  "data": { ... },
  "error": ""
}
```
