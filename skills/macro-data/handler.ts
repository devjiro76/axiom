/**
 * US Macro Data (FRED) — ACP job handler
 */

import { searchSeries, getSeriesObservations, getPopularIndicators, compareSeries } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req) {
    return { error: "Missing service requirement" };
  }

  // Butler may send snake_case fields — normalize
  const raw = req as Record<string, unknown>;
  const seriesId = (req.seriesId ?? raw["series_id"]) as string | undefined;
  const seriesIds = (req.seriesIds ?? raw["series_ids"]) as string[] | undefined;
  const startDate = (req.startDate ?? raw["start_date"]) as string | undefined;
  const endDate = (req.endDate ?? raw["end_date"]) as string | undefined;

  // Infer action if not specified
  let action = req.action;
  if (!action) {
    if (seriesId) action = "series";
    else if (seriesIds?.length) action = "compare";
    else if (raw["query"]) action = "search";
    else action = "popular";
  }

  switch (action) {
    case "search": {
      const query = req.query as string | undefined;
      if (!query) return { error: "query is required for search" };
      const result = await searchSeries(query, {
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "series": {
      if (!seriesId) return { error: "seriesId is required for series" };
      const result = await getSeriesObservations(seriesId, {
        startDate,
        endDate,
        frequency: req.frequency as string | undefined,
      });
      return { success: true, data: result };
    }

    case "popular": {
      const result = await getPopularIndicators();
      return { success: true, data: result };
    }

    case "compare": {
      if (!seriesIds?.length) return { error: "seriesIds[] is required for compare" };
      const result = await compareSeries(seriesIds, {
        startDate,
      });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
