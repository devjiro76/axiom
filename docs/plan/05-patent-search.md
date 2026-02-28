# Skill #6: Patent Search (USPTO)

## 개요
미국 특허청(USPTO) 공개 API로 특허를 검색하고 상세 정보를 반환하는 스킬.
기술 트렌드 파악, 경쟁사 IP 분석에 활용.

## 왜 이 스킬인가
- 기술 분석 에이전트의 차별화 데이터 소스
- USPTO API 완전 무료, 키 불필요
- SEC EDGAR와 유사한 구조 → 개발 빠름

## API 소스
- **USPTO PatentsView API** (https://patentsview.org/apis)
  - `/patents/query` — 특허 검색
  - `/inventors/query` — 발명자 검색
  - `/assignees/query` — 출원인(기업) 검색
- **USPTO Open Data** (https://developer.uspto.gov/)
  - 보조 데이터 소스

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `search` | 특허 키워드 검색 | `query`, `dateRange?`, `limit?` |
| `patent_detail` | 특허 상세 (초록, 청구항, 분류) | `patentNumber` |
| `company_patents` | 기업별 특허 목록 | `assignee`, `limit?` |
| `inventor_patents` | 발명자별 특허 | `inventor`, `limit?` |
| `trending_fields` | 최근 출원 많은 기술 분야 | `limit?` |

## 파일 구조
```
skills/patent-search/
  client.ts        # USPTO API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
MEDIUM — API 쿼리 문법이 독특 (JSON 기반 필터). 응답 파싱 다소 복잡.

## 리스크
- PatentsView API 쿼리 문법 학습 필요
- 응답 데이터가 클 수 있음 → 필드 선택적 요청
- 최신 특허 반영 지연 (수주~수개월)
