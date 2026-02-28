#!/usr/bin/env tsx
/**
 * ACP Seller Runtime — Multi-skill
 *
 * 등록된 모든 스킬을 ACP 마켓플레이스에서 제공합니다.
 * requirement.skill 필드로 라우팅, 미지정 시 기본 스킬(sec-edgar)로 폴백.
 *
 * Usage:
 *   tsx acp/seller.ts
 */

import AcpClientDefault, {
  AcpJob,
  AcpMemo,
  AcpJobPhases,
} from "@virtuals-protocol/acp-node";
import { loadSellerConfig, buildContractClient } from "./config.js";
import { registerSkill, setDefaultSkill, routeRequest, listSkills, type SkillRequest } from "../lib/skill-registry.js";

// ─── Skill Registration ───
import { handleJobRequest as edgarHandler } from "../skills/sec-edgar/handler.js";
import { handleJobRequest as paperHandler } from "../skills/paper-search/handler.js";
import { handleJobRequest as defiHandler } from "../skills/defi-analytics/handler.js";
import { handleJobRequest as macroHandler } from "../skills/macro-data/handler.js";
import { handleJobRequest as walletHandler } from "../skills/wallet-profiler/handler.js";
import { handleJobRequest as patentHandler } from "../skills/patent-search/handler.js";
import { handleJobRequest as sentimentHandler } from "../skills/token-sentiment/handler.js";

registerSkill("sec-edgar", edgarHandler as (req: SkillRequest | undefined) => Promise<{ success?: boolean; error?: string; data?: unknown }>);
registerSkill("paper-search", paperHandler);
registerSkill("defi-analytics", defiHandler);
registerSkill("macro-data", macroHandler);
registerSkill("wallet-profiler", walletHandler);
registerSkill("token-sentiment", sentimentHandler);

// API 키 필요 스킬: 키 있을 때만 등록
if (process.env.PATENTSVIEW_API_KEY) {
  registerSkill("patent-search", patentHandler);
} else {
  console.log("[Seller] patent-search disabled (PATENTSVIEW_API_KEY not set)");
}
setDefaultSkill("sec-edgar");

// ESM/CJS interop: default export가 { default: class } 형태일 수 있음
const AcpClient = (AcpClientDefault as any).default ?? AcpClientDefault;

async function main() {
  console.log("[Seller] Loading configuration...");
  const config = loadSellerConfig();
  console.log(`[Seller] Network: ${config.network}`);
  console.log(`[Seller] Agent wallet: ${config.agentWalletAddress}`);

  console.log("[Seller] Building contract client...");
  const contractClient = await buildContractClient(config);

  // 중복 처리 방지
  const processedJobs = new Set<string>();

  const acpClient = new AcpClient({
    acpContractClient: contractClient,

    onNewTask: async (job: AcpJob, memoToSign?: AcpMemo) => {
      const jobKey = `${job.id}-${job.phase}`;
      if (processedJobs.has(jobKey)) {
        console.log(`[Seller] Skipping duplicate: jobId=${job.id} phase=${job.phase}`);
        return;
      }
      processedJobs.add(jobKey);

      console.log(`[Seller] New task: jobId=${job.id} phase=${job.phase} (${AcpJobPhases[job.phase] ?? job.phase})`);
      console.log(`[Seller]   memoToSign=${!!memoToSign} memos=${job.memos?.length ?? 0}`);
      console.log(`[Seller]   requirement=${JSON.stringify(job.requirement)}`);

      try {
        // REQUEST → 작업 수락
        if (job.phase === AcpJobPhases.REQUEST && memoToSign) {
          console.log(`[Seller] Accepting job ${job.id}...`);
          const skills = listSkills().join(", ");
          const result = await job.respond(true, `Ready. Available skills: ${skills}`);
          console.log(`[Seller] Respond result:`, JSON.stringify(result));
          return;
        }

        // TRANSACTION → 작업 실행 후 결과 전달
        if (job.phase === AcpJobPhases.TRANSACTION) {
          console.log(`[Seller] Executing job ${job.id}...`);
          const skillResult = await routeRequest(job.requirement as SkillRequest | undefined);
          console.log(`[Seller] Delivering result for job ${job.id}...`);
          await job.deliver(JSON.stringify(skillResult));
          console.log(`[Seller] Job ${job.id} delivered!`);
          return;
        }

        console.log(`[Seller] Unhandled phase ${job.phase} for job ${job.id}`);
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

  console.log(`[Seller] Multi-skill seller running. Skills: ${listSkills().join(", ")}`);
  console.log("[Seller] Press Ctrl+C to stop.");
}

// Graceful shutdown (pm2 sends SIGTERM)
process.on("SIGTERM", () => {
  console.log("[Seller] SIGTERM received, shutting down...");
  process.exit(0);
});

main().catch((err) => {
  console.error("[Seller] Fatal error:", err);
  process.exit(1);
});
