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
import { handleJobRequest, type JobRequest } from "./job-handler.js";

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
          const result = await handleJobRequest(job.requirement as JobRequest | undefined);
          console.log(`[Seller] Delivering result for job ${job.id}...`);
          await job.deliver(JSON.stringify(result));
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
