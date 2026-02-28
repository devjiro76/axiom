/**
 * Skill Registry — multi-skill router
 *
 * 각 skill의 handler를 등록하고, requirement.skill 필드로 라우팅.
 * skill 필드 없으면 기본 skill(sec-edgar)로 폴백.
 */

export interface SkillRequest {
  skill?: string;
  action?: string;
  [key: string]: unknown;
}

export interface SkillResult {
  success?: boolean;
  error?: string;
  data?: unknown;
}

export type SkillHandler = (req: SkillRequest | undefined) => Promise<SkillResult>;

const registry = new Map<string, SkillHandler>();
let defaultSkill: string | null = null;

export function registerSkill(name: string, handler: SkillHandler): void {
  registry.set(name, handler);
  if (!defaultSkill) defaultSkill = name;
}

export function setDefaultSkill(name: string): void {
  defaultSkill = name;
}

export async function routeRequest(req: SkillRequest | undefined): Promise<SkillResult> {
  const skillName = req?.skill ?? defaultSkill;
  if (!skillName) {
    return { error: "No skill specified and no default skill registered" };
  }

  const handler = registry.get(skillName);
  if (!handler) {
    const available = Array.from(registry.keys()).join(", ");
    return { error: `Unknown skill: "${skillName}". Available: ${available}` };
  }

  return handler(req);
}

export function listSkills(): string[] {
  return Array.from(registry.keys());
}
