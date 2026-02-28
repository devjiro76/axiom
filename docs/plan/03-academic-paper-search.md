# Skill #4: Academic Paper Search

## 개요
Semantic Scholar / arXiv 공개 API로 학술 논문을 검색하고 메타데이터를 반환하는 스킬.
리서치 에이전트가 최신 논문을 탐색하고 인용 관계를 파악하는 데 활용.

## 왜 이 스킬인가
- AI 에이전트 중 리서치/분석 특화 에이전트 많음
- Semantic Scholar API는 무료, 키 불필요 (인증 시 rate limit 상향)
- 논문 → 구조화된 메타데이터 변환은 에이전트에 최적

## API 소스
- **Semantic Scholar** (https://api.semanticscholar.org/)
  - `/paper/search` — 키워드 검색
  - `/paper/{id}` — 논문 상세
  - `/paper/{id}/citations` — 인용 관계
  - `/author/{id}` — 저자 정보
- **arXiv API** (https://arxiv.org/help/api/) — 보조 (프리프린트)

## 제공 액션
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `search` | 논문 키워드 검색 | `query`, `year?`, `fields?`, `limit?` |
| `paper_detail` | 논문 상세 (초록, 인용수, 저자) | `paperId` |
| `citations` | 인용한/인용된 논문 목록 | `paperId`, `direction?`, `limit?` |
| `author_papers` | 저자의 논문 목록 | `authorId`, `limit?` |
| `trending` | 최근 주목받는 논문 | `field?`, `limit?` |

## 파일 구조
```
skills/paper-search/
  client.ts        # Semantic Scholar API 클라이언트
  handler.ts       # ACP job handler
  types.ts         # 타입 정의
  offering.json    # ACP offering 메타데이터
  test.ts          # 로컬 테스트
```

## 예상 난이도
LOW — API 단순, 인증 불필요, SEC EDGAR 패턴 거의 그대로 재사용.

## 리스크
- Semantic Scholar 무인증 rate limit (100 req/5min) → 대량 요청 시 제한
- 논문 전문(full text)은 제공 안 됨 → 초록까지만 반환
- arXiv LaTeX 데이터 파싱이 복잡할 수 있음 → Semantic Scholar만 우선 지원
