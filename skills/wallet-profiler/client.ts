/**
 * Etherscan / Basescan API Client
 *
 * 무료 API 키 필요 (즉시 발급).
 * 5 calls/sec, 100k calls/day.
 * https://docs.basescan.org/
 * https://docs.etherscan.io/
 */

import type {
  Chain,
  Balance,
  TokenHolding,
  Transaction,
  TxSummary,
  NftHolding,
} from "./types.js";

const ENDPOINTS: Record<Chain, string> = {
  base: "https://api.basescan.org/api",
  ethereum: "https://api.etherscan.io/api",
};

function getApiKey(chain: Chain): string {
  const key = chain === "base"
    ? process.env.BASESCAN_API_KEY
    : process.env.ETHERSCAN_API_KEY;
  if (!key) throw new Error(`${chain.toUpperCase()}_API_KEY (or BASESCAN/ETHERSCAN_API_KEY) not set`);
  return key;
}

async function fetchApi<T>(chain: Chain, params: Record<string, string>): Promise<T> {
  const apiKey = getApiKey(chain);
  const url = new URL(ENDPOINTS[chain]);
  url.searchParams.set("apikey", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`${chain} API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { status: string; message: string; result: T };
  if (data.status === "0" && data.message !== "No transactions found") {
    throw new Error(`${chain} API: ${data.message} — ${JSON.stringify(data.result)}`);
  }
  return data.result;
}

// ─── 잔고 조회 ───

export async function getBalance(
  address: string,
  options: { chain?: Chain } = {}
): Promise<Balance> {
  const chain = options.chain ?? "base";

  const result = await fetchApi<string>(chain, {
    module: "account",
    action: "balance",
    address,
    tag: "latest",
  });

  const wei = BigInt(result);
  const eth = Number(wei) / 1e18;

  return {
    address,
    chain,
    balanceWei: result,
    balanceEth: eth.toFixed(6),
  };
}

// ─── ERC-20 토큰 보유 ───

export async function getTokenHoldings(
  address: string,
  options: { chain?: Chain } = {}
): Promise<TokenHolding[]> {
  const chain = options.chain ?? "base";

  const txs = await fetchApi<Array<Record<string, string>>>(chain, {
    module: "account",
    action: "tokentx",
    address,
    sort: "desc",
    page: "1",
    offset: "100",
  });

  if (!Array.isArray(txs)) return [];

  // 각 토큰의 최신 전송만 수집하여 보유 토큰 목록 추출
  const seen = new Set<string>();
  const holdings: TokenHolding[] = [];

  for (const tx of txs) {
    const contract = tx.contractAddress;
    if (seen.has(contract)) continue;
    seen.add(contract);

    holdings.push({
      contractAddress: contract,
      name: tx.tokenName ?? "",
      symbol: tx.tokenSymbol ?? "",
      decimals: parseInt(tx.tokenDecimal ?? "18", 10),
      balance: "", // balance requires separate call per token
    });
  }

  return holdings;
}

// ─── 트랜잭션 히스토리 ───

export async function getTxHistory(
  address: string,
  options: { chain?: Chain; limit?: number } = {}
): Promise<Transaction[]> {
  const { chain = "base", limit = 20 } = options;

  const txs = await fetchApi<Array<Record<string, string>>>(chain, {
    module: "account",
    action: "txlist",
    address,
    sort: "desc",
    page: "1",
    offset: String(Math.min(limit, 100)),
  });

  if (!Array.isArray(txs)) return [];

  return txs.map((tx) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    gasUsed: tx.gasUsed,
    timeStamp: tx.timeStamp,
    functionName: tx.functionName ?? "",
    isError: tx.isError ?? "0",
  }));
}

// ─── 트랜잭션 요약 ───

export async function getTxSummary(
  address: string,
  options: { chain?: Chain } = {}
): Promise<TxSummary> {
  const chain = options.chain ?? "base";
  const txs = await getTxHistory(address, { chain, limit: 100 });
  const addr = address.toLowerCase();

  const counterparties = new Map<string, number>();
  let inbound = 0;
  let outbound = 0;

  for (const tx of txs) {
    const isInbound = tx.to.toLowerCase() === addr;
    if (isInbound) {
      inbound++;
      counterparties.set(tx.from, (counterparties.get(tx.from) ?? 0) + 1);
    } else {
      outbound++;
      counterparties.set(tx.to, (counterparties.get(tx.to) ?? 0) + 1);
    }
  }

  const topCounterparties = Array.from(counterparties.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([address, count]) => ({ address, count }));

  return {
    address,
    chain,
    totalTx: txs.length,
    inbound,
    outbound,
    uniqueCounterparties: counterparties.size,
    topCounterparties,
    firstTx: txs.at(-1)?.timeStamp ?? null,
    lastTx: txs[0]?.timeStamp ?? null,
  };
}

// ─── NFT 보유 ───

export async function getNftHoldings(
  address: string,
  options: { chain?: Chain } = {}
): Promise<NftHolding[]> {
  const chain = options.chain ?? "base";

  const txs = await fetchApi<Array<Record<string, string>>>(chain, {
    module: "account",
    action: "tokennfttx",
    address,
    sort: "desc",
    page: "1",
    offset: "50",
  });

  if (!Array.isArray(txs)) return [];

  // 현재 보유 NFT (받은 것 - 보낸 것)
  const held = new Map<string, Record<string, string>>();
  const addr = address.toLowerCase();

  for (const tx of txs.reverse()) {
    const key = `${tx.contractAddress}-${tx.tokenID}`;
    if (tx.to.toLowerCase() === addr) {
      held.set(key, tx);
    } else {
      held.delete(key);
    }
  }

  return Array.from(held.values()).map((tx) => ({
    contractAddress: tx.contractAddress,
    name: tx.tokenName ?? "",
    symbol: tx.tokenSymbol ?? "",
    tokenId: tx.tokenID,
  }));
}
