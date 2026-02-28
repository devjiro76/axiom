/** On-chain Wallet Profiler 타입 정의 */

export type Chain = "base" | "ethereum";

export interface Balance {
  address: string;
  chain: Chain;
  balanceWei: string;
  balanceEth: string;
}

export interface TokenHolding {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timeStamp: string;
  functionName: string;
  isError: string;
}

export interface TxSummary {
  address: string;
  chain: Chain;
  totalTx: number;
  inbound: number;
  outbound: number;
  uniqueCounterparties: number;
  topCounterparties: Array<{ address: string; count: number }>;
  firstTx: string | null;
  lastTx: string | null;
}

export interface NftHolding {
  contractAddress: string;
  name: string;
  symbol: string;
  tokenId: string;
}
