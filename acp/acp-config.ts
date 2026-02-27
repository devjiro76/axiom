/**
 * ACP 설정 로더
 * .env에서 설정을 읽어 ACP 클라이언트를 초기화합니다.
 */

import "dotenv/config";
import {
  AcpContractClientV2,
  baseSepoliaAcpConfigV2,
  baseAcpConfigV2,
  type AcpContractConfig,
} from "@virtuals-protocol/acp-node";

export interface AcpEnvConfig {
  walletPrivateKey: `0x${string}`;
  entityKeyId: number;
  agentWalletAddress: `0x${string}`;
  network: "testnet" | "mainnet";
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function loadSellerConfig(): AcpEnvConfig {
  return {
    walletPrivateKey: requireEnv("WHITELISTED_WALLET_PRIVATE_KEY") as `0x${string}`,
    entityKeyId: parseInt(requireEnv("SESSION_ENTITY_KEY_ID"), 10),
    agentWalletAddress: requireEnv("AGENT_WALLET_ADDRESS") as `0x${string}`,
    network: (process.env.NETWORK ?? "testnet") as "testnet" | "mainnet",
  };
}

export function loadBuyerConfig(): AcpEnvConfig {
  return {
    walletPrivateKey: requireEnv("BUYER_WALLET_PRIVATE_KEY") as `0x${string}`,
    entityKeyId: parseInt(requireEnv("BUYER_ENTITY_KEY_ID"), 10),
    agentWalletAddress: requireEnv("BUYER_WALLET_ADDRESS") as `0x${string}`,
    network: (process.env.NETWORK ?? "testnet") as "testnet" | "mainnet",
  };
}

export function getContractConfig(network: "testnet" | "mainnet"): AcpContractConfig {
  return network === "testnet" ? baseSepoliaAcpConfigV2 : baseAcpConfigV2;
}

export async function buildContractClient(config: AcpEnvConfig) {
  return AcpContractClientV2.build(
    config.walletPrivateKey,
    config.entityKeyId,
    config.agentWalletAddress,
    getContractConfig(config.network)
  );
}
