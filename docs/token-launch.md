# EDGAR AI 토큰 발행 계획

## 상태: 대기 중 (VIRTUAL 출금 24시간 제한 — 2026-03-01 이후 가능)

## 토큰 정보 (온체인 기록, 변경 불가)
| 항목 | 값 |
|------|-----|
| 이름 | EDGAR AI |
| 티커 | $EDGAR |
| 타입 | INFORMATION |
| 설명 | AI agent that searches SEC EDGAR filings in real-time. Query 10-K, 10-Q, 8-K, and other SEC filings by company name, ticker, or CIK. Powered by ACP on Base. |
| 이미지 | `edgar-ai-logo.png` (프로젝트 루트) |
| 비용 | 100 VIRTUAL (비환불) |

## 발행 절차
1. 업비트에서 VIRTUAL 출금 (Base 네트워크) → MetaMask `0xF0821502fa7Af4cDA0F37CE601372A21Ca81fE86`
2. app.virtuals.io → Create New Agent
3. "I want to launch an AI Agent with a new token" 선택
4. 위 정보 입력 + 이미지 업로드
5. 100 VIRTUAL 지불 (온체인 트랜잭션)
6. 발행 완료 → bonding curve 시작

## 보유 현황
- 업비트: VIRTUAL 109개 (출금 수수료 제외하면 ~107개 도착 예상)
- MetaMask (Base): ETH $6.24 (가스비용)

## 참고
- bonding curve에 42,000 VIRTUAL 모이면 "졸업" → Uniswap LP 생성 (10년 락)
- 에이전트 ACP 수익 → 자동 buyback & burn → 토큰 가치 상승

## Railway 배포 (완료)
- 프로젝트: https://railway.com/project/7353add4-c34c-458b-b510-79aadeea3e70
- 서비스: acp-seller — SUCCESS
- 재배포: `railway up`
