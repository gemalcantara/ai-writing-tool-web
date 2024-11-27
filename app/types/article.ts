
export interface Article {
  _id: string
  created_by: string
  created_at: string
  article_title: string
  article_output: string
  outline: string
  article_details?: ArticleDetails
  fact_checker_result?: string
  style_guide_result?: string
  legal_rules_result?: string
  plagiarism_result?: PlagiarismData,
  mode: string;
}

export interface ArticleDetails {
  client: string
  keyword: string
  meta: string
  slug: string
}

export interface PlagiarismResult {
  index: number
  url: string
  title: string
  minwordsmatched: string
  viewurl: string
  htmlsnippet: string
}

export interface PlagiarismData {
  count: number
  result: PlagiarismResult[]
}