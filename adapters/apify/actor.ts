#!/usr/bin/env node
/**
 * axiom Apify Actor
 *
 * 7개 데이터 스킬을 Apify Actor로 노출합니다.
 * Apify 마켓플레이스에서 호출당 과금으로 수익화.
 *
 * Usage:
 *   apify run               # 로컬 테스트
 *   apify push              # Apify 플랫폼 배포
 */

import { Actor, log } from "apify";

// ─── Skill Handlers ───
import { handleJobRequest as edgarHandler } from "../../skills/sec-edgar/handler.js";
import { handleJobRequest as paperHandler } from "../../skills/paper-search/handler.js";
import { handleJobRequest as defiHandler } from "../../skills/defi-analytics/handler.js";
import { handleJobRequest as macroHandler } from "../../skills/macro-data/handler.js";
import { handleJobRequest as walletHandler } from "../../skills/wallet-profiler/handler.js";
import { handleJobRequest as patentHandler } from "../../skills/patent-search/handler.js";
import { handleJobRequest as sentimentHandler } from "../../skills/token-sentiment/handler.js";

const SKILL_HANDLERS: Record<string, (params: Record<string, unknown>) => Promise<unknown>> = {
  "sec-edgar": edgarHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "defi-analytics": defiHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "wallet-profiler": walletHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "paper-search": paperHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "macro-data": macroHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "patent-search": patentHandler as (params: Record<string, unknown>) => Promise<unknown>,
  "token-sentiment": sentimentHandler as (params: Record<string, unknown>) => Promise<unknown>,
};

interface ActorInput {
  skill: string;
  action: string;
  [key: string]: unknown;
}

await Actor.init();

const input = (await Actor.getInput()) as ActorInput | null;

if (!input?.skill) {
  await Actor.fail("Missing required input: skill");
  process.exit(1);
}
if (!input?.action) {
  await Actor.fail("Missing required input: action");
  process.exit(1);
}

const handler = SKILL_HANDLERS[input.skill];
if (!handler) {
  await Actor.fail(
    `Unknown skill: ${input.skill}. Available: ${Object.keys(SKILL_HANDLERS).join(", ")}`
  );
  process.exit(1);
}

log.info(`Running skill=${input.skill} action=${input.action}`);

try {
  const { skill: _s, action: _a, ...params } = input;
  const result = await handler({ action: input.action, ...params });
  const output = { skill: input.skill, action: input.action, result, timestamp: new Date().toISOString() };

  await Actor.pushData(output);
  await Actor.setValue("OUTPUT", output);
  log.info("Skill execution completed successfully");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  log.error(`Skill execution failed: ${message}`);
  await Actor.setValue("OUTPUT", {
    success: false,
    error: message,
    skill: input.skill,
    action: input.action,
  });
  await Actor.fail(message);
}

await Actor.exit();
