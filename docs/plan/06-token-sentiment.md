# Skill #7: Token Sentiment Scanner

## 개요
CoinGecko 무료 API + 소셜 지표로 토큰 sentiment를 분석하는 스킬.
가격 변동, 거래량, 소셜 트렌드를 종합하여 토큰 상태를 리포트.

## 왜 이 스킬인가
- Virtuals 에이전트 생태계에서 가장 직접적 수요
- 트레이딩/포트폴리오 에이전트의 의사결정 보조
- CoinGecko 무료 API로 충분한 데이터 제공

## API 소스
- **CoinGecko** (https://docs.coingecko.com/v3.0.1/reference)
  - `/coins/markets` — 시가총액 기준 코인 목록
  - `/coins/{id}` — 코인 상세 (소셜, 개발 활동 포함)
  - `/coins/{id}/market_chart` — 가격/거래량 차트
  - `/search/trending` — 트렌딩 코인
  - 무료: 10-30 calls/min

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `overview` | 토큰 기본 정보 + 가격 | `coinId` |
| `sentiment` | 종합 sentiment (가격 변동 + 거래량 변화 + 소셜 점수) | `coinId` |
| `trending` | 현재 트렌딩 토큰 | `limit?` |
| `compare` | 복수 토큰 비교 | `coinIds[]` |
| `market_overview` | 전체 시장 요약 (총 시가총액, BTC 도미넌스) | — |

## 파일 구조
```
skills/token-sentiment/
  client.ts        # CoinGecko API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
MEDIUM — sentiment 점수 계산 로직 설계 필요. rate limit 관리.

## 리스크
- CoinGecko 무료 rate limit 엄격 (10-30/min) → 캐싱 또는 큐잉 필요
- "Sentiment"는 주관적 → 점수 산출 기준 명확히 정의해야 함
- 무료 플랜에서 일부 엔드포인트 제한 가능
