/**
 * DeFi Analytics — ACP job handler
 */

import { getTopProtocols, getProtocolDetail, searchYieldPools, getChainTvl, getStablecoins } from "./client.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req) {
    return { error: "Missing service requirement" };
  }

  // Butler may send snake_case fields — normalize
  const raw = req as Record<string, unknown>;
  const minTvl = (req.minTvl ?? raw["min_tvl"]) as number | undefined;
  const sortBy = (req.sortBy ?? raw["sort_by"]) as "apy" | "tvl" | undefined;

  // Infer action if not specified
  let action = req.action;
  if (!action) {
    if (raw["name"] || raw["protocol"]) action = "protocol_detail";
    else if (raw["chain"] && !raw["query"]) action = "chain_tvl";
    else if (raw["query"] || minTvl || sortBy) action = "yield_search";
    else action = "top_protocols";
  }

  switch (action) {
    case "top_protocols": {
      const result = await getTopProtocols({
        chain: req.chain as string | undefined,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "protocol_detail": {
      const name = (req.name ?? raw["protocol"]) as string | undefined;
      if (!name) return { error: "name is required for protocol_detail" };
      const result = await getProtocolDetail(name);
      return { success: true, data: result };
    }

    case "yield_search": {
      const result = await searchYieldPools({
        chain: req.chain as string | undefined,
        minTvl,
        sortBy,
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
