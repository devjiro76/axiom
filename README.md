# SEC EDGAR Skill for Virtual ACP

미국 SEC 공시(10-K, 10-Q, 8-K)를 검색하고 조회하는 OpenClaw 스킬 + Virtual Protocol ACP 서비스.

> 크립토/지갑이 처음이라면 → [WALLET-GUIDE.md](./WALLET-GUIDE.md) 먼저 읽기

## 빠른 시작 (로컬 테스트)

```bash
npm install
npm test                                    # EDGAR 파이프라인 전체 테스트
npm run lookup -- AAPL                      # 회사 조회
npm run filings -- TSLA --form 10-K         # 공시 목록
npm run search -- "artificial intelligence" # 전문 검색
```

## 프로젝트 구조

```
├── SKILL.md                         # OpenClaw 스킬 정의
├── src/
│   ├── edgar-client.ts              # EDGAR API 클라이언트
│   ├── cli.ts                       # CLI 도구
│   ├── seller.ts                    # ACP 셀러 런타임
│   ├── buyer-test.ts                # ACP 바이어 테스트 (Sandbox용)
│   ├── acp-config.ts                # ACP 설정 로더
│   ├── types.ts                     # 타입 정의
│   └── test-local.ts                # 로컬 통합 테스트
└── seller/offerings/sec-filing-search/
    ├── offering.json                # ACP 서비스 정의
    └── handlers.ts                  # ACP 핸들러
```

---

## 남은 수동 작업

코드는 완성 상태. 아래 단계만 수동으로 진행하면 ACP 라이브 가능.

### Step 1. MetaMask 지갑 생성 (~10분)

- [ ] MetaMask 브라우저 확장 설치 (https://metamask.io)
- [ ] 새 지갑 생성, 시드 구문 안전하게 보관
- [ ] Base 네트워크 추가:
  - 이름: `Base` / RPC: `https://mainnet.base.org` / Chain ID: `8453`
- [ ] Base Sepolia(테스트넷) 추가:
  - 이름: `Base Sepolia` / RPC: `https://sepolia.base.org` / Chain ID: `84532`
- [ ] **바이어용 계정도 별도 생성** (MetaMask에서 계정 추가)

### Step 2. 자금 확보 (~10분)

테스트넷(무료):
- [ ] Base Sepolia Faucet에서 테스트 ETH 수령 (https://www.alchemy.com/faucets/base-sepolia)

메인넷($3~5):
- [ ] ETH 구매 → Base로 브릿지 (https://bridge.base.org)
- [ ] Base에서 USDC 소량 확보

### Step 3. Virtual Protocol 셀러 에이전트 등록 (~15분)

- [ ] https://app.virtuals.io 접속 → MetaMask 지갑 연결
- [ ] "Join ACP" → "Register New Agent"
- [ ] 정보 입력:
  - Name: `SEC EDGAR Search`
  - Profile Picture: 아무 이미지
  - Description: `Search and retrieve SEC EDGAR filings for any US public company`
  - Role: **Provider** (또는 Hybrid)
- [ ] "Create Smart Contract Account" 클릭 (가스비 ~$0.05)
- [ ] "Whitelist Wallet" 클릭
- [ ] Job Offering 생성:
  - Name: `SEC Filing Search`
  - Description: `Search SEC filings (10-K, 10-Q, 8-K) by company or keyword`
  - Price: `$0.001`
- [ ] 저장 후 `AGENT_WALLET_ADDRESS`, `SESSION_ENTITY_KEY_ID` 메모

### Step 4. 바이어 테스트 에이전트 등록 (~10분)

- [ ] 바이어용 계정(Step 1에서 생성한)으로 동일 과정 반복
  - Name: `SEC Research Buyer (Test)`
  - Role: **Requestor**
- [ ] `BUYER_WALLET_ADDRESS`, `BUYER_ENTITY_KEY_ID` 메모

### Step 5. 환경변수 설정 (~5분)

```bash
cp .env.example .env
```

- [ ] `.env` 파일에 Step 3~4에서 받은 값 채우기:
  - `WHITELISTED_WALLET_PRIVATE_KEY` — MetaMask → 계정 → Export Private Key
  - `SESSION_ENTITY_KEY_ID` — ACP 등록 시 부여된 ID
  - `AGENT_WALLET_ADDRESS` — Smart Contract Account 주소
  - `BUYER_*` — 바이어 쪽도 동일하게
  - `SEC_EDGAR_USER_AGENT` — 본인 이름 + 이메일

### Step 6. ACP 셀러 실행 + Sandbox 10건 거래 (~10분)

```bash
# 터미널 1: 셀러 시작
npm run seller

# 터미널 2: 바이어 테스트 10건
npm run buyer:test -- --count 10
```

- [ ] 10건 모두 COMPLETED 확인

### Step 7. Graduation 신청 (~7 영업일 대기)

- [ ] app.virtuals.io에서 에이전트 페이지 → Graduation 신청
- [ ] 제출 자료 준비:
  - 에이전트 서비스 스크린샷
  - 작동 영상 (화면 녹화)
  - SDK 최신 버전 사용 확인
- [ ] 심사 결과 대기 (~7 영업일)
- [ ] 승인 후 마켓플레이스에 노출 → 다른 에이전트로부터 작업 수신 시작

---

## 비용 요약

| 항목 | 비용 |
|------|------|
| 지갑 생성 + Base 가스비 | ~$1-2 |
| USDC 테스트 자금 | ~$1-2 |
| ACP 등록 | 무료 (가스비만) |
| **합계 (테스트넷이면)** | **무료** |
| **합계 (메인넷이면)** | **~$3-5** |
