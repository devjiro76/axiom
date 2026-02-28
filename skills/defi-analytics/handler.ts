/**
 * DeFi Analytics — ACP job handler
 */

import { getTopProtocols, getProtocolDetail, searchYieldPools, getChainTvl, getStablecoins } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req || !req.action) {
    return { error: "Missing 'action' in requirement" };
  }

  const { action } = req;

  switch (action) {
    case "top_protocols": {
      const result = await getTopProtocols({
        chain: req.chain as string | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "protocol_detail": {
      const name = req.name as string | undefined;
      if (!name) return { error: "name is required for protocol_detail" };
      const result = await getProtocolDetail(name);
      return { success: true, data: result };
    }

    case "yield_search": {
      const result = await searchYieldPools({
        chain: req.chain as string | undefined,
        minTvl: req.minTvl as number | undefined,
        sortBy: req.sortBy as "apy" | "tvl" | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "chain_tvl": {
      const result = await getChainTvl({
        chains: req.chains as string[] | undefined,
      });
      return { success: true, data: result };
    }

    case "stablecoin_stats": {
      const result = await getStablecoins({
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
