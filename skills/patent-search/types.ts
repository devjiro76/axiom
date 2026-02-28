/** Patent Search (USPTO) 타입 정의 */

export interface Patent {
  patentNumber: string;
  title: string;
  abstract: string | null;
  date: string;
  inventors: string[];
  assignees: string[];
  cpcCodes: string[];
}

export interface PatentSearchResult {
  query: string;
  total: number;
  patents: Patent[];
}

export interface CompanyPatentResult {
  assignee: string;
  total: number;
  patents: Patent[];
}

export interface InventorPatentResult {
  inventor: string;
  total: number;
  patents: Patent[];
}

export interface TrendingField {
  cpcGroup: string;
  title: string;
  count: number;
}
