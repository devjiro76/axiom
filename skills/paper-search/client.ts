/**
 * Semantic Scholar API Client
 *
 * 무료 공개 API. API 키 불필요 (인증 시 rate limit 상향).
 * 무인증: 100 req / 5 min
 * https://api.semanticscholar.org/
 */

import type {
  Paper,
  Author,
  PaperSearchResult,
  CitationResult,
  AuthorDetail,
} from "./types.js";

const BASE_URL = "https://api.semanticscholar.org/graph/v1";
const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const BASE_HEADERS: Record<string, string> = {
  ...(API_KEY ? { "x-api-key": API_KEY } : {}),
};

const PAPER_FIELDS = "paperId,title,abstract,year,citationCount,influentialCitationCount,url,authors,venue,fieldsOfStudy,isOpenAccess";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: BASE_HEADERS });
  if (!res.ok) {
    throw new Error(`Semantic Scholar API error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

function toPaper(raw: Record<string, unknown>): Paper {
  return {
    paperId: raw.paperId as string,
    title: raw.title as string,
    abstract: (raw.abstract as string) ?? null,
    year: (raw.year as number) ?? null,
    citationCount: (raw.citationCount as number) ?? 0,
    influentialCitationCount: (raw.influentialCitationCount as number) ?? 0,
    url: (raw.url as string) ?? "",
    authors: ((raw.authors as Array<{ authorId?: string; name: string }>) ?? []).map((a) => ({
      authorId: a.authorId ?? null,
      name: a.name,
    })),
    venue: (raw.venue as string) ?? null,
    fieldsOfStudy: (raw.fieldsOfStudy as string[]) ?? null,
    isOpenAccess: (raw.isOpenAccess as boolean) ?? false,
  };
}

// ─── 논문 검색 ───

export async function searchPapers(
  query: string,
  options: { year?: string; fields?: string; limit?: number } = {}
): Promise<PaperSearchResult> {
  const { year, fields: fieldsOfStudy, limit = 10 } = options;

  const params = new URLSearchParams({
    query,
    fields: PAPER_FIELDS,
    limit: String(Math.min(limit, 100)),
  });
  if (year) params.set("year", year);
  if (fieldsOfStudy) params.set("fieldsOfStudy", fieldsOfStudy);

  const data = await fetchJson<{ total: number; data: Record<string, unknown>[] }>(
    `${BASE_URL}/paper/search?${params.toString()}`
  );

  return {
    query,
    total: data.total,
    papers: data.data.map(toPaper),
  };
}

// ─── 논문 상세 ───

export async function getPaperDetail(paperId: string): Promise<Paper> {
  const data = await fetchJson<Record<string, unknown>>(
    `${BASE_URL}/paper/${encodeURIComponent(paperId)}?fields=${PAPER_FIELDS}`
  );
  return toPaper(data);
}

// ─── 인용 관계 ───

export async function getCitations(
  paperId: string,
  options: { direction?: "citations" | "references"; limit?: number } = {}
): Promise<CitationResult> {
  const { direction = "citations", limit = 10 } = options;

  const data = await fetchJson<{ data: Array<{ citingPaper?: Record<string, unknown>; citedPaper?: Record<string, unknown> }> }>(
    `${BASE_URL}/paper/${encodeURIComponent(paperId)}/${direction}?fields=${PAPER_FIELDS}&limit=${Math.min(limit, 100)}`
  );

  const key = direction === "citations" ? "citingPaper" : "citedPaper";
  const papers = data.data
    .map((d) => d[key])
    .filter((p): p is Record<string, unknown> => !!p)
    .map(toPaper);

  return { paperId, direction, total: papers.length, papers };
}

// ─── 저자 논문 ───

export async function getAuthorPapers(
  authorId: string,
  options: { limit?: number } = {}
): Promise<AuthorDetail> {
  const { limit = 10 } = options;

  const authorData = await fetchJson<Record<string, unknown>>(
    `${BASE_URL}/author/${authorId}?fields=name,paperCount,citationCount,hIndex`
  );

  const papersData = await fetchJson<{ data: Array<Record<string, unknown>> }>(
    `${BASE_URL}/author/${authorId}/papers?fields=${PAPER_FIELDS}&limit=${Math.min(limit, 100)}`
  );

  return {
    authorId,
    name: authorData.name as string,
    paperCount: (authorData.paperCount as number) ?? 0,
    citationCount: (authorData.citationCount as number) ?? 0,
    hIndex: (authorData.hIndex as number) ?? 0,
    papers: papersData.data.map(toPaper),
  };
}
