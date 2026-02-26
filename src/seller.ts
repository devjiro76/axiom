#!/usr/bin/env tsx
/**
 * ACP Seller Runtime
 *
 * SEC EDGAR 검색 서비스를 ACP 마켓플레이스에서 제공합니다.
 * WebSocket으로 작업 요청을 대기하다가, 요청이 오면 EDGAR API를 호출해 결과를 반환합니다.
 *
 * Usage:
 *   tsx src/seller.ts
 */

import AcpClient, {
  AcpJob,
  AcpMemo,
  AcpJobPhases,
} from "@virtuals-protocol/acp-node";
import { loadSellerConfig, buildContractClient } from "./acp-config.js";
import { lookupCompany, getFilings, searchFilings, fetchFiling } from "./edgar-client.js";

async function handleJob(job: AcpJob): Promise<string> {
  const req = job.requirement as Record<string, unknown> | undefined;
  if (!req || !req.action) {
    return JSON.stringify({ error: "Missing 'action' in service requirement" });
  }

  const action = req.action as string;
  const ticker = req.ticker as string | undefined;
  const query = req.query as string | undefined;
  const formType = req.formType as string | undefined;
  const limit = (req.limit as number) ?? 5;

  switch (action) {
    case "lookup": {
      if (!ticker) return JSON.stringify({ error: "ticker is required for lookup" });
      const company = await lookupCompany(ticker);
      if (!company) return JSON.stringify({ error: `Ticker "${ticker}" not found` });
      return JSON.stringify({ success: true, data: company });
    }

    case "filings": {
      if (!ticker) return JSON.stringify({ error: "ticker is required for filings" });
      const result = await getFilings(ticker, { formType, limit });
      return JSON.stringify({ success: true, data: result });
    }

    case "search": {
      if (!query) return JSON.stringify({ error: "query is required for search" });
      const forms = formType ? [formType] : undefined;
      const result = await searchFilings(query, { forms, limit });
      return JSON.stringify({ success: true, data: result });
    }

    case "fetch": {
      const accession = req.accessionNumber as string | undefined;
      const document = req.primaryDocument as string | undefined;
      if (!ticker || !accession || !document) {
        return JSON.stringify({ error: "ticker, accessionNumber, primaryDocument required for fetch" });
      }
      const result = await fetchFiling(ticker, accession, document);
      return JSON.stringify({ success: true, data: result });
    }

    default:
      return JSON.stringify({ error: `Unknown action: ${action}` });
  }
}

async function main() {
  console.log("[Seller] Loading configuration...");
  const config = loadSellerConfig();
  console.log(`[Seller] Network: ${config.network}`);
  console.log(`[Seller] Agent wallet: ${config.agentWalletAddress}`);

  console.log("[Seller] Building contract client...");
  const contractClient = await buildContractClient(config);

  const acpClient = new AcpClient({
    acpContractClient: contractClient,

    onNewTask: async (job: AcpJob, memoToSign?: AcpMemo) => {
      console.log(`[Seller] New task: jobId=${job.id} phase=${AcpJobPhases[job.phase]}`);
      console.log(`[Seller]   name=${job.name}`);
      console.log(`[Seller]   requirement=${JSON.stringify(job.requirement)}`);
      console.log(`[Seller]   price=${job.price}`);

      try {
        // REQUEST → 작업 수락
        if (job.phase === AcpJobPhases.REQUEST && memoToSign) {
          console.log(`[Seller] Accepting job ${job.id}...`);
          await job.respond(true, "SEC EDGAR search ready.");
          return;
        }

        // TRANSACTION → 작업 실행 후 결과 전달
        if (job.phase === AcpJobPhases.TRANSACTION) {
          console.log(`[Seller] Executing job ${job.id}...`);
          const result = await handleJob(job);
          console.log(`[Seller] Delivering result for job ${job.id}...`);
          await job.deliver(result);
          console.log(`[Seller] Job ${job.id} delivered!`);
          return;
        }
      } catch (err) {
        console.error(`[Seller] Error handling job ${job.id}:`, err);
        try {
          await job.respond(false, `Error: ${err instanceof Error ? err.message : String(err)}`);
        } catch {
          // 이미 다른 phase일 수 있음
        }
      }
    },

    onEvaluate: async (job: AcpJob) => {
      console.log(`[Seller] Evaluation requested for job ${job.id}`);
      const deliverable = await job.getDeliverable();
      console.log(`[Seller] Auto-approving evaluation for job ${job.id}`);
      await job.evaluate(true, "Delivery confirmed.");
    },
  });

  console.log("[Seller] Initializing ACP client...");
  await acpClient.init();

  console.log("[Seller] SEC EDGAR skill seller is running. Waiting for jobs...");
  console.log("[Seller] Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("[Seller] Fatal error:", err);
  process.exit(1);
});
