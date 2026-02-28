/**
 * Academic Paper Search — ACP job handler
 */

import { searchPapers, getPaperDetail, getCitations, getAuthorPapers } from "./client.js";
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
      const result = await searchPapers(query, {
        year: req.year as string | undefined,
        fields: req.fields as string | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "paper_detail": {
      const paperId = req.paperId as string | undefined;
      if (!paperId) return { error: "paperId is required for paper_detail" };
      const result = await getPaperDetail(paperId);
      return { success: true, data: result };
    }

    case "citations": {
      const paperId = req.paperId as string | undefined;
      if (!paperId) return { error: "paperId is required for citations" };
      const result = await getCitations(paperId, {
        direction: req.direction as "citations" | "references" | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "author_papers": {
      const authorId = req.authorId as string | undefined;
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
