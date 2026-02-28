/**
 * On-chain Wallet Profiler — ACP job handler
 */

import { getBalance, getTokenHoldings, getTxHistory, getTxSummary, getNftHoldings } from "./client.js";
import type { Chain } from "./types.js";
import type { SkillRequest, SkillResult } from "../../lib/skill-registry.js";

export async function handleJobRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  if (!req || !req.action) {
    return { error: "Missing 'action' in requirement" };
  }

  const { action } = req;
  const address = req.address as string | undefined;
  if (!address && action !== "help") {
    return { error: "address is required" };
  }
  const chain = (req.chain as Chain) ?? "base";

  switch (action) {
    case "balance": {
      const result = await getBalance(address!, { chain });
      return { success: true, data: result };
    }

    case "tokens": {
      const result = await getTokenHoldings(address!, { chain });
      return { success: true, data: result };
    }

    case "tx_history": {
      const result = await getTxHistory(address!, {
        chain,
        limit: req.limit as number | undefined,
      });
      return { success: true, data: result };
    }

    case "tx_summary": {
      const result = await getTxSummary(address!, { chain });
      return { success: true, data: result };
    }

    case "nft_holdings": {
      const result = await getNftHoldings(address!, { chain });
      return { success: true, data: result };
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}
