/**
 * Token Sentiment — ACP job handler
 */

import { getTokenOverview, getTokenSentiment, getTrendingCoins, compareTokens, getMarketOverview } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req || !req.action) {
    return { error: "Missing 'action' in requirement" };
  }

  const { action } = req;

  switch (action) {
    case "overview": {
      const coinId = req.coinId as string | undefined;
      if (!coinId) return { error: "coinId is required for overview" };
      const result = await getTokenOverview(coinId);
      return { success: true, data: result };
    }

    case "sentiment": {
      const coinId = req.coinId as string | undefined;
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
      const coinIds = req.coinIds as string[] | undefined;
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
