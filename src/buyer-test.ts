#!/usr/bin/env tsx
/**
 * ACP Buyer Test Script
 *
 * Sandbox 10건 거래를 위한 테스트 바이어입니다.
 * 셀러에게 SEC EDGAR 검색 작업을 요청하고 결과를 평가합니다.
 *
 * Usage:
 *   tsx src/buyer-test.ts              # 1건 테스트
 *   tsx src/buyer-test.ts --count 10   # 10건 연속 테스트
 */

import AcpClient, {
  AcpJob,
  AcpJobPhases,
  FareAmount,
} from "@virtuals-protocol/acp-node";
import { loadBuyerConfig, loadSellerConfig, buildContractClient, getContractConfig } from "./acp-config.js";

// 테스트 시나리오 10개 (Sandbox 통과용)
const TEST_SCENARIOS = [
  { action: "lookup", ticker: "AAPL" },
  { action: "lookup", ticker: "TSLA" },
  { action: "lookup", ticker: "MSFT" },
  { action: "filings", ticker: "AAPL", formType: "10-K", limit: 3 },
  { action: "filings", ticker: "NVDA", formType: "10-Q", limit: 3 },
  { action: "filings", ticker: "GOOGL", formType: "8-K", limit: 3 },
  { action: "search", query: "artificial intelligence", formType: "10-K", limit: 3 },
  { action: "search", query: "revenue growth risk", formType: "10-Q", limit: 3 },
  { action: "search", query: "cybersecurity", formType: "8-K", limit: 3 },
  { action: "lookup", ticker: "AMZN" },
];

function parseArgs(): { count: number } {
  const countIdx = process.argv.indexOf("--count");
  const count = countIdx !== -1 ? parseInt(process.argv[countIdx + 1], 10) : 1;
  return { count: Math.min(count, TEST_SCENARIOS.length) };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { count } = parseArgs();
  console.log(`[Buyer] Starting ${count} test transaction(s)...`);

  const buyerConfig = loadBuyerConfig();
  const sellerConfig = loadSellerConfig();
  console.log(`[Buyer] Network: ${buyerConfig.network}`);
  console.log(`[Buyer] Buyer wallet: ${buyerConfig.agentWalletAddress}`);
  console.log(`[Buyer] Seller wallet: ${sellerConfig.agentWalletAddress}`);

  const contractClient = await buildContractClient(buyerConfig);
  const contractConfig = getContractConfig(buyerConfig.network);

  const acpClient = new AcpClient({
    acpContractClient: contractClient,

    onEvaluate: async (job: AcpJob) => {
      const deliverable = await job.getDeliverable();
      console.log(`[Buyer] Received deliverable for job ${job.id}:`);
      console.log(JSON.stringify(deliverable, null, 2).slice(0, 500));
      console.log(`[Buyer] Auto-approving job ${job.id}...`);
      await job.evaluate(true, "Test transaction approved.");
    },
  });

  const fare = new FareAmount(0.001, contractConfig.baseFare);

  for (let i = 0; i < count; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n[Buyer] ═══ Test ${i + 1}/${count} ═══`);
    console.log(`[Buyer] Scenario: ${JSON.stringify(scenario)}`);

    try {
      const jobId = await acpClient.initiateJob(
        sellerConfig.agentWalletAddress as `0x${string}`,
        scenario,
        fare
      );
      console.log(`[Buyer] Job created: #${jobId}`);

      // 작업 완료 대기 (최대 60초)
      let completed = false;
      for (let wait = 0; wait < 30; wait++) {
        await sleep(2000);
        const job = await acpClient.getJobById(jobId);
        if (!job) continue;

        if (job.phase === AcpJobPhases.COMPLETED) {
          console.log(`[Buyer] Job #${jobId} COMPLETED`);
          completed = true;
          break;
        }
        if (job.phase === AcpJobPhases.REJECTED) {
          console.log(`[Buyer] Job #${jobId} REJECTED: ${job.rejectionReason}`);
          completed = true;
          break;
        }
        if (job.phase === AcpJobPhases.EXPIRED) {
          console.log(`[Buyer] Job #${jobId} EXPIRED`);
          completed = true;
          break;
        }
      }

      if (!completed) {
        console.log(`[Buyer] Job #${jobId} timed out after 60s`);
      }
    } catch (err) {
      console.error(`[Buyer] Test ${i + 1} failed:`, err instanceof Error ? err.message : err);
    }

    // 다음 거래 전 잠시 대기 (rate limit 방지)
    if (i < count - 1) {
      console.log("[Buyer] Waiting 5s before next transaction...");
      await sleep(5000);
    }
  }

  console.log(`\n[Buyer] All ${count} test(s) completed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[Buyer] Fatal error:", err);
  process.exit(1);
});
