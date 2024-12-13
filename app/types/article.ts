export interface Article {
  _id: string;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
  outline: OutlineData;
  outline_input_data: OutlineInputData;
  production_date?: string;
  article_details?: ArticleDetails;
  mode?: "constellation";
}

export interface OutlineData {
  title: string;
  meta_description: string;
  slug: string;
  sections: SectionField[];
}

export interface OutlineInputData {
  inputFieldStaticOutline: InputFieldStaticOutline;
  inputFieldStaticArticle: InputFieldStaticArticle;
  linkFields: LinkFields;
  inputFields: SectionField[];
}

export interface InputFieldStaticOutline {
  articleDescription: string;
  selectedClient: string;
  authorityLinks: string;
  selectedPage: string;
  clientName: string;
  pageName: string;
  articlePrompt: string;
  clientGuideline: string;
}

export interface InputFieldStaticArticle {
  instruction: string;
  articlePrompt: string;
  clientGuideline: string;
  articleGuideline: string;
  selectedClient: string;
  clientName: string;
  pageName: string;
  selectedPage: string;
  keywords: string;
  pageTitle: string;
}

export interface LinkFields {
  keywords: Array<{ id: number; value: string }>;
  competitorLinks: Array<{ id: number; value: string }>;
  internalLinks: Array<{ id: number; value: string }>;
  authorityLinks: Array<{ id: number; value: string }>;
}

export interface ArticleDetails {
  client: string;
  keyword: string;
  meta: string;
  slug: string;
  articleTitle: string;
}

export interface PlagiarismResult {
  index: number;
  url: string;
  title: string;
  minwordsmatched: string;
  viewurl: string;
  htmlsnippet: string;
}

export interface PlagiarismData {
  count: number;
  result: PlagiarismResult[];
}

export interface ArticleState {
  outline: string | OutlineData;
  outlineMetaData: {
    title: string;
    meta_description: string;
    slug: string;
  };
  toCopy: string;
  clients: any[];
  pages: any[];
  inputFields: SectionField[];
  outlineInputData?: OutlineInputData;
  inputFieldStaticOutline: {
    articleDescription: string;
    selectedClient: string;
    selectedPage: string;
    clientName: string;
    pageName: string;
    clientGuideline: string;
  };
  inputFieldStaticArticle: {
    instruction: string;
    articlePrompt: string;
    clientGuideline: string;
    selectedClient: string;
    clientName: string;
    pageName: string;
    selectedPage: string;
    keywords: string;
    pageTitle: string;
  };
  pageTitle: string;
  response: string;
  loadingResult: boolean;
  loadingOutline: boolean;
  loadingComparison: boolean;
  error?: string;
  article?: Article;
  outlineResult?: any;
  outlineResultField?: any;
  authorityLinks: string;
  internalLinks: string;
  loadingAuthority: boolean;
  loadingInternal: boolean;
  history: any[];
  linkFields: LinkFields;
}

export interface SetArticleState {
  setInputFieldStaticOutline: (value: any) => void;
  setInputFieldStaticArticle: (value: any) => void;
  setLinkFields: (value: any) => void;
  setInputFields: (value: any) => void;
  setArticle: (value: any) => void;
  setOutline: (value: string) => void;
  setOutlineMetaData: (value: any) => void;
  setPageTitle: (value: string) => void;
  setLoadingResult: (value: boolean) => void;
  setLoadingOutline: (value: boolean) => void;
  setLoadingComparison: (value: boolean) => void;
  setAuthorityLinks: (value: string) => void;
  setInternalLinks: (value: string) => void;
  setLoadingAuthority: (value: boolean) => void;
  setLoadingInternal: (value: boolean) => void;
  setHistory: (value: any[]) => void;
  setError: (value?: string) => void;
}

export interface SectionField {
  sectionTitle: string;
  description: string;
  links: { link: string }[];
  headingLevel: 'h2' | 'h3';
}