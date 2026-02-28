/**
 * Patent Search (USPTO) — ACP job handler
 */

import { searchPatents, getPatentDetail, getCompanyPatents, getInventorPatents, getTrendingFields } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req || !req.action) {
    return { error: "Missing 'action' in requirement" };
  }

  const { action } = req;

  switch (action) {
    case "search": {
      const query = req.query as string | undefined;
      if (!query) return { error: "query is required for search" };
      const result = await searchPatents(query, {
        dateRange: req.dateRange as string | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "patent_detail": {
      const patentNumber = req.patentNumber as string | undefined;
      if (!patentNumber) return { error: "patentNumber is required for patent_detail" };
      const result = await getPatentDetail(patentNumber);
      return { success: true, data: result };
    }

    case "company_patents": {
      const assignee = req.assignee as string | undefined;
      if (!assignee) return { error: "assignee is required for company_patents" };
      const result = await getCompanyPatents(assignee, {
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "inventor_patents": {
      const inventor = req.inventor as string | undefined;
      if (!inventor) return { error: "inventor is required for inventor_patents" };
      const result = await getInventorPatents(inventor, {
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "trending_fields": {
      const result = await getTrendingFields({
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
