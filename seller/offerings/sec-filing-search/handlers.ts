/**
 * ACP Service Handler for SEC Filing Search
 *
 * Virtual Protocol ACP에서 다른 에이전트가 이 서비스를 호출하면
 * 이 핸들러가 실행됩니다.
 *
 * Note: 이 파일은 openclaw-acp 프레임워크의 offering 규약을 따릅니다.
 * 실제 런타임은 src/seller.ts가 ACP SDK를 직접 사용합니다.
 */

import type { AcpJob } from "@virtuals-protocol/acp-node";
import { lookupCompany, getFilings, searchFilings, fetchFiling } from "../../../src/edgar-client.js";

export async function executeJob(job: AcpJob): Promise<void> {
  const req = job.requirement as Record<string, unknown> | undefined;
  if (!req || !req.action) {
    await job.deliver({ error: "Missing 'action' in service requirement" });
    return;
  }

  const action = req.action as string;
  const ticker = req.ticker as string | undefined;
  const query = req.query as string | undefined;
  const formType = req.formType as string | undefined;
  const limit = (req.limit as number) ?? 5;

  switch (action) {
    case "lookup": {
      if (!ticker) { await job.deliver({ error: "ticker is required" }); return; }
      const company = await lookupCompany(ticker);
      if (!company) { await job.deliver({ error: `Ticker "${ticker}" not found` }); return; }
      await job.deliver({ success: true, data: company });
      break;
    }

    case "filings": {
      if (!ticker) { await job.deliver({ error: "ticker is required" }); return; }
      const result = await getFilings(ticker, { formType, limit });
      await job.deliver({ success: true, data: result });
      break;
    }

    case "search": {
      if (!query) { await job.deliver({ error: "query is required" }); return; }
      const forms = formType ? [formType] : undefined;
      const result = await searchFilings(query, { forms, limit });
      await job.deliver({ success: true, data: result });
      break;
    }

    case "fetch": {
      const accession = req.accessionNumber as string | undefined;
      const document = req.primaryDocument as string | undefined;
      if (!ticker || !accession || !document) {
        await job.deliver({ error: "ticker, accessionNumber, primaryDocument required" });
        return;
      }
      const result = await fetchFiling(ticker, accession, document);
      await job.deliver({ success: true, data: result });
      break;
    }

    default:
      await job.deliver({ error: `Unknown action: ${action}` });
  }
}
