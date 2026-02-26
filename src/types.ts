/** SEC EDGAR 관련 타입 정의 */

export interface CompanyInfo {
  cik: string;
  ticker: string;
  name: string;
}

export interface Filing {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  description: string;
}

export interface FilingSearchResult {
  company: CompanyInfo;
  filings: Filing[];
  totalCount: number;
}

export interface FullTextSearchHit {
  cik: string;
  accessionNumber: string;
  form: string;
  companyName: string;
  filingDate: string;
  description: string;
  score: number;
}

export interface FullTextSearchResult {
  query: string;
  totalHits: number;
  hits: FullTextSearchHit[];
}

export interface FilingContent {
  url: string;
  text: string;
  truncated: boolean;
}

export type FormType = "10-K" | "10-Q" | "8-K" | "S-1" | "DEF 14A" | "20-F";

export const FORM_DESCRIPTIONS: Record<FormType, string> = {
  "10-K": "연례보고서 (Annual Report)",
  "10-Q": "분기보고서 (Quarterly Report)",
  "8-K": "수시공시 (Current Report)",
  "S-1": "IPO 등록신고서 (Registration Statement)",
  "DEF 14A": "위임장설명서 (Proxy Statement)",
  "20-F": "외국기업 연례보고서 (Foreign Annual Report)",
};
