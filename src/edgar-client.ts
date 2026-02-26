/**
 * SEC EDGAR API Client
 *
 * 무료 공개 API. API 키 불필요.
 * 필수: User-Agent 헤더 (회사명 + 이메일)
 * 제한: 10 requests/second
 */

import * as cheerio from "cheerio";
import type {
  CompanyInfo,
  Filing,
  FilingSearchResult,
  FullTextSearchHit,
  FullTextSearchResult,
  FilingContent,
} from "./types.js";

const USER_AGENT = "SECEdgarSkill contact@example.com";
const BASE_HEADERS = { "User-Agent": USER_AGENT };

let tickerCache: Map<string, CompanyInfo> | null = null;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...BASE_HEADERS, ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`EDGAR API error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: BASE_HEADERS });
  if (!res.ok) {
    throw new Error(`EDGAR fetch error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.text();
}

// ─── Ticker → CIK 조회 ───

async function loadTickerMap(): Promise<Map<string, CompanyInfo>> {
  if (tickerCache) return tickerCache;

  const data = await fetchJson<Record<string, { cik_str: number; ticker: string; title: string }>>(
    "https://www.sec.gov/files/company_tickers.json"
  );

  tickerCache = new Map();
  for (const entry of Object.values(data)) {
    const info: CompanyInfo = {
      cik: String(entry.cik_str).padStart(10, "0"),
      ticker: entry.ticker.toUpperCase(),
      name: entry.title,
    };
    tickerCache.set(info.ticker, info);
  }
  return tickerCache;
}

export async function lookupCompany(ticker: string): Promise<CompanyInfo | null> {
  const map = await loadTickerMap();
  return map.get(ticker.toUpperCase()) ?? null;
}

// ─── 공시 목록 조회 ───

interface SubmissionsResponse {
  cik: string;
  name: string;
  tickers: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
  };
}

export async function getFilings(
  ticker: string,
  options: { formType?: string; limit?: number } = {}
): Promise<FilingSearchResult> {
  const { formType, limit = 10 } = options;

  const company = await lookupCompany(ticker);
  if (!company) {
    throw new Error(`Ticker "${ticker}" not found`);
  }

  const data = await fetchJson<SubmissionsResponse>(
    `https://data.sec.gov/submissions/CIK${company.cik}.json`
  );

  const recent = data.filings.recent;
  const filings: Filing[] = [];

  for (let i = 0; i < recent.form.length && filings.length < limit; i++) {
    if (formType && recent.form[i] !== formType) continue;

    filings.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      form: recent.form[i],
      primaryDocument: recent.primaryDocument[i],
      description: recent.primaryDocDescription[i],
    });
  }

  return {
    company,
    filings,
    totalCount: filings.length,
  };
}

// ─── 전문 검색 (EFTS) ───

interface EftsResponse {
  hits: {
    total: { value: number };
    hits: Array<{
      _score: number;
      _source: {
        ciks: string[];
        adsh: string;
        root_form: string;
        form: string;
        display_names: string[];
        file_date: string;
        file_description: string;
      };
    }>;
  };
}

export async function searchFilings(
  query: string,
  options: { forms?: string[]; dateRange?: string; limit?: number } = {}
): Promise<FullTextSearchResult> {
  const { forms, dateRange = "5y", limit = 10 } = options;

  const params = new URLSearchParams({ q: query, dateRange });
  if (forms?.length) {
    params.set("forms", forms.join(","));
  }

  const data = await fetchJson<EftsResponse>(
    `https://efts.sec.gov/LATEST/search-index?${params.toString()}`
  );

  const hits: FullTextSearchHit[] = data.hits.hits.slice(0, limit).map((hit) => ({
    cik: hit._source.ciks[0] ?? "",
    accessionNumber: hit._source.adsh,
    form: hit._source.form,
    companyName: hit._source.display_names[0] ?? "",
    filingDate: hit._source.file_date,
    description: hit._source.file_description,
    score: hit._score,
  }));

  return {
    query,
    totalHits: data.hits.total.value,
    hits,
  };
}

// ─── 공시 문서 본문 가져오기 ───

function buildFilingUrl(cik: string, accessionNumber: string, primaryDocument: string): string {
  const cikShort = String(parseInt(cik, 10));
  const accessionDir = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${cikShort}/${accessionDir}/${primaryDocument}`;
}

export async function fetchFiling(
  ticker: string,
  accessionNumber: string,
  primaryDocument: string,
  options: { maxChars?: number } = {}
): Promise<FilingContent> {
  const { maxChars = 50000 } = options;

  const company = await lookupCompany(ticker);
  if (!company) {
    throw new Error(`Ticker "${ticker}" not found`);
  }

  const url = buildFilingUrl(company.cik, accessionNumber, primaryDocument);
  const html = await fetchText(url);

  const $ = cheerio.load(html);
  // 스크립트, 스타일 태그 제거
  $("script, style, meta, link").remove();
  let text = $("body").text();
  // 연속 공백/줄바꿈 정리
  text = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").trim();

  const truncated = text.length > maxChars;
  if (truncated) {
    text = text.slice(0, maxChars) + "\n\n... [truncated]";
  }

  return { url, text, truncated };
}
