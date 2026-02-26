/**
 * ACP Service Handler for SEC Filing Search
 *
 * Virtual Protocol ACP에서 다른 에이전트가 이 서비스를 호출하면
 * 이 핸들러가 실행됩니다.
 */

import { lookupCompany, getFilings, searchFilings, fetchFiling } from "../../../src/edgar-client.js";

interface AcpJob {
  serviceRequirement: {
    action: "lookup" | "filings" | "search" | "fetch";
    ticker?: string;
    query?: string;
    formType?: string;
    accessionNumber?: string;
    primaryDocument?: string;
    limit?: number;
    summarize?: boolean;
  };
  deliver: (result: unknown) => Promise<void>;
}

export async function executeJob(job: AcpJob): Promise<void> {
  const req = job.serviceRequirement;

  switch (req.action) {
    case "lookup": {
      if (!req.ticker) throw new Error("ticker is required for lookup");
      const company = await lookupCompany(req.ticker);
      if (!company) throw new Error(`Ticker "${req.ticker}" not found`);
      await job.deliver({ success: true, data: company });
      break;
    }

    case "filings": {
      if (!req.ticker) throw new Error("ticker is required for filings");
      const result = await getFilings(req.ticker, {
        formType: req.formType,
        limit: req.limit ?? 5,
      });
      await job.deliver({ success: true, data: result });
      break;
    }

    case "search": {
      if (!req.query) throw new Error("query is required for search");
      const forms = req.formType ? [req.formType] : undefined;
      const result = await searchFilings(req.query, {
        forms,
        limit: req.limit ?? 5,
      });
      await job.deliver({ success: true, data: result });
      break;
    }

    case "fetch": {
      if (!req.ticker || !req.accessionNumber || !req.primaryDocument) {
        throw new Error("ticker, accessionNumber, and primaryDocument are required for fetch");
      }
      const result = await fetchFiling(req.ticker, req.accessionNumber, req.primaryDocument);
      await job.deliver({ success: true, data: result });
      break;
    }

    default:
      throw new Error(`Unknown action: ${req.action}`);
  }
}
