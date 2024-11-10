import React, { useEffect, useState } from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import ArticleOutlineForm from './ArticleOutlineForm';
import ArticlesForm from './ArticleForm';
import ArticlesResult from './ArticlesResult';
import { generateArticle, generateOutline } from '../helpers/openaiApi';
import removeMd from 'remove-markdown';
import { useParams } from "react-router-dom";
import { apStyleTitleCase } from 'ap-style-title-case';
const steps = ['Create Outline', 'Create Article', 'Article Result'];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);
import { marked } from "marked";

const defaultOutlineFields = {
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
};

const defaultArticleFields = {
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
};
const stepsCompleted: any = {

}
interface SectionField {
  sectionTitle: string;
  description: string;
  links: { link: string }[];
  headingLevel: 'h2' | 'h3'; // Track heading level for each section
}
interface Article {
  id: number;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
  outline: string;
  outline_input_data: string;
}
export default function ArticleSteps() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(stepsCompleted);
  const [outline, setOutline] = useState<string>('');
  const [toCopy, setToCopy] = useState('');
  const [clients, setClients] = useState([]);
  const [pages, setPages] = useState([]);
  const [inputFields, setInputFields] = useState<SectionField[]>([{ sectionTitle: '', description: '', links: [{ link: '' }], headingLevel: 'h2' }]);
  const [inputFieldStaticOutline, setInputFieldStaticOutline] = useState(defaultOutlineFields);
  const [inputFieldStaticArticle, setInputFieldStaticArticle] = useState(defaultArticleFields);
  const [pageTitle, setPageTitle] = useState('');
  const [response, setResponse] = useState('');
  const [loadingResult, setLoadingResult] = useState(false);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [cookies] = useCookies(['user']);
  const { articleId } = useParams();
  const [error, setError] = useState<string>();
  const [article, setArticle] = useState<Article>();
  const [outlineResult, setOutlineResult] = useState<any>();
  const [outlineResultField, setOutlineResultField] = useState<any>();
  const [authorityLinks, setAuthorityLinks] = useState("");
  const [internalLinks, setInternalLinks] = useState("");
  const [loadingAuthority, setLoadingAuthority] = useState(false);
  const [loadingInternal, setLoadingInternal] = useState(false);

  useEffect(() => { fetchData('clients', setClients); fetchData('pages', setPages); }, []);
 
  useEffect(() => {
    if (articleId) {

      const fetchArticleById = async () => {
        try {
          const { data, error } = await supabase
            .from("history")
            .select("*")
            .eq("id", articleId)
            .single(); // Ensures we only get one record

          if (error) {
            setError(`Error fetching article: ${error.message}`);
          } else {
            // console.log(data);
            setArticle(data);
            setOutlineResultField(JSON.parse(data.outline_input_data))
            setOutlineResult(data.outline)
            setOutline(data.outline);
          }
        } catch (error) {
          setError(`Error fetching article: ${error}`);
        }
      };

      fetchArticleById();
    }
  }, [articleId]);

  useEffect(() => {
    if (outlineResultField && outlineResult) {

      let inputFieldStaticOutline = outlineResultField.inputFieldStaticOutline;
      let inputFieldStaticArticledb = outlineResultField.inputFieldStaticArticle;
      let inputFieldSectiondb = outlineResultField.inputFields;
      console.log(inputFieldStaticArticledb.pageTitle);
      let linkFields = outlineResultField.linkFields;
      setInputFieldStaticOutline(inputFieldStaticOutline);
      parseOutlineResultFillArticleFieldPreload(outlineResult, inputFieldSectiondb);
      console.log(inputFieldSectiondb);
      // parseOutlineResultFillArticleField(outlineResult);
      setLinkFields(linkFields);

      if (linkFields.keywords) {
        let internalKeywords = linkFields.keywords.map((link: any, index: any) => link.value.trim()).join(', ');
        setInputFieldStaticArticle(prev => ({ ...prev, keywords: internalKeywords }));
      }

    }
  }, [article])

  const [linkFields, setLinkFields] = useState({
    keywords: [{ id: 1, value: '' }],
    competitorLinks: [{ id: 1, value: '' }],
    internalLinks: [{ id: 1, value: '' }],
    authorityLinks: [{ id: 1, value: '' }],
  });
  const totalSteps = steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps;

  const handleNext = () => setActiveStep(prev => (isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : prev + 1));
  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleComplete = () => { setCompleted({ ...completed, [activeStep]: true }); handleNext(); };
  const handleReset = () => { setActiveStep(0); setCompleted({}); };

  const fetchData = async (table: string, setter: Function) => {
    try {
      const { data, error } = await supabase.from(table).select('*').order('name', { ascending: true });
      ;
      if (error) throw error;
      setter(data || []);
    } catch (error) {
      console.error(`Failed to fetch ${table}`, error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // let internalLinksArray = linkFields.internalLinks.map((link, index) => link.value.trim()).join(', ');
    let internalKeywords = linkFields.keywords.map((link, index) => link.value.trim()).join(', ');
    // let authorityLinksArray = linkFields.authorityLinks.map((link, index) => link.value.trim()).join(', ');
    let competitorLinksArray = linkFields.competitorLinks.map((link, index) => link.value.trim()).join(", ");

    try {
      setLoadingOutline(true);
      const generatedOutline = await generateOutline(internalKeywords, inputFieldStaticOutline.articleDescription, inputFieldStaticOutline.clientName, inputFieldStaticOutline.pageName, competitorLinksArray);
      // console.log(generatedOutline);
      // return 
      // const result = removeMd(generatedOutline);
      setOutline(generatedOutline);
      parseOutlineResultFillArticleField(generatedOutline);
      setLoadingOutline(false);
      handleComplete();
    } catch (error) {
      setLoadingOutline(true);
      const generatedOutline = await generateOutline(internalKeywords, inputFieldStaticOutline.articleDescription, inputFieldStaticOutline.clientName, inputFieldStaticOutline.pageName, competitorLinksArray);
      // console.log(generatedOutline);
      // return 
      // const result = removeMd(generatedOutline);
      setOutline(generatedOutline);
      parseOutlineResultFillArticleField(generatedOutline);
      setLoadingOutline(false);
      handleComplete();
    }
  };

  const parseOutlineResultFillArticleField = (outline: string) => {
    const parsedOutline = JSON.parse(outline);
    setInputFieldStaticArticle(prev => ({
      ...prev, instruction: parsedOutline.metaDescription ?? inputFieldStaticOutline.articleDescription, pageTitle: parsedOutline.title, keywords: inputFieldStaticOutline.keywords, selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage
    }));
    setPageTitle(parsedOutline.title);
    setInputFields(parsedOutline.sections || []);
  };
  const parseOutlineResultFillArticleFieldPreload = (outline: string, inputFields: any) => {
    const parsedOutline = JSON.parse(outline);
    setInputFieldStaticArticle(prev => ({
      ...prev, instruction: parsedOutline.metaDescription ?? inputFieldStaticOutline.articleDescription, pageTitle: parsedOutline.title, keywords: inputFieldStaticOutline.keywords, selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage
    }));
    setPageTitle(parsedOutline.title);
    setInputFields(inputFields);
  };
  const handleSubmitArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { sections: inputFields, main: inputFieldStaticArticle };
    let prompt = formData.main.articlePrompt.replace("{{client_guidelines}}", formData.main.clientGuideline).replace("{{article_instructions}}", formData.main.instruction).replace("{{keywords}}", formData.main.keywords);
    const articleSections = formData.sections.map((section, index) => {
      const joinedLinks = section.links.map(item => item.link).join(', ');
      return `
      Section ${index + 1}
      Section Title: ${section.headingLevel} ${apStyleTitleCase(section.sectionTitle)}
      Section Details: ${section.description}
      Section Links: ${joinedLinks}
      `
    });
    // console.log(articleSections);
    // return ;
    try {
      // console.log(prompt)
      setLoadingResult(true);
      const data: any = await sendRequest(prompt, JSON.stringify(articleSections));
      let oulineFields = JSON.stringify({ inputFieldStaticOutline, inputFieldStaticArticle, linkFields, inputFields })
      // return
      await createHistory(data, pageTitle, cookies.user.user.email, outline, oulineFields);
      const plainText = data  ;
      console.log(plainText)
      setToCopy(plainText);
      setResponse(data);
      setLoadingResult(false);
      handleComplete();
    } catch (error) {
      console.error(error);
      alert('Error generating article, check all fields and try again');
      setResponse('Error generating article');
      setLoadingResult(false);
    }
  };

  const sendRequest = async (formData: string, sectionData: string) => {
    return await generateArticle(formData, sectionData);
  };

  const createHistory = async (output: string, article_title: string, created_by: string, outline: string, oulineFields: any) => {
    try {
      await supabase.from('history').insert({ created_by, article_output: output, article_title, outline, outline_input_data: oulineFields });
      alert(`${article_title} has been saved.`);
    } catch (error: any) {
      alert(error.message);
    }
  };
const handleAuthorityLinks = async () => {
    setLoadingAuthority(true);
    try {
      const formData = { sections: inputFields, main: inputFieldStaticArticle };
      const articleSections = formData.sections.map((section: { headingLevel: any; sectionTitle: string | undefined; description: any; links: any[]; }, index: number) => {
        return ` ${index + 1}. **${apStyleTitleCase(section.sectionTitle)}**`
      });
      const prompt = `
      ### STEPS
      1. **Understand the Article's Purpose:**  
        Review the information in the "Article Instructions" to understand the overall purpose and context of the article.
      2. **Review the Outline Sections:**  
        Read through each section in the outline to understand how they contribute to the article's structure and objectives.
      3. **Research and Gather References:**  
        Use the Internet to **search for 1–10 online resources** (e.g., articles, studies, surveys) that will strengthen the content in each section of the outline.
      4. **Provide a Standardized Output:**  
        List your recommended resources in a consistent format, including the article's name, URL, and the corresponding outline section.
      ---

      ### GUIDELINES

      1. **Approved Sources:**  
      Only suggest high-quality sources by prioritizing government websites (.gov) and legal statutes first, followed by reputable sources such as scholarly articles, university studies, publications from non-profit organizations, and reputable news outlets (e.g. CNN, New York Times).
      2. **Disallowed Sources:**  
        - **Law Firm Websites:** Avoid references from law firm websites or directories (e.g., Justia.com, FindLaw.com) since our articles are intended for potential clients, and we do not feature competing legal content.
        - **User-Generated Content:** Do not use articles from platforms like LinkedIn, Medium, or other social media sites.
      3. **Select Only the Best Resources:**  
        Aim for the **highest quality over quantity**. It is acceptable to suggest fewer than 10 resources if they represent the best possible references. Prioritize **quality over volume** in your selections.
      ---
      ### INPUT
      #### Article Instructions:
      ${formData.main.instruction}.
      #### Article Outline:
      ${articleSections.join('\n ')}
      ---

      ### OUTPUT FORMAT
      1. **(ARTICLE NAME)**  
        *(ARTICLE URL)*  
        **(SECTION WHERE ARTICLE SHOULD BE ADDED)**
      2. **(ARTICLE NAME)**  
        *(ARTICLE URL)*  
        **(SECTION WHERE ARTICLE SHOULD BE ADDED)**`;

      const perplexityKey = process.env.NEXT_PUBLIC_PERPLEXITY_AI_API_KEY;
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { role: "system", content: "You are a **research assistant** for our Content Writing team. Your task is to **analyze an article outline** and then **provide a list of high-quality references** from the Internet that will enhance the final article's quality. In your output, list the **name of the article**, the **URL**, and specify the **section where the article should be added** as a reference." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          top_p: 0.9,
          search_domain_filter: ["perplexity.ai"],
          return_images: false,
          return_related_questions: false,
          top_k: 0,
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 1
        })
      };
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        const htmlContent = await marked(content, {
          async: true
        });
        console.log(htmlContent);
        setAuthorityLinks(htmlContent);
      } else {
        throw new Error('Unexpected response format from Perplexity API');
      }
    } catch (error) {
      console.error('Error fetching authority links:', error);
      setError('Failed to fetch authority links. Please try again.');
    } finally {
      setLoadingAuthority(false);
    }
  };

  const handleInternalLinks = async () => {
    setLoadingInternal(true);
    try {
      const response = await fetch('/api/perplexity/internal-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: inputFieldStaticArticle.pageTitle,
          keywords: inputFieldStaticArticle.keywords,
          content: inputFieldStaticArticle.instruction
        }),
      });

      const data = await response.json();
      setInternalLinks(data.links);
    } catch (error) {
      console.error('Error fetching internal links:', error);
      setError('Failed to fetch internal links. Please try again.');
    } finally {
      setLoadingInternal(false);
    }
  };
  return (
    <div>
      <Stepper nonLinear activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={() => setActiveStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {allStepsCompleted() ? (
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button onClick={handleReset}>Reset</Button>
        </Box>
      ) : (
        {
          0: <ArticleOutlineForm {...{ handleSubmit, inputFieldStaticOutline, setInputFieldStaticOutline, clients, pages, loadingOutline, linkFields, setLinkFields }} />,
          1: <ArticlesForm 
               {...{ 
                 handleSubmitArticle, 
                 inputFieldStaticArticle, 
                 setInputFieldStaticArticle, 
                 clients, 
                 pages, 
                 inputFields, 
                 setInputFields, 
                 loadingResult,
                 handleAuthorityLinks,
                 handleInternalLinks,
                 authorityLinks,
                 internalLinks,
                 loadingAuthority,
                 loadingInternal
               }} 
             />,
          2: <ArticlesResult {...{ pageTitle, toCopy, response, loadingResult }} />
        }[activeStep]
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button onClick={handleNext} disabled={activeStep === steps.length - 1}>Next</Button>
        {activeStep !== steps.length && (completed[activeStep] ? <Typography variant="caption" sx={{ display: 'inline-block' }}>Step {activeStep + 1} already completed</Typography> : <Button onClick={handleComplete}>Complete Step</Button>)}
      </Box>
    </div>
  );
}
