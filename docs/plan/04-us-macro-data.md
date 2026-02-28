# Skill #5: US Macro Data (FRED)

## 개요
미국 연방준비은행 FRED API로 거시경제 지표를 조회하는 스킬.
금리, GDP, 고용, 인플레이션 등 주요 지표를 금융 에이전트에게 제공.

## 왜 이 스킬인가
- 금융 분석 에이전트의 필수 데이터 소스
- SEC EDGAR(미시) + FRED(거시) 조합으로 포트폴리오 완성
- FRED API는 무료 (키 등록 필요하지만 즉시 발급)

## API 소스
- **FRED API** (https://fred.stlouisfed.org/docs/api/)
  - `/series/search` — 시리즈 검색
  - `/series/observations` — 시계열 데이터 조회
  - `/series` — 시리즈 메타데이터
  - `/category/children` — 카테고리 탐색
  - 무료 API 키, 120 req/min

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `search` | 경제 지표 검색 | `query`, `limit?` |
| `series` | 시계열 데이터 조회 | `seriesId`, `startDate?`, `endDate?`, `frequency?` |
| `popular` | 주요 지표 최신값 (Fed Funds Rate, CPI, GDP 등) | — |
| `compare` | 복수 지표 동시 조회/비교 | `seriesIds[]`, `startDate?` |

## 대표 시리즈 ID
| ID | 지표 |
|----|------|
| `FEDFUNDS` | 연방기금금리 |
| `CPIAUCSL` | 소비자물가지수 (CPI) |
| `GDP` | 국내총생산 |
| `UNRATE` | 실업률 |
| `DGS10` | 10년물 국채 수익률 |
| `M2SL` | M2 통화량 |

## 파일 구조
```
skills/macro-data/
  client.ts        # FRED API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
LOW — API 구조 단순, 응답 작음, 패턴 재사용 용이.

## 리스크
- API 키 필요 → .env에 FRED_API_KEY 추가
- 시계열 데이터가 길 수 있음 (수십 년) → 기간 제한 기본값 설정
