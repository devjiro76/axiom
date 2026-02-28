# Skill #2: DeFi Analytics

## 개요
DefiLlama 공개 API를 활용한 DeFi 프로토콜 분석 스킬.
TVL, yield, 프로토콜 비교 등을 제공하여 크립토 에이전트의 투자 판단을 지원한다.

## 왜 이 스킬인가
- Virtuals 생태계가 크립토 네이티브 → 바이어 에이전트 수요 높음
- DefiLlama API는 무료, 키 불필요, rate limit 관대
- 구조화된 데이터 → 에이전트가 바로 활용 가능

## API 소스
- **DefiLlama** (https://defillama.com/docs/api)
  - `/protocols` — 전체 프로토콜 목록
  - `/protocol/{name}` — 프로토콜 상세 (TVL 히스토리)
  - `/yields/pools` — yield 풀 목록
  - `/chains` — 체인별 TVL
  - `/stablecoins` — 스테이블코인 데이터

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `top_protocols` | TVL 상위 프로토콜 | `chain?`, `limit?` |
| `protocol_detail` | 프로토콜 상세 + TVL 추이 | `name` |
| `yield_search` | yield 풀 검색/정렬 | `chain?`, `minTvl?`, `sortBy?`, `limit?` |
| `chain_tvl` | 체인별 TVL 비교 | `chains?` |
| `stablecoin_stats` | 스테이블코인 시가총액/유통량 | `limit?` |

## 파일 구조
```
skills/defi-analytics/
  client.ts        # DefiLlama API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
LOW-MEDIUM — API가 단순하고 인증 불필요. SEC EDGAR 패턴 재사용 가능.

## 리스크
- DefiLlama API 응답이 클 수 있음 (protocols 전체 목록 등) → 서버 사이드 필터링/페이징 필요
- 실시간 가격 데이터는 지연 있을 수 있음 (캐싱 불일치)
