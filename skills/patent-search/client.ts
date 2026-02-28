/**
 * USPTO PatentsView Search API Client
 *
 * New PatentsView Search API (v1).
 * API 키 필요 (무료 등록): https://patentsview.org/apis/keyrequest
 * https://search.patentsview.org/docs/
 */

import type {
  Patent,
  PatentSearchResult,
  CompanyPatentResult,
  InventorPatentResult,
  TrendingField,
} from "./types.js";

const BASE_URL = "https://search.patentsview.org/api/v1";
const API_KEY = process.env.PATENTSVIEW_API_KEY;

function getHeaders(): Record<string, string> {
  if (!API_KEY) throw new Error("PATENTSVIEW_API_KEY not set in environment");
  return { "X-Api-Key": API_KEY };
}

async function queryPatents(
  query: Record<string, unknown>,
  fields: string[],
  options: { per_page?: number; sort?: Array<Record<string, string>> } = {}
): Promise<{ patents: Array<Record<string, unknown>> | null; total_patent_count: number }> {
  const { per_page = 10, sort } = options;

  const params = new URLSearchParams({
    q: JSON.stringify(query),
    f: JSON.stringify(fields),
    o: JSON.stringify({ per_page, ...(sort ? { sort } : {}) }),
  });

  const res = await fetch(`${BASE_URL}/patent/?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`USPTO API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<{ patents: Array<Record<string, unknown>> | null; total_patent_count: number }>;
}

const PATENT_FIELDS = [
  "patent_id",
  "patent_title",
  "patent_abstract",
  "patent_date",
  "inventors_at_grant.inventor_name_first",
  "inventors_at_grant.inventor_name_last",
  "assignees_at_grant.assignee_organization",
  "cpcs.cpc_group_id",
];

function toPatent(raw: Record<string, unknown>): Patent {
  const inventors = raw.inventors_at_grant as Array<{ inventor_name_first: string; inventor_name_last: string }> | undefined;
  const assignees = raw.assignees_at_grant as Array<{ assignee_organization: string | null }> | undefined;
  const cpcs = raw.cpcs as Array<{ cpc_group_id: string }> | undefined;

  return {
    patentNumber: (raw.patent_id as string) ?? "",
    title: (raw.patent_title as string) ?? "",
    abstract: (raw.patent_abstract as string) ?? null,
    date: (raw.patent_date as string) ?? "",
    inventors: inventors?.map((i) => `${i.inventor_name_first} ${i.inventor_name_last}`) ?? [],
    assignees: assignees?.map((a) => a.assignee_organization ?? "").filter(Boolean) ?? [],
    cpcCodes: cpcs?.map((c) => c.cpc_group_id).filter(Boolean) ?? [],
  };
}

// ─── 키워드 검색 ───

export async function searchPatents(
  query: string,
  options: { dateRange?: string; limit?: number } = {}
): Promise<PatentSearchResult> {
  const { limit = 10 } = options;

  const result = await queryPatents(
    { _text_any: { patent_title: query } },
    PATENT_FIELDS,
    {
      per_page: Math.min(limit, 100),
      sort: [{ patent_date: "desc" }],
    }
  );

  return {
    query,
    total: result.total_patent_count,
    patents: (result.patents ?? []).map(toPatent),
  };
}

// ─── 특허 상세 ───

export async function getPatentDetail(patentNumber: string): Promise<Patent> {
  const result = await queryPatents(
    { patent_id: patentNumber },
    PATENT_FIELDS,
    { per_page: 1 }
  );

  if (!result.patents?.length) {
    throw new Error(`Patent "${patentNumber}" not found`);
  }

  return toPatent(result.patents[0]);
}

// ─── 기업별 특허 ───

export async function getCompanyPatents(
  assignee: string,
  options: { limit?: number } = {}
): Promise<CompanyPatentResult> {
  const { limit = 10 } = options;

  const result = await queryPatents(
    { _contains: { "assignees_at_grant.assignee_organization": assignee } },
    PATENT_FIELDS,
    {
      per_page: Math.min(limit, 100),
      sort: [{ patent_date: "desc" }],
    }
  );

  return {
    assignee,
    total: result.total_patent_count,
    patents: (result.patents ?? []).map(toPatent),
  };
}

// ─── 발명자별 특허 ───

export async function getInventorPatents(
  inventor: string,
  options: { limit?: number } = {}
): Promise<InventorPatentResult> {
  const { limit = 10 } = options;
  const parts = inventor.split(" ");
  const lastName = parts.pop() ?? inventor;
  const firstName = parts.join(" ");

  const query: Record<string, unknown> = firstName
    ? { _and: [
        { _contains: { "inventors_at_grant.inventor_name_last": lastName } },
        { _contains: { "inventors_at_grant.inventor_name_first": firstName } },
      ]}
    : { _contains: { "inventors_at_grant.inventor_name_last": lastName } };

  const result = await queryPatents(query, PATENT_FIELDS, {
    per_page: Math.min(limit, 100),
    sort: [{ patent_date: "desc" }],
  });

  return {
    inventor,
    total: result.total_patent_count,
    patents: (result.patents ?? []).map(toPatent),
  };
}

// ─── 트렌딩 분야 ───

export async function getTrendingFields(
  options: { limit?: number } = {}
): Promise<TrendingField[]> {
  const { limit = 10 } = options;

  const currentYear = new Date().getFullYear();
  const result = await queryPatents(
    { _gte: { patent_date: `${currentYear}-01-01` } },
    ["cpcs.cpc_group_id", "cpcs.cpc_group_title"],
    { per_page: 100, sort: [{ patent_date: "desc" }] }
  );

  const counts = new Map<string, { title: string; count: number }>();
  for (const p of result.patents ?? []) {
    const cpcs = p.cpcs as Array<{ cpc_group_id: string; cpc_group_title: string }> | undefined;
    for (const c of cpcs ?? []) {
      if (!c.cpc_group_id) continue;
      const existing = counts.get(c.cpc_group_id);
      if (existing) {
        existing.count++;
      } else {
        counts.set(c.cpc_group_id, { title: c.cpc_group_title ?? c.cpc_group_id, count: 1 });
      }
    }
  }

  return Array.from(counts.entries())
    .map(([cpcGroup, { title, count }]) => ({ cpcGroup, title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
