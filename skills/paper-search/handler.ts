/**
 * Academic Paper Search — ACP job handler
 */

import { searchPapers, getPaperDetail, getCitations, getAuthorPapers } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req) {
    return { error: "Missing service requirement" };
  }

  // Butler may send snake_case fields — normalize
  const raw = req as Record<string, unknown>;
  const paperId = (req.paperId ?? raw["paper_id"]) as string | undefined;
  const authorId = (req.authorId ?? raw["author_id"]) as string | undefined;

  // Infer action if not specified
  let action = req.action;
  if (!action) {
    if (paperId) action = "paper_detail";
    else if (authorId) action = "author_papers";
    else if (raw["query"]) action = "search";
    else return { error: "Missing 'action' (or 'query'/'paperId'/'authorId') in service requirement" };
  }

  switch (action) {
    case "search": {
      const query = req.query as string | undefined;
      if (!query) return { error: "query is required for search" };
      const result = await searchPapers(query, {
        year: req.year as string | undefined,
        fields: req.fields as string | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "paper_detail": {
      if (!paperId) return { error: "paperId is required for paper_detail" };
      const result = await getPaperDetail(paperId);
      return { success: true, data: result };
    }

    case "citations": {
      if (!paperId) return { error: "paperId is required for citations" };
      const result = await getCitations(paperId, {
        direction: req.direction as "citations" | "references" | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "author_papers": {
      if (!authorId) return { error: "authorId is required for author_papers" };
      const result = await getAuthorPapers(authorId, {
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
