/** US Macro Data (FRED) 타입 정의 */

export interface SeriesMeta {
  id: string;
  title: string;
  frequency: string;
  units: string;
  seasonalAdjustment: string;
  lastUpdated: string;
  notes: string | null;
}

export interface Observation {
  date: string;
  value: number | null;
}

export interface SeriesData {
  meta: SeriesMeta;
  observations: Observation[];
}

export interface SeriesSearchResult {
  query: string;
  total: number;
  series: SeriesMeta[];
}

export interface PopularIndicator {
  id: string;
  title: string;
  latestDate: string;
  latestValue: number | null;
  units: string;
}
