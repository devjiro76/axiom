# SEC EDGAR Skill — 설정 가이드

이 문서는 수동으로 해야 하는 단계만 정리한 것입니다.
코드는 이미 완성되어 있으므로, 아래 단계만 따라하면 됩니다.

---

## Phase 1: 지갑 + 자금 (10~20분)

### 1-1. MetaMask 설치
- https://metamask.io 에서 브라우저 확장 설치
- 새 지갑 생성 → 시드 구문 안전하게 보관

### 1-2. Base 네트워크 추가
MetaMask에서:
- 네트워크 추가 → 직접 추가
- 이름: `Base`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- 통화: `ETH`
- 블록 탐색기: `https://basescan.org`

테스트넷도 추가:
- 이름: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`

### 1-3. 자금 확보

**테스트넷 (무료):**
- Base Sepolia Faucet: https://www.alchemy.com/faucets/base-sepolia
- 테스트 USDC는 ACP Sandbox에서 자동 제공될 수 있음

**메인넷 ($3-5):**
- ETH 구매 → Base로 브릿지 (https://bridge.base.org)
- USDC 구매 (Base 네트워크에서)

---

## Phase 2: Virtual Protocol 에이전트 등록 (30분)

### 2-1. 셀러 에이전트 등록
1. https://app.virtuals.io 접속
2. MetaMask로 지갑 연결
3. 우측 상단 "Join ACP" 클릭
4. "Register New Agent" 클릭
5. 정보 입력:
   - **Name**: `SEC EDGAR Search`
   - **Profile Picture**: 아무 이미지
   - **Description**: `Search and summarize SEC EDGAR filings for any US public company`
   - **Role**: Provider (또는 Hybrid)
6. "Create Smart Contract Account" 클릭 (가스비 필요)
7. "Whitelist Wallet" 클릭
8. Job Offering 생성:
   - Name: `SEC Filing Search & Summary`
   - Description: `Search SEC filings (10-K, 10-Q, 8-K) by company or keyword`
   - Price: `$0.001` (테스트용)
9. 저장

### 2-2. 바이어 테스트 에이전트 등록
위와 같은 방법으로 별도의 바이어 에이전트 등록:
- **Name**: `SEC Research Buyer (Test)`
- **Role**: Requestor
- 별도의 지갑 주소 사용 (MetaMask에서 계정 추가)

### 2-3. 환경변수 설정
```bash
cp .env.example .env
```

.env 파일을 열고 등록 후 받은 값들을 채우세요:
- `WHITELISTED_WALLET_PRIVATE_KEY`: MetaMask → 계정 → Export Private Key
- `SESSION_ENTITY_KEY_ID`: ACP 등록 시 부여된 Entity Key ID
- `AGENT_WALLET_ADDRESS`: Smart Contract Account 주소
- 바이어 쪽도 동일하게 채우기

---

## Phase 3: 실행 (5분)

### 셀러 시작
```bash
npm run seller
```

### 바이어 테스트 (별도 터미널)
```bash
# 1건 테스트
npm run buyer:test

# 10건 연속 테스트 (Sandbox 통과용)
npm run buyer:test -- --count 10
```

---

## Phase 4: Graduation 신청

10건 성공 거래 후:
1. app.virtuals.io에서 에이전트 페이지 접속
2. Graduation 신청 버튼 클릭
3. 제출 자료:
   - 에이전트 서비스 스크린샷
   - 작동 영상 (화면 녹화)
   - SDK 최신 버전 사용 확인
4. ~7 영업일 후 심사 결과

---

## 문제 해결

### "Missing environment variable" 에러
→ .env 파일이 없거나 값이 비어있음. .env.example에서 복사했는지 확인

### "Session key not registered" 에러
→ ACP 등록 시 지갑 화이트리스트가 안 됐을 수 있음. app.virtuals.io에서 확인

### Seller가 작업을 못 받음
→ Seller 프로세스가 실행 중인지 확인. WebSocket 연결이 끊기면 재시작

### 거래가 EXPIRED 됨
→ Seller 응답이 너무 느림. EDGAR API 속도 제한(10 req/s)에 걸린 건 아닌지 확인
