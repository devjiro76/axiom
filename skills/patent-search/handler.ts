/**
 * Patent Search (USPTO) — ACP job handler
 */

import { searchPatents, getPatentDetail, getCompanyPatents, getInventorPatents, getTrendingFields } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req) {
    return { error: "Missing service requirement" };
  }

  // Butler may send snake_case fields — normalize
  const raw = req as Record<string, unknown>;
  const patentNumber = (req.patentNumber ?? raw["patent_number"]) as string | undefined;
  const dateRange = (req.dateRange ?? raw["date_range"]) as string | undefined;

  // Infer action if not specified
  let action = req.action;
  if (!action) {
    if (patentNumber) action = "patent_detail";
    else if (raw["assignee"]) action = "company_patents";
    else if (raw["inventor"]) action = "inventor_patents";
    else if (raw["query"]) action = "search";
    else action = "trending_fields";
  }

  switch (action) {
    case "search": {
      const query = req.query as string | undefined;
      if (!query) return { error: "query is required for search" };
      const result = await searchPatents(query, {
        dateRange,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "patent_detail": {
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
