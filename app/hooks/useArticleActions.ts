import { generateArticle, generateOutline, generateAuthorityLink, generateInternalLink, generateComparison } from '../helpers/openaiApi';
import { ArticleState, SetArticleState } from '../types/article';
import { handleParseJson } from '../services/article';
import { marked } from 'marked';
import { generateAndSaveArticle } from '../services/article';
import { fetchArticleById } from '../types';

export const useArticleActions = (
  state: ArticleState,
  setState: SetArticleState,
  email: string,
  constellationMode?: boolean
) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const internalKeywords = state.linkFields.keywords.map(keyword => keyword.value).join(", ");
    const competitorLinksArray = state.linkFields.competitorLinks.map(link => link.value.trim()).join(", ");

    try {
      setState.setLoadingOutline(true);
      const generatedOutline = await generateOutline(
        internalKeywords,
        state.inputFieldStaticOutline.articleDescription,
        state.inputFieldStaticOutline.clientName,
        state.inputFieldStaticOutline.pageName,
        competitorLinksArray,
        constellationMode ? 'constellation' : 'client'
      );

      const parsedOutline = handleParseJson(generatedOutline);
      if (!parsedOutline) throw new Error('Failed to parse outline');

      setState.setOutline(generatedOutline);
      setState.setOutlineMetaData({
        title: parsedOutline.title,
        meta_description: parsedOutline.metaDescription,
        slug: parsedOutline.slug
      });
      setState.setInputFieldStaticArticle({
        selectedClient: state.inputFieldStaticOutline.selectedClient,
        selectedPage: state.inputFieldStaticOutline.selectedPage,
        pageTitle: parsedOutline.title,
        instruction: state.inputFieldStaticOutline.articleDescription,
        keywords: internalKeywords
      });
      setState.setInputFields(parsedOutline.sections || []);
      setState.setPageTitle(parsedOutline.title);
      
      return true;
    } catch (error: any) {
      const message = error.message.includes('overloaded') 
        ? error.message 
        : `Failed to generate outline: ${error}`;
      setState.setError(message);
      return false;
    } finally {
      setState.setLoadingOutline(false);
    }
  };

  const handleSubmitArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setState.setLoadingResult(true);
      const { articleData, historyData } = await generateAndSaveArticle(
        state,
        email,
        constellationMode
      );
      const fetchedArticle = await fetchArticleById(historyData.id);
      setState.setArticle(fetchedArticle);
      setState.setHistory(historyData);
      return true;
    } catch (error: any) {
      const message = error.message.includes('overloaded') 
        ? error.message 
        : `Failed to generate article: ${error}`;
        console.log(error);
      setState.setError(message);
      return false;
    } finally {
      setState.setLoadingResult(false);
    }
  };

  const handleAuthorityLinks = async () => {
    setState.setLoadingAuthority(true);
    try {
      const formData = { sections: state.inputFields, main: state.inputFieldStaticArticle };
      const articleSections = state.inputFields.map((section, index) => 
        ` ${index + 1}. **${section.sectionTitle}**`
      ).join('\n');

      const data = await generateAuthorityLink(
        formData, 
        articleSections,
        constellationMode ? 'constellation' : 'client'
      );

      if (data.choices?.[0]?.message?.content) {
        const htmlContent = await marked(data.choices[0].message.content);
        setState.setAuthorityLinks(htmlContent);
      } else {
        throw new Error('Unexpected response format from API');
      }
    } catch (error) {
      setState.setError(`Failed to fetch authority links: ${error}`);
    } finally {
      setState.setLoadingAuthority(false);
    }
  };

  const handleInternalLinks = async () => {
    setState.setLoadingInternal(true);
    try {
      const formData = { sections: state.inputFields, main: state.inputFieldStaticArticle };
      const articleSections = state.inputFields.map((section, index) => 
        ` ${index + 1}. **${section.sectionTitle}**`
      ).join('\n');

      const data = await generateInternalLink(formData, articleSections);
      if (data.message?.content) {
        const htmlContent = await marked(data.message.content);
        setState.setInternalLinks(htmlContent);
      } else {
        throw new Error('Unexpected response format from API');
      }
    } catch (error) {
      setState.setError(`Failed to fetch internal links: ${error}`);
    } finally {
      setState.setLoadingInternal(false);
    }
  };

  const handleGenerateComparison = async () => {
    try {
      setState.setLoadingComparison(true);
      
      
      
      const competitorLinks = state.linkFields.competitorLinks
        .map((link, index) => `### **Competitor URL ${index + 1}**: ${link.value.trim()} \n`)
        .filter(link => link)
        .join('\n');
        let prompt = `### **Client**: ${state.inputFieldStaticOutline.clientName}\n### **Page Type**: ${state.inputFieldStaticOutline.pageGuideline}\n### **Keyword**: ${state.linkFields.keywords.map(keyword => keyword.value).join(", ")}\n${competitorLinks}  `;
        // console.log(prompt);
        // return prompt;
      if (competitorLinks.length === 0) {
        throw new Error('Please add at least one competitor link');
      }

      const comparison = await generateComparison(prompt);
      setState.setInputFieldStaticOutline({
        ...state.inputFieldStaticOutline,
        articleDescription: comparison
      });
    } catch (error: any) {
      setState.setError(`Failed to generate comparison: ${error.message}`);
    } finally {
      setState.setLoadingComparison(false);
    }
  };

  return {
    handleSubmit,
    handleSubmitArticle,
    handleAuthorityLinks,
    handleInternalLinks,
    handleGenerateComparison
  };
};