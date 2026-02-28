/**
 * FRED API Client
 *
 * 무료 API, 키 등록 필요 (즉시 발급).
 * https://fred.stlouisfed.org/docs/api/
 * 120 req/min
 */

import type {
  SeriesMeta,
  Observation,
  SeriesData,
  SeriesSearchResult,
  PopularIndicator,
} from "./types.js";

const BASE_URL = "https://api.stlouisfed.org/fred";
const API_KEY = process.env.FRED_API_KEY;

function ensureApiKey(): string {
  if (!API_KEY) throw new Error("FRED_API_KEY not set in environment");
  return API_KEY;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FRED API error: ${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

// ─── 시리즈 검색 ───

export async function searchSeries(
  query: string,
  options: { limit?: number } = {}
): Promise<SeriesSearchResult> {
  const { limit = 10 } = options;
  const key = ensureApiKey();

  const params = new URLSearchParams({
    api_key: key,
    file_type: "json",
    search_text: query,
    limit: String(limit),
  });

  const data = await fetchJson<{ seriess: Array<Record<string, unknown>> }>(
    `${BASE_URL}/series/search?${params.toString()}`
  );

  return {
    query,
    total: data.seriess.length,
    series: data.seriess.map(toSeriesMeta),
  };
}

// ─── 시계열 데이터 조회 ───

export async function getSeriesObservations(
  seriesId: string,
  options: { startDate?: string; endDate?: string; frequency?: string } = {}
): Promise<SeriesData> {
  const { startDate, endDate, frequency } = options;
  const key = ensureApiKey();

  // 메타 + 데이터 동시 요청
  const metaParams = new URLSearchParams({
    api_key: key,
    file_type: "json",
    series_id: seriesId,
  });

  const obsParams = new URLSearchParams({
    api_key: key,
    file_type: "json",
    series_id: seriesId,
    sort_order: "desc",
    limit: "120",
  });
  if (startDate) obsParams.set("observation_start", startDate);
  if (endDate) obsParams.set("observation_end", endDate);
  if (frequency) obsParams.set("frequency", frequency);

  const [metaRes, obsRes] = await Promise.all([
    fetchJson<{ seriess: Array<Record<string, unknown>> }>(
      `${BASE_URL}/series?${metaParams.toString()}`
    ),
    fetchJson<{ observations: Array<{ date: string; value: string }> }>(
      `${BASE_URL}/series/observations?${obsParams.toString()}`
    ),
  ]);

  const meta = toSeriesMeta(metaRes.seriess[0]);
  const observations: Observation[] = obsRes.observations
    .map((o) => ({
      date: o.date,
      value: o.value === "." ? null : parseFloat(o.value),
    }))
    .reverse();

  return { meta, observations };
}

// ─── 주요 지표 최신값 ───

const POPULAR_SERIES = [
  "FEDFUNDS",   // 연방기금금리
  "CPIAUCSL",   // CPI
  "GDP",        // GDP
  "UNRATE",     // 실업률
  "DGS10",      // 10년물 국채
  "M2SL",       // M2 통화량
];

export async function getPopularIndicators(): Promise<PopularIndicator[]> {
  const key = ensureApiKey();
  const results: PopularIndicator[] = [];

  for (const id of POPULAR_SERIES) {
    const params = new URLSearchParams({
      api_key: key,
      file_type: "json",
      series_id: id,
      sort_order: "desc",
      limit: "1",
    });

    const [metaRes, obsRes] = await Promise.all([
      fetchJson<{ seriess: Array<Record<string, unknown>> }>(
        `${BASE_URL}/series?${new URLSearchParams({ api_key: key, file_type: "json", series_id: id }).toString()}`
      ),
      fetchJson<{ observations: Array<{ date: string; value: string }> }>(
        `${BASE_URL}/series/observations?${params.toString()}`
      ),
    ]);

    const meta = metaRes.seriess[0];
    const obs = obsRes.observations[0];

    results.push({
      id,
      title: meta.title as string,
      latestDate: obs?.date ?? "",
      latestValue: obs?.value === "." ? null : parseFloat(obs?.value ?? "0"),
      units: (meta.units as string) ?? "",
    });
  }

  return results;
}

// ─── 복수 지표 비교 ───

export async function compareSeries(
  seriesIds: string[],
  options: { startDate?: string } = {}
): Promise<SeriesData[]> {
  return Promise.all(
    seriesIds.map((id) => getSeriesObservations(id, options))
  );
}

// ─── Helper ───

function toSeriesMeta(raw: Record<string, unknown>): SeriesMeta {
  return {
    id: raw.id as string,
    title: raw.title as string,
    frequency: (raw.frequency as string) ?? "",
    units: (raw.units as string) ?? "",
    seasonalAdjustment: (raw.seasonal_adjustment as string) ?? "",
    lastUpdated: (raw.last_updated as string) ?? "",
    notes: (raw.notes as string) ?? null,
  };
}
