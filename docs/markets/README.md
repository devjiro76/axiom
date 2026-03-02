# axiom — 마켓 배포 현황 & 수익화 가이드

> Last updated: 2026-03-01

## 배포 현황 요약

### 마켓별 상태

| 마켓 | 배포 | 수익 수령 가능 | 수익 모델 | 수령률 | URL |
|------|:----:|:-------------:|-----------|:------:|-----|
| **MCPize** | ✅ | **PayPal 설정완료** | 구독 (Free/$4.99/$19.99) | 85% | [Link](https://mcpize.com/mcp/axiom-mcp) |
| **Apify** | ✅ | **PPE 설정완료 (3/15~)** | Pay-per-event | 80% | [Store](https://apify.com/bodacious_avatar/axiom-data-agent) |
| **Virtuals ACP** | ✅ | **불가 (testnet)** | USDC 에스크로 per-call | 60% | [Link](https://app.virtuals.io/acp/agents/swag6nltvnmdieiqclqkw4om) |
| **Agentverse** | ✅ | **불가 (미구현)** | Payment Protocol (초기) | 미정 | [Agent](https://agentverse.ai/agents/details/agent1qdllwygk42gcy82um56xa9rnhwvljum7fe9pcj38swtr3d9l59pxcqv69qr/profile) |
| **npm** | ✅ | 해당없음 | 무료 배포 (MCPize 유도) | 0% | [axiom-data-mcp](https://www.npmjs.com/package/axiom-data-mcp) |
| Cline Marketplace | ⏳ 리뷰 중 | — | — | — | Issue #733 |

### 스킬별 마켓 지원

| Skill | Virtuals ACP | MCPize | npm | Apify | Agentverse |
|-------|:------------:|:------:|:---:|:-----:|:----------:|
| SEC EDGAR | ✅ | ✅ | ✅ | ✅ | ✅ |
| DeFi Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wallet Profiler | ✅ | ✅ | ✅ | ✅ | ✅ |
| Paper Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| US Macro Data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patent Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Token Sentiment | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 수익화 상세

### MCPize (최우선)

- **수익 모델**: 구독제 (Free / Basic $4.99 / Pro $19.99)
- **수익 분배**: 개발자 85%, 플랫폼 15%
- **수령 방법**: Stripe Connect → 은행 계좌 직접 입금
- **현재 상태**: ✅ PayPal 설정 완료 (devjiro76@gmail.com, Active)
- **구독자**: 0명
- **필요 조치**: 유료 구독자 유치만 남음
- **대시보드**: https://mcpize.com/developer/servers/f72d6134-76fa-4be2-b201-0fe86038f646?tab=monetize

### Apify Store (우선)

- **수익 모델**: Pay-per-event (PPE) 또는 Rental (월정액)
- **수익 분배**: 개발자 80%, 플랫폼 20%
- **수령 방법**: PayPal (최소 $20) 또는 은행 송금 (최소 $100)
- **현재 상태**: ✅ PPE 모델 설정 완료 (2026-03-15 적용)
  - Billing details: Choi JungHyun, Seoul, South Korea
  - Payment method: Amex ....7719
  - Beneficiary payout: PayPal (devjiro76@gmail.com)
  - Pricing: Result $0.00001 + Actor Start $0.00005
- **지급 주기**: 매월 11일 청구서 → 승인 후 14일 내 PayPal 송금
- **필요 조치**:
  1. ~~Billing details 입력~~ ✅
  2. ~~Payment method 설정~~ ✅
  3. ~~Monetization PPE 설정~~ ✅
  4. Identity verification 완료 (신분증 필요)
  5. (권장) Output schema 추가
- **콘솔**: https://console.apify.com/actors/Nma9xvyeLgNeNXz9Y/publication

### Virtuals ACP (졸업 리뷰 대기)

- **수익 모델**: 에스크로 기반 USDC 정산
- **수익 분배**: Seller 60% + 토큰 바이백 30% + 프로토콜 10%
- **수령 위치**: Agent 지갑 (AGENT_WALLET_ADDRESS) → Butler Wallet에서 출금
- **현재 상태**: 졸업 폼 제출 완료, Virtuals 팀 리뷰 대기 중 (7 영업일)
- **서비스 가격**: 0.001 USDC/request (offering.json)
- **졸업 요건 충족**:
  - Consecutive Successful Jobs: 3/3 ✅
  - Total Successful Jobs: 14/10 ✅
  - Submission Form: 제출 완료 ✅
- **졸업 후 필요 조치**:
  1. mainnet 전환 (NETWORK=mainnet)
  2. 토큰 발행은 별도 (선택, ACP 졸업과 무관)
- **Revenue Incentive**: 월 최대 $1M USDC 풀에서 ACP seller에 추가 분배

### Fetch.ai Agentverse (장기)

- **수익 모델**: Payment Protocol (USDC/FET, v0.1.0 초기)
- **현재 상태**: 무료 서비스 제공 중, Payment Protocol 미구현
- **지원 결제**: skyfire (Visa), fet_direct (온체인 FET)
- **현실적 평가**: 수익화 인프라 미성숙, 구체적 수수료율/정산 정보 부재
- **필요 조치**: Payment Protocol 구현 (장기 과제)

### npm (간접 수익)

- **수익 모델**: 없음 (무료 오픈소스)
- **역할**: MCPize 유료 플랜으로의 유입 채널
- **추가 옵션**: GitHub Sponsors, package.json funding 필드

---

## 수익화 우선순위

```
[완료] MCPize PayPal 설정 → 구독 수익 수령 가능 ✅
[완료] Apify PPE 모델 설정 → 3/15부터 수익 수령 가능 ✅
[대기] Apify Identity verification (신분증)
[리뷰 대기] Virtuals ACP 졸업 (폼 제출 완료, 7 영업일 내 결과)
[장기] Agentverse Payment Protocol 구현
```

---

## 남은 작업

### Phase 1: 수익 수령 인프라 (최우선)
- [x] MCPize PayPal 설정 (devjiro76@gmail.com, Active)
- [x] Apify Billing + Payment method 설정
- [x] Apify 유료 모델 전환 (PPE, 3/15 적용)
- [ ] Apify Identity verification (신분증)

### Phase 2: 마켓 확장
- [x] npm 패키지 배포 (`npx axiom-data-mcp`)
- [ ] Cline MCP Marketplace 승인 대기 (#733)

### Phase 3: Virtuals ACP 졸업 (리뷰 대기)
- [x] 샌드박스 10건+ 성공 (14/10)
- [x] 3건 연속 성공 (3/3)
- [x] 졸업 폼 제출
- [ ] Virtuals 팀 리뷰 통과 (대기 중)
- [ ] mainnet 전환

### Phase 4: 장기
- [ ] Agentverse Payment Protocol 구현
- [ ] Google Cloud / Microsoft Marketplace 조사

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
