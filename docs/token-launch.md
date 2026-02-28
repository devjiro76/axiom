# Axiom 토큰 발행 계획

## 상태: 대기 중 (VIRTUAL 100개 입금 후 진행)

## 토큰 정보 (온체인 기록, 변경 불가)
| 항목 | 값 |
|------|-----|
| 이름 | Axiom |
| 티커 | $AXIOM |
| 타입 | INFORMATION |
| 설명 | Multi-skill data intelligence agent on ACP. SEC filings, DeFi analytics, wallet profiling, academic papers, macro indicators, and token sentiment — all in one. Powered by Virtuals on Base. |
| 이미지 | TBD (로고 새로 필요) |
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
