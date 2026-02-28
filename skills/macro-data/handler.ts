/**
 * US Macro Data (FRED) — ACP job handler
 */

import { searchSeries, getSeriesObservations, getPopularIndicators, compareSeries } from "./client.js";
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
      const result = await searchSeries(query, {
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "series": {
      const seriesId = req.seriesId as string | undefined;
      if (!seriesId) return { error: "seriesId is required for series" };
      const result = await getSeriesObservations(seriesId, {
        startDate: req.startDate as string | undefined,
        endDate: req.endDate as string | undefined,
        frequency: req.frequency as string | undefined,
      });
      return { success: true, data: result };
    }

    case "popular": {
      const result = await getPopularIndicators();
      return { success: true, data: result };
    }

    case "compare": {
      const seriesIds = req.seriesIds as string[] | undefined;
      if (!seriesIds?.length) return { error: "seriesIds[] is required for compare" };
      const result = await compareSeries(seriesIds, {
        startDate: req.startDate as string | undefined,
      });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
