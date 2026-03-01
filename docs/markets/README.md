# axiom — 마켓 배포 현황 & 가이드

> Last updated: 2026-03-01

## 배포 현황 요약

### 마켓별 상태

| 마켓 | 상태 | 어댑터 | 수익 모델 | URL |
|------|------|--------|-----------|-----|
| **Virtuals ACP** | ✅ Live (졸업 대기) | `adapters/virtuals-acp/` | USDC per-call | [Link](https://app.virtuals.io/acp/agents/swag6nltvnmdieiqclqkw4om) |
| **MCPize** | ✅ Live | `adapters/mcp-server/` | Stripe (미설정) | [Link](https://mcpize.com/mcp/axiom-mcp) |
| **npm** | ✅ Published | `adapters/mcp-server/` | — | [axiom-data-mcp](https://www.npmjs.com/package/axiom-data-mcp) |
| **Apify** | ✅ Deployed | `adapters/apify/` | 호출당 과금 | [Console](https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y) |
| **Fetch.ai Agentverse** | ⬜ 예정 | `adapters/agentverse/` | FET 토큰 | — |
| **Google Cloud** | ⬜ 조사 필요 | — | 구독/사용량 | — |
| **Microsoft** | ⬜ 조사 필요 | — | 구독/사용량 | — |

### 스킬별 마켓 지원

| Skill | Virtuals ACP | MCPize | npm | Apify | Agentverse |
|-------|:------------:|:------:|:---:|:-----:|:----------:|
| SEC EDGAR | ✅ | ✅ | ✅ | ✅ | ⬜ |
| DeFi Analytics | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Wallet Profiler | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Paper Search | ✅ | ✅ | ✅ | ✅ | ⬜ |
| US Macro Data | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Patent Search | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Token Sentiment | ✅ | ✅ | ✅ | ✅ | ⬜ |

---

## 남은 작업

### Phase 1: MCP 수익화
- [x] npm 패키지 배포 (`npx axiom-data-mcp`)
- [ ] MCPize Stripe 연동 → 가격 설정
- [ ] Cline MCP Marketplace PR 제출

### Phase 2: Apify Actor
- [x] Apify 계정 생성
- [x] `adapters/apify/actor.ts` 구현
- [x] `apify push` 배포
- [ ] Apify 마켓플레이스 공개 (Publication 설정)
- [ ] 마켓 가격 설정 (PPE or Rental)

### Phase 3: Fetch.ai Agentverse
- [ ] Agentverse 계정 & 문서 조사
- [ ] `adapters/agentverse/agent.ts` (uAgent SDK)
- [ ] Almanac 등록 & 배포

### Phase 4: 엔터프라이즈
- [ ] Google Cloud Marketplace 요건 조사
- [ ] Microsoft Marketplace 요건 조사

### Virtuals ACP 잔여
- [ ] axiom 토큰 발행 (100 VIRTUAL)
- [ ] 졸업 리뷰 통과

---

## 마켓별 배포 가이드

### 1. Virtuals ACP (완료)

**인프라**: Railway Hobby ($5/mo), 24/7 WebSocket

```bash
# 로컬 실행
npm run seller

# Railway 배포 (main branch auto-deploy)
railway up
```

**환경변수** (Railway dashboard):
```
WHITELISTED_WALLET_PRIVATE_KEY=0x...
SESSION_ENTITY_KEY_ID=...
AGENT_WALLET_ADDRESS=0x...
FRED_API_KEY=...
ETHERSCAN_API_KEY=...
SEC_EDGAR_USER_AGENT=...
```

**참고**: 등록 난이도 ★★★★★ — 온체인 에이전트 등록, 오퍼링 생성, sandbox 10건 완료, 졸업 신청 필요.

---

### 2. MCPize (완료)

**호스팅**: MCPize 클라우드 (서버리스)

```bash
# 로그인
npx mcpize login

# 배포
npx mcpize deploy --yes

# 시크릿 설정
npx mcpize secrets set FRED_API_KEY <value>
npx mcpize secrets set ETHERSCAN_API_KEY <value>

# 상태 확인
npx mcpize status
```

**로컬 MCP 실행** (Claude Desktop / Cursor):
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

**게이트웨이**: `https://axiom-mcp.mcpize.run`

**설정 파일**: `mcpize.yaml` (프로젝트 루트)

---

### 3. npm (완료)

**패키지**: [axiom-data-mcp](https://www.npmjs.com/package/axiom-data-mcp)

```bash
# 사용자가 설치하는 법
npx axiom-data-mcp

# 배포 (maintainer)
npm run build
npm publish --access public
```

---

### 4. Apify Actor (완료)

**호스팅**: Apify 클라우드 (Docker 기반)

```bash
# 로그인
npx apify-cli login --token <your-token>

# 배포
npx apify-cli push -w 120

# 시크릿 (로컬 설정 → actor.json에서 @참조)
npx apify-cli secrets add fredApiKey <value>
npx apify-cli secrets add etherscanApiKey <value>
```

**Console**: https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y

**어댑터**: `adapters/apify/actor.ts`

**설정 파일**: `.actor/actor.json`, `Dockerfile.apify`

---

### 5. Fetch.ai Agentverse (예정)

**예상 프로세스**:
- Agentverse 브라우저 IDE에서 에이전트 생성
- uAgent SDK로 스킬 래핑
- Almanac에 등록 → 다른 에이전트가 검색 가능

**어댑터 위치**: `adapters/agentverse/agent.ts`

---

## 아키텍처

```
skills/              ← 플랫폼 무관 비즈니스 로직 (7개 스킬)
lib/                 ← 공유 유틸리티
adapters/
  virtuals-acp/      ← Virtuals Protocol (WebSocket, Railway)
  mcp-server/        ← MCP 프로토콜 (stdio, MCPize + npm)
  apify/             ← Apify Actor (Docker, Apify Cloud)
  agentverse/        ← Fetch.ai uAgent (예정)
```

각 어댑터는 `skills/*/handler.ts`의 `handleJobRequest()`를 호출하여 플랫폼별 프로토콜로 변환합니다.
