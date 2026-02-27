/**
 * ACP Service Handler for SEC Filing Search
 *
 * Virtual Protocol ACP에서 다른 에이전트가 이 서비스를 호출하면
 * 이 핸들러가 실행됩니다.
 *
 * Note: 이 파일은 openclaw-acp 프레임워크의 offering 규약을 따릅니다.
 * 실제 런타임은 src/seller.ts가 ACP SDK를 직접 사용합니다.
 */

import type { AcpJob } from "@virtuals-protocol/acp-node";
import { handleJobRequest, type JobRequest } from "../../../src/job-handler.js";

export async function executeJob(job: AcpJob): Promise<void> {
  const result = await handleJobRequest(job.requirement as JobRequest | undefined);
  await job.deliver(JSON.stringify(result));
}
