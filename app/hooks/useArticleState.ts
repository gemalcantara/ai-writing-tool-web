import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleState, SetArticleState } from '../types/article';
import { fetchData, fetchArticleById } from '../services/api';

const initialState: ArticleState = {
  outline: '',
  outlineMetaData: { title: '', meta_description: '', slug: '' },
  toCopy: '',
  clients: [],
  pages: [],
  inputFields: [] as Array<{
    sectionTitle: string;
    description: string;
    links: Array<{ link: string }>;
    headingLevel: 'h2' | 'h3';
  }>,
  inputFieldStaticOutline: {
    keywords: '',
    articleDescription: '',
    selectedClient: '',
    internalLinks: '',
    authorityLinks: '',
    competitorLinks: '',
    selectedPage: '',
    clientName: '',
    pageName: '',
    articlePrompt: '',
    clientGuideline: ''
  },
  inputFieldStaticArticle: {
    instruction: '',
    articlePrompt: '',
    clientGuideline: '',
    articleGuideline: '',
    selectedClient: '',
    clientName: '',
    pageName: '',
    selectedPage: '',
    keywords: '',
    pageTitle: ''
  },
  pageTitle: '',
  response: '',
  loadingResult: false,
  loadingOutline: false,
  authorityLinks: '',
  internalLinks: '',
  loadingAuthority: false,
  loadingInternal: false,
  history: [],
  linkFields: {
    keywords: [{ id: 1, value: '' }],
    competitorLinks: [{ id: 1, value: '' }],
    internalLinks: [{ id: 1, value: '' }],
    authorityLinks: [{ id: 1, value: '' }]
  }
};

export const useArticleState = (articleId?: string | null) => {
  const [isLoading, setIsLoading] = useState(!!articleId);
  const [state, setState] = useState<ArticleState>(initialState);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchData('clients', (data) => setState(prev => ({ ...prev, clients: data }))), 
          fetchData('pages', (data) => setState(prev => ({ ...prev, pages: data })))
        ]);

        if (articleId) {
          const articleData = await fetchArticleById(articleId);
          setState(prev => ({
            ...prev,
            article: articleData,
            outline: articleData.outline,
            outlineMetaData: {
              title: articleData.outline.title,
              meta_description: articleData.outline.meta_description,
              slug: articleData.outline.slug
            },
            inputFields: articleData.outline.sections,
            outlineInputData: articleData.outline_input_data,
            inputFieldStaticOutline: articleData.outline_input_data.inputFieldStaticOutline,
            inputFieldStaticArticle: articleData.outline_input_data.inputFieldStaticArticle,
            linkFields: articleData.outline_input_data.linkFields,
          }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: `Error initializing data: ${error}` }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [articleId]);

  const setters: SetArticleState = {
    setInputFieldStaticOutline: (value) => 
      setState(prev => ({ ...prev, inputFieldStaticOutline: value })),
    setInputFieldStaticArticle: (value) =>
      setState(prev => ({ ...prev, inputFieldStaticArticle: value })),
    setLinkFields: (value) =>
      setState(prev => ({ ...prev, linkFields: value })),
    setInputFields: (value) =>
      setState(prev => ({ ...prev, inputFields: value })),
    setOutline: (value) =>
      setState(prev => ({ ...prev, outline: value })),
    setOutlineMetaData: (value) =>
      setState(prev => ({ ...prev, outlineMetaData: value })),
    setPageTitle: (value) =>
      setState(prev => ({ ...prev, pageTitle: value })),
    setLoadingResult: (value) =>
      setState(prev => ({ ...prev, loadingResult: value })),
    setLoadingOutline: (value) =>
      setState(prev => ({ ...prev, loadingOutline: value })),
    setAuthorityLinks: (value) =>
      setState(prev => ({ ...prev, authorityLinks: value })),
    setInternalLinks: (value) =>
      setState(prev => ({ ...prev, internalLinks: value })),
    setLoadingAuthority: (value) =>
      setState(prev => ({ ...prev, loadingAuthority: value })),
    setLoadingInternal: (value) =>
      setState(prev => ({ ...prev, loadingInternal: value })),
    setHistory: (value) =>
      setState(prev => ({ ...prev, history: value })),
    setError: (value) =>
      setState(prev => ({ ...prev, error: value }))
  };

  return { 
    state, 
    setState: setters,
    isLoading
  };
};