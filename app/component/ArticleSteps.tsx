"use client"

import React, { useEffect, useState } from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useParams } from 'react-router-dom';
import ArticleOutlineForm from './ArticleOutlineForm';
import ArticlesForm from './ArticleForm';
import ArticlesResult from './ArticlesResult';
import { generateArticle, generateOutline, generateAuthorityLink, generateInternalLink } from '../helpers/openaiApi';
import { apStyleTitleCase } from 'ap-style-title-case';
import { marked } from "marked";

const steps = ['Create Outline', 'Create Article', 'Article Result'];

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

interface SectionField {
  sectionTitle: string;
  description: string;
  links: { link: string }[];
  headingLevel: 'h2' | 'h3';
}

interface Article {
  _id: string;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
  outline: any;
  outline_input_data: string;
}

export default function ArticleSteps( { constellationMode }: any ) {
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [outline, setOutline] = useState<any>('');
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
  const [error, setError] = useState<string>();
  const [article, setArticle] = useState<Article>();
  const [outlineResult, setOutlineResult] = useState<any>();
  const [outlineResultField, setOutlineResultField] = useState<any>();
  const [authorityLinks, setAuthorityLinks] = useState("");
  const [internalLinks, setInternalLinks] = useState("");
  const [loadingAuthority, setLoadingAuthority] = useState(false);
  const [loadingInternal, setLoadingInternal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [linkFields, setLinkFields] = useState({
    keywords: [{ id: 1, value: '' }],
    competitorLinks: [{ id: 1, value: '' }],
    internalLinks: [{ id: 1, value: '' }],
    authorityLinks: [{ id: 1, value: '' }],
  });

  useEffect(() => {
    fetchData('clients', setClients);
    fetchData('pages', setPages);
  }, []);

  useEffect(() => {
    if (articleId) {
      fetchArticleById(articleId);
    }
  }, [articleId]);
  useEffect(() => {
    if (outlineResultField && outlineResult) {
      let inputFieldStaticOutline = outlineResultField.inputFieldStaticOutline;
      let linkFields = outlineResultField.linkFields;
      setInputFieldStaticOutline(inputFieldStaticOutline);
      parseOutlineResultFillArticleFieldPreload(outlineResult, outlineResultField.inputFields);
      setLinkFields(linkFields);

      if (linkFields.keywords) {
        let internalKeywords = linkFields.keywords.map((link: any) => link.value.trim()).join(', ');
        setInputFieldStaticArticle(prev => ({ ...prev, keywords: internalKeywords }));
      }
    }
    
  }, [article]);

  const fetchData = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}`, error);
    }
  };

  const fetchArticleById = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setArticle(data);
      setOutlineResultField(data.outline_input_data);
      setOutlineResult(data.outline);
      setOutline(data.outline);
    } catch (error) {
      console.log(`Failed to fetch article by ID: ${id}`, error);
      setError(`Error fetching article: ${error}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let internalKeywords = linkFields.keywords.map((link) => link.value.trim()).join(', ');
    let competitorLinksArray = linkFields.competitorLinks.map((link) => link.value.trim()).join(", ");

    try {
      setLoadingOutline(true);
      const generatedOutline = await generateOutline(
        internalKeywords, 
        inputFieldStaticOutline.articleDescription, 
        inputFieldStaticOutline.clientName, 
        inputFieldStaticOutline.pageName, 
        competitorLinksArray,
        constellationMode ? 'constellation' : 'client'
      );
      setOutline(generatedOutline);
      parseOutlineResultFillArticleField(generatedOutline);
      setLoadingOutline(false);
      handleComplete();
    } catch (error) {
      console.error('Error generating outline:', error);
      setError('Failed to generate outline. Please try again.');
      setLoadingOutline(false);
    }
  };

  const handleParseJson = (text: string) => {
    try {
      const jsonMatch = text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        return JSON.parse(jsonString);
      } else {
        console.error("No JSON found in the input string.");
      }
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  };

  const parseOutlineResultFillArticleField = (outline: string) => {
    const parsedOutline = handleParseJson(outline);
    
    setInputFieldStaticArticle(prev => ({
      ...prev,
      instruction: parsedOutline.metaDescription ?? inputFieldStaticOutline.articleDescription,
      pageTitle: parsedOutline.title,
      keywords: inputFieldStaticOutline.keywords,
      selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage
    }));
    setPageTitle(parsedOutline.title);
    setInputFields(parsedOutline.sections || []);
  };

  const parseOutlineResultFillArticleFieldPreload = (outline: any, inputFields: any) => {
    setInputFieldStaticArticle(prev => ({
      ...prev,
      instruction: outline.metaDescription ?? inputFieldStaticOutline.articleDescription,
      pageTitle: outline.title,
      keywords: inputFieldStaticOutline.keywords,
      selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage
    }));
    setPageTitle(outline.title);
    setInputFields(inputFields);
  };

  const handleSubmitArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { sections: inputFields, main: inputFieldStaticArticle };
    let prompt = formData.main.articlePrompt
      .replace("{{client_guidelines}}", formData.main.clientGuideline)
      .replace("{{article_instructions}}", formData.main.instruction)
      .replace("{{keywords}}", formData.main.keywords);
    const articleSections = formData.sections.map((section, index) => {
      const joinedLinks = section.links.map(item => item.link).join(', ');
      return `
      Section ${index + 1}
      Section Title: ${section.headingLevel} ${apStyleTitleCase(section.sectionTitle)}
      Section Details: ${section.description}
      Section Links: ${joinedLinks}
      `;
    });

    try {
      setLoadingResult(true);
      const data: any = await generateArticle(prompt, JSON.stringify(articleSections),
      constellationMode ? 'constellation' : 'client'
    );
      let outlineFields ={ inputFieldStaticOutline, inputFieldStaticArticle, linkFields, inputFields };

      let outlineToSave = {
        title: outline.title,
        meta_description: outline.metaDescription,
        slug: outline.slug,
        sections: inputFields,
        mode: constellationMode
      };

      const historyData = await createHistory(data, pageTitle, 'user@example.com', outlineToSave, outlineFields);

      console.log('History data:', historyData);
      setHistory(historyData);
      setToCopy(data);
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

  const createHistory = async (output: string, article_title: string, created_by: string, outline: object, outlineFields: object) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          created_by,
          article_output: output,
          article_title,
          outline,
          outline_input_data: outlineFields
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save article history');
      }
      alert(`${article_title} has been saved.`);
      
      return await response.json();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAuthorityLinks = async () => {
    setLoadingAuthority(true);
    try {
      const formData = { sections: inputFields, main: inputFieldStaticArticle };
      const articleSections = formData.sections.map((section, index) => {
        return ` ${index + 1}. **${apStyleTitleCase(section.sectionTitle)}**`;
      });
      const data = await generateAuthorityLink(
        formData, 
        articleSections,
        constellationMode ? 'constellation' : 'client'
      );
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        const htmlContent = await marked(content);
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
      const formData = { sections: inputFields, main: inputFieldStaticArticle };
      const articleSections = formData.sections.map((section, index) => {
        return ` ${index + 1}. **${apStyleTitleCase(section.sectionTitle)}**`;
      });
      const data = await generateInternalLink(formData, articleSections);
      if (data.message) {
        const content = data.message.content;
        const htmlContent = await marked(content);
        setInternalLinks(htmlContent);
      } else {
        throw new Error('Unexpected response format from Pinecone API');
      }
    } catch (error) {
      console.error('Error fetching internal links:', error);
      setError('Failed to fetch internal links. Please try again.');
    } finally {
      setLoadingInternal(false);
    }
  };

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  return (
    <div>
      <Stepper nonLinear activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
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
        <>
        {constellationMode && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white', 
          borderRadius: '12px', 
          padding: '4px 12px' 
              }}
            >
              Constellation Mode
            </Typography>
          </Box>
        )}
          {activeStep === 0 && (
            <ArticleOutlineForm
              handleSubmit={handleSubmit}
              inputFieldStaticOutline={inputFieldStaticOutline}
              setInputFieldStaticOutline={setInputFieldStaticOutline}
              clients={clients}
              pages={pages}
              loadingOutline={loadingOutline}
              linkFields={linkFields}
              setLinkFields={setLinkFields}
            />
          )}
          {activeStep === 1 && (
            <ArticlesForm
              handleSubmitArticle={handleSubmitArticle}
              inputFieldStaticArticle={inputFieldStaticArticle}
              setInputFieldStaticArticle={setInputFieldStaticArticle}
              clients={clients}
              pages={pages}
              inputFields={inputFields}
              setInputFields={setInputFields}
              loadingResult={loadingResult}
              handleAuthorityLinks={handleAuthorityLinks}
              handleInternalLinks={handleInternalLinks}
              authorityLinks={authorityLinks}
              internalLinks={internalLinks}
              loadingAuthority={loadingAuthority}
              loadingInternal={loadingInternal}
            />
          )}
          {activeStep === 2 && (
            <ArticlesResult
              history={history}
            />
          )}
        </>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button onClick={handleNext} disabled={activeStep === steps.length - 1}>
          Next
        </Button>
        {activeStep !== steps.length &&
          (completed[activeStep] ? (
            <Typography variant="caption" sx={{ display: 'inline-block' }}>
              Step {activeStep + 1} already completed
            </Typography>
          ) : (
            <Button onClick={handleComplete}>
              {completedSteps() === totalSteps() - 1 ? 'Finish' : 'Complete Step'}
            </Button>
          ))}
      </Box>
    </div>
  );
}