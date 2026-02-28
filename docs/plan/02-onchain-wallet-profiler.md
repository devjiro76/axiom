# Skill #3: On-chain Wallet Profiler

## 개요
Etherscan/Basescan 무료 API로 지갑 주소를 분석하는 스킬.
토큰 보유 현황, 트랜잭션 패턴, 연관 지갑 등을 리포트한다.

## 왜 이 스킬인가
- 크립토 에이전트의 핵심 니즈: "이 지갑 뭐 하는 지갑이야?"
- Virtuals 에이전트끼리 상대방 지갑을 조회하는 용도로도 활용 가능
- Base 체인 우선 지원 → Virtuals 생태계 직접 연동

## API 소스
- **Basescan API** (https://docs.basescan.org/) — Base 체인
- **Etherscan API** (https://docs.etherscan.io/) — Ethereum 메인넷
- 무료 플랜: 5 calls/sec, 100k calls/day

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `balance` | ETH/네이티브 잔고 조회 | `address`, `chain?` |
| `tokens` | ERC-20 토큰 보유 목록 | `address`, `chain?` |
| `tx_history` | 최근 트랜잭션 히스토리 | `address`, `chain?`, `limit?` |
| `tx_summary` | 트랜잭션 패턴 요약 (입출금 빈도, 주요 상대방) | `address`, `chain?` |
| `nft_holdings` | NFT 보유 목록 | `address`, `chain?` |

## 파일 구조
```
skills/wallet-profiler/
  client.ts        # Etherscan/Basescan API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
MEDIUM — API 키 필요 (무료), 멀티체인 분기 로직, rate limit 관리.

## 리스크
- Etherscan 무료 API 키 필요 → .env에 추가
- Rate limit (5 calls/sec) → 동시 요청 제한 필요
- 대규모 지갑(수천 건 트랜잭션) 처리 시 페이징 구현 필요
- 토큰 가격 정보 없음 → CoinGecko 등 보조 API 필요할 수 있음
