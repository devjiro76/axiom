/**
 * Token Sentiment — ACP job handler
 */

import { getTokenOverview, getTokenSentiment, getTrendingCoins, compareTokens, getMarketOverview } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req) {
    return { error: "Missing service requirement" };
  }

  // Butler may send snake_case fields — normalize
  const raw = req as Record<string, unknown>;
  const coinId = (req.coinId ?? raw["coin_id"]) as string | undefined;
  const coinIds = (req.coinIds ?? raw["coin_ids"]) as string[] | undefined;

  // Infer action if not specified
  let action = req.action;
  if (!action) {
    if (coinIds?.length) action = "compare";
    else if (coinId) action = "sentiment";
    else action = "overview";
  }

  switch (action) {
    case "overview": {
      if (!coinId) return { error: "coinId is required for overview" };
      const result = await getTokenOverview(coinId);
      return { success: true, data: result };
    }

    case "sentiment": {
      if (!coinId) return { error: "coinId is required for sentiment" };
      const result = await getTokenSentiment(coinId);
      return { success: true, data: result };
    }

    case "trending": {
      const result = await getTrendingCoins({
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "compare": {
      if (!coinIds?.length) return { error: "coinIds[] is required for compare" };
      const result = await compareTokens(coinIds);
      return { success: true, data: result };
    }

    case "market_overview": {
      const result = await getMarketOverview();
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
