"""
axiom Agentverse Adapter
Fetch.ai uAgent that exposes axiom's 7 data skills on Agentverse/Almanac.

Architecture:
  uAgent (Python) → Apify Actor API (already deployed) → skill handlers

This avoids running Node.js alongside Python — reuses the Apify deployment.
"""

import os
import json
import httpx
from uagents import Agent, Context, Model, Protocol

# --- Configuration ---
APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
APIFY_ACTOR_ID = os.getenv("APIFY_ACTOR_ID", "Nma9xvyeLgNeNXz9Y")
AGENT_SEED = os.getenv("AGENT_SEED", "axiom-agentverse-seed-phrase-change-me")
AGENT_PORT = int(os.getenv("AGENT_PORT", "8000"))

APIFY_RUN_URL = f"https://api.apify.com/v2/acts/{APIFY_ACTOR_ID}/runs"

SKILLS = [
    "sec-edgar", "defi-analytics", "wallet-profiler",
    "paper-search", "macro-data", "patent-search", "token-sentiment",
]


# --- Message Models ---
class SkillRequest(Model):
    skill: str
    action: str
    params: dict = {}


class SkillResponse(Model):
    success: bool
    data: dict = {}
    error: str = ""


class ListSkillsRequest(Model):
    pass


class ListSkillsResponse(Model):
    skills: list[str]
    description: str


# --- Agent Setup ---
agent = Agent(
    name="axiom",
    seed=AGENT_SEED,
    port=AGENT_PORT,
    mailbox=True,
    endpoint=[f"http://localhost:{AGENT_PORT}/submit"],
)

skill_protocol = Protocol(name="axiom-skills", version="1.0.0")


# --- Apify Actor Caller ---
async def call_apify_actor(skill: str, action: str, params: dict) -> dict:
    """Call the Apify Actor to execute a skill."""
    payload = {
        "skill": skill,
        "action": action,
        **params,
    }
    headers = {"Content-Type": "application/json"}
    if APIFY_TOKEN:
        headers["Authorization"] = f"Bearer {APIFY_TOKEN}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Start the Actor run
        resp = await client.post(
            f"{APIFY_RUN_URL}?waitForFinish=60",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        run_data = resp.json()["data"]

        # Get the output from the default dataset
        dataset_id = run_data.get("defaultDatasetId")
        if not dataset_id:
            return {"error": "No dataset returned from Actor run"}

        dataset_resp = await client.get(
            f"https://api.apify.com/v2/datasets/{dataset_id}/items",
            headers=headers,
        )
        dataset_resp.raise_for_status()
        items = dataset_resp.json()

        if items and len(items) > 0:
            return items[0]
        return {"error": "Empty result from Actor"}


# --- Message Handlers ---
@skill_protocol.on_message(ListSkillsRequest, replies={ListSkillsResponse})
async def handle_list_skills(ctx: Context, sender: str, msg: ListSkillsRequest):
    """List available skills."""
    ctx.logger.info(f"List skills request from {sender}")
    await ctx.send(
        sender,
        ListSkillsResponse(
            skills=SKILLS,
            description="axiom: Multi-skill AI data agent. "
            "SEC filings, DeFi analytics, wallet profiling, "
            "paper search, US macro data, patent search, token sentiment.",
        ),
    )


@skill_protocol.on_message(SkillRequest, replies={SkillResponse})
async def handle_skill_request(ctx: Context, sender: str, msg: SkillRequest):
    """Execute a skill request via Apify Actor."""
    ctx.logger.info(f"Skill request from {sender}: {msg.skill}/{msg.action}")

    if msg.skill not in SKILLS:
        await ctx.send(
            sender,
            SkillResponse(
                success=False,
                error=f"Unknown skill: {msg.skill}. Available: {', '.join(SKILLS)}",
            ),
        )
        return

    try:
        result = await call_apify_actor(msg.skill, msg.action, msg.params)
        is_error = "error" in result and not result.get("success", True)
        await ctx.send(
            sender,
            SkillResponse(
                success=not is_error,
                data=result,
                error=result.get("error", "") if is_error else "",
            ),
        )
    except Exception as e:
        ctx.logger.error(f"Skill execution failed: {e}")
        await ctx.send(
            sender,
            SkillResponse(success=False, error=str(e)),
        )


agent.include(skill_protocol, publish_manifest=True)

# --- Startup ---
@agent.on_event("startup")
async def on_startup(ctx: Context):
    ctx.logger.info(f"axiom agent started: {agent.address}")
    ctx.logger.info(f"Skills: {', '.join(SKILLS)}")
    ctx.logger.info(f"Apify Actor: {APIFY_ACTOR_ID}")


if __name__ == "__main__":
    agent.run()
