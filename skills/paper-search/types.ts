/** Academic Paper Search 타입 정의 */

export interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  citationCount: number;
  influentialCitationCount: number;
  url: string;
  authors: Author[];
  venue: string | null;
  fieldsOfStudy: string[] | null;
  isOpenAccess: boolean;
}

export interface Author {
  authorId: string | null;
  name: string;
}

export interface PaperSearchResult {
  query: string;
  total: number;
  papers: Paper[];
}

export interface CitationResult {
  paperId: string;
  direction: "citations" | "references";
  total: number;
  papers: Paper[];
}

export interface AuthorDetail {
  authorId: string;
  name: string;
  paperCount: number;
  citationCount: number;
  hIndex: number;
  papers: Paper[];
}
