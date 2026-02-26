# 지갑 가이드 (크립토 완전 초보용)

---

## 1. 지갑이란?

- 은행 계좌 같은 것. 단, 은행 없이 내가 직접 관리함
- **지갑 주소** = 계좌번호 (0x로 시작하는 긴 문자열)
- **개인키(Private Key)** = 비밀번호. 이걸 잃으면 돈을 영원히 못 찾음
- **시드 구문(Seed Phrase)** = 개인키를 복구하는 12개 영어 단어

> 개인키와 시드 구문은 **절대** 누구에게도 공유하지 마세요.
> 스크린샷, 클라우드, 메신저에 저장하지 마세요.
> 종이에 적어서 안전한 곳에 보관하세요.

---

## 2. MetaMask 지갑 만들기

### 2-1. 설치
1. Chrome 브라우저에서 https://metamask.io 접속
2. "Download" 클릭 → Chrome 확장 프로그램 설치
3. 브라우저 우측 상단 퍼즐 아이콘 → MetaMask 핀 고정

### 2-2. 지갑 생성
1. MetaMask 열기 → "Create a new wallet" 클릭
2. 비밀번호 설정 (이건 이 컴퓨터에서만 쓰는 잠금 비밀번호)
3. **시드 구문 12개 단어가 나옴** → 종이에 적기
4. 순서대로 단어 확인 → 완료

### 2-3. Base 네트워크 추가
MetaMask는 기본적으로 Ethereum 메인넷만 연결되어 있음.
ACP는 Base 네트워크를 사용하므로 추가해야 함.

1. MetaMask 좌측 상단 네트워크 선택 클릭
2. "+ Add network" 클릭
3. "Add a network manually" 클릭
4. 아래 정보 입력:

**메인넷 (실제 돈):**
| 항목 | 값 |
|------|-----|
| Network Name | `Base` |
| New RPC URL | `https://mainnet.base.org` |
| Chain ID | `8453` |
| Currency Symbol | `ETH` |
| Block Explorer | `https://basescan.org` |

**테스트넷 (가짜 돈, 연습용):**
| 항목 | 값 |
|------|-----|
| Network Name | `Base Sepolia` |
| New RPC URL | `https://sepolia.base.org` |
| Chain ID | `84532` |
| Currency Symbol | `ETH` |
| Block Explorer | `https://sepolia.basescan.org` |

5. Save 클릭

### 2-4. 바이어용 두 번째 계정 만들기
ACP 테스트에는 셀러 + 바이어 두 개 계정이 필요함.

1. MetaMask 우측 상단 동그라미 아이콘 클릭
2. "+ Add account or hardware wallet" → "Add a new account"
3. 이름: `Buyer Test` 등으로 설정
4. 이 계정의 주소도 메모

---

## 3. 입금하기 (지갑에 돈 넣기)

### 방법 A: 테스트넷 (무료, 연습용) — 추천

테스트넷은 가짜 돈이지만 ACP Sandbox 테스트에 충분함.

1. MetaMask에서 네트워크를 **Base Sepolia**로 변경
2. 지갑 주소 복사 (0x... 클릭하면 복사됨)
3. https://www.alchemy.com/faucets/base-sepolia 접속
4. 지갑 주소 붙여넣기 → "Send Me ETH" 클릭
5. 몇 초 후 MetaMask에 테스트 ETH 도착

### 방법 B: 메인넷 (실제 돈, $3~5)

#### 한국 거래소 이용 시 (업비트/빗썸)
1. **업비트**(또는 빗썸)에서 ETH 구매 (~5,000원어치)
2. 업비트 → 출금 → 네트워크: **Base** 선택
   - ⚠️ Base 네트워크 출금을 지원하는지 확인 필요
   - 미지원 시 → Ethereum 메인넷으로 출금 후 브릿지 (방법 C)
3. MetaMask 주소 입력 → 출금
4. 1~5분 후 MetaMask에 ETH 도착

#### 방법 C: 브릿지 (Ethereum → Base)
업비트에서 Base 직접 출금이 안 되면:
1. 업비트에서 Ethereum 메인넷으로 ETH 출금
2. MetaMask에 ETH 도착 확인 (네트워크: Ethereum Mainnet)
3. https://bridge.base.org 접속
4. MetaMask 연결 → 원하는 금액 입력 → Bridge 클릭
5. 몇 분 후 Base 네트워크에 ETH 도착

#### USDC 확보
ACP 거래는 USDC(달러 연동 스테이블코인)로 이루어짐.

방법 1 — DEX에서 스왑:
1. https://app.uniswap.org 접속
2. MetaMask 연결 (네트워크: Base)
3. ETH → USDC 스왑 (원하는 금액만큼)

방법 2 — 거래소에서 직접:
1. 업비트에서 USDC 구매 → Base로 출금

---

## 4. 수익은 어디에 쌓이나?

### ACP에서 수익이 발생하는 흐름

```
바이어 에이전트가 내 서비스 요청
  → 바이어의 USDC가 스마트 컨트랙트(에스크로)에 잠김
  → 내 셀러가 작업 완료 + 결과 전달
  → 바이어(또는 평가자)가 승인
  → USDC가 내 에이전트의 Smart Contract Account로 전송됨
```

- 수익은 **에이전트의 Smart Contract Account** (ACP 등록 시 생성된 주소)에 USDC로 쌓임
- MetaMask에 이 주소를 추가하면 잔액 확인 가능

### USDC 잔액 확인하기
1. MetaMask → 네트워크: Base
2. "Import tokens" 클릭
3. Token Contract Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
4. Symbol: `USDC`, Decimals: `6`
5. Add → USDC 잔액이 표시됨

---

## 5. 수익 빼내기 (원화로 전환)

### 전체 흐름

```
에이전트 Smart Wallet (USDC on Base)
  → MetaMask 개인 지갑으로 전송
  → (필요 시) Ethereum 메인넷으로 브릿지
  → 한국 거래소(업비트)로 전송
  → 원화로 환전
  → 은행 계좌로 출금
```

### Step by Step

#### 5-1. Smart Wallet → MetaMask 개인 지갑
ACP Smart Wallet에서 개인 지갑으로 USDC 전송.
이 부분은 ACP SDK나 app.virtuals.io에서 가능 (withdraw 기능).

#### 5-2. Base → 한국 거래소
**업비트가 Base 네트워크 입금을 지원하는 경우:**
1. 업비트 → 입금 → USDC → 네트워크: Base 선택
2. 업비트 입금 주소 복사
3. MetaMask에서 USDC → 업비트 주소로 전송

**Base 입금 미지원 시:**
1. https://bridge.base.org 에서 Base → Ethereum 브릿지
2. 업비트 → 입금 → USDC → 네트워크: Ethereum
3. MetaMask에서 USDC → 업비트 입금 주소로 전송

#### 5-3. 거래소에서 원화 환전
1. 업비트에서 USDC → KRW 매도
2. 원화 출금 → 본인 은행 계좌

### 주의사항
- **출금 네트워크를 반드시 확인**하세요. 잘못된 네트워크로 보내면 돈을 잃을 수 있음
- 소액으로 먼저 테스트 전송 후, 큰 금액 이동
- 거래소마다 지원하는 네트워크가 다름. 반드시 확인 후 전송
- 한국 거래소는 본인 인증(KYC)이 필요함

---

## 용어 정리

| 용어 | 설명 |
|------|------|
| **ETH** | 이더리움. 가스비(수수료) 지불에 사용 |
| **USDC** | 달러에 1:1 연동된 스테이블코인. ACP 거래 통화 |
| **Base** | 이더리움의 L2 네트워크. 수수료가 매우 저렴 |
| **가스비** | 블록체인 거래 수수료. Base에서는 $0.01 미만 |
| **브릿지** | 한 네트워크에서 다른 네트워크로 자산을 이동하는 것 |
| **스왑** | 한 토큰을 다른 토큰으로 교환 (ETH → USDC 등) |
| **에스크로** | 거래 완료 전까지 돈을 중간에 잡아두는 장치 |
| **DEX** | 탈중앙 거래소 (Uniswap 등). 지갑 연결만으로 거래 가능 |
| **KYC** | 본인 인증. 한국 거래소 이용 시 필수 |
