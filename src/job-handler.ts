/**
 * Shared job handler logic
 *
 * seller.ts와 seller/offerings handler가 공유하는 핵심 로직.
 * 요청을 파싱해서 EDGAR API를 호출하고 결과 객체를 반환합니다.
 */

import { lookupCompany, getFilings, searchFilings, fetchFiling } from "./edgar-client.js";

export interface JobRequest {
  action?: string;
  ticker?: string;
  query?: string;
  formType?: string;
  accessionNumber?: string;
  primaryDocument?: string;
  limit?: number;
}

export interface JobResult {
  success?: boolean;
  error?: string;
  data?: unknown;
}

export async function handleJobRequest(req: JobRequest | undefined): Promise<JobResult> {
  if (!req || !req.action) {
    return { error: "Missing 'action' in service requirement" };
  }

  const { action, ticker, query, formType, limit = 5 } = req;

  switch (action) {
    case "lookup": {
      if (!ticker) return { error: "ticker is required for lookup" };
      const company = await lookupCompany(ticker);
      if (!company) return { error: `Ticker "${ticker}" not found` };
      return { success: true, data: company };
    }

    case "filings": {
      if (!ticker) return { error: "ticker is required for filings" };
      const result = await getFilings(ticker, { formType, limit });
      return { success: true, data: result };
    }

    case "search": {
      if (!query) return { error: "query is required for search" };
      const forms = formType ? [formType] : undefined;
      const result = await searchFilings(query, { forms, limit });
      return { success: true, data: result };
    }

    case "fetch": {
      const { accessionNumber, primaryDocument } = req;
      if (!ticker || !accessionNumber || !primaryDocument) {
        return { error: "ticker, accessionNumber, primaryDocument required for fetch" };
      }
      const result = await fetchFiling(ticker, accessionNumber, primaryDocument);
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
