import React, { useEffect, useState } from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography, Card, CardActions, CardContent, Toolbar } from '@mui/material';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import ArticleOutlineForm from './ArticleOutlineForm';
import ArticlesForm from './ArticleForm';
import ArticlesResult from './ArticlesResult';
import { generateArticle, generateOutline } from '../helpers/openaiApi';
import removeMd from 'remove-markdown';

const steps = ['Create Outline', 'Create Article', 'Article Result'];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);

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
const stepsCompleted : any = {
  0: false,
  1: false,
  2: false
}
export default function ArticleSteps() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(stepsCompleted);
  const [outline, setOutline] = useState<string>();
  const [clients, setClients] = useState([]);
  const [pages, setPages] = useState([]);
  const [inputFields, setInputFields] = useState([{ title: '', description: '' }]);
  const [inputFieldStaticOutline, setInputFieldStaticOutline] = useState(defaultOutlineFields);
  const [inputFieldStaticArticle, setInputFieldStaticArticle] = useState(defaultArticleFields);
  const [pageTitle, setPageTitle] = useState('');
  const [response, setResponse] = useState('');
  const [loadingResult, setLoadingResult] = useState(false);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [cookies] = useCookies(['user']);
  
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
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      setter(data || []);
    } catch (error) {
      console.error(`Failed to fetch ${table}`, error);
    }
  };
  const handleAddFields = () => {
    setInputFields([...inputFields, { title: '', description: '' }]);
  };
  
  const handleRemoveFields = (index: number) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputFields(prevFields =>
      prevFields.map((field, i) =>
        i === index ? { ...field, [name]: value } : field
      )
    );
  };
  useEffect(() => { fetchData('clients', setClients); fetchData('pages', setPages); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingOutline(true);
      const internalLinksArray = inputFieldStaticOutline.internalLinks.split(',').map(link => link.trim());
      const authorityLinksArray = inputFieldStaticOutline.authorityLinks.split(',').map(link => link.trim());
      const competitorLinksArray = inputFieldStaticOutline.competitorLinks.split(',').map(link => link.trim());
      const generatedOutline = await generateOutline(inputFieldStaticOutline.keywords, inputFieldStaticOutline.articleDescription, inputFieldStaticOutline.clientName, inputFieldStaticOutline.pageName, internalLinksArray, authorityLinksArray, competitorLinksArray);
      handleComplete();
      const result = removeMd(generatedOutline).slice(0, -1);
      setOutline(result);
      parseOutlineResultFillArticleField(result);
      setLoadingOutline(false);
    } catch (error) {
      console.error('Error generating outline', error);
      alert('Failed to generate article outline.');
      setLoadingOutline(false);
    }
  };

  const parseOutlineResultFillArticleField = (outline: string) => {
    const parsedOutline = JSON.parse(outline)[0];
    setInputFieldStaticArticle(prev => ({ ...prev, instruction: parsedOutline.meta_description ?? inputFieldStaticOutline.articleDescription, pageTitle: parsedOutline.title, keywords: inputFieldStaticOutline.keywords,selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage }));
    setPageTitle(parsedOutline.title);
    setInputFields(parsedOutline.sections || []);
  };

  const handleSubmitArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { sections: inputFields, main: inputFieldStaticArticle };
    let prompt = formData.main.articlePrompt.replace("{{client_guidelines}}", formData.main.clientGuideline).replace("{{article_guidelines}}", formData.main.instruction).replace("{{key_words}}", formData.main.keywords);

    const articleSections = formData.sections.map((section, index) => `\n\nSection ${index + 1} \nSection Title: ${section.title} \nSection Details: ${section.description} \n`);
    
    try {
      setLoadingResult(true);
      const data : any = await sendRequest(prompt, JSON.stringify(articleSections));
      await createHistory(data, pageTitle, cookies.user.user.email);
      const plainText = removeMd(data);
      setResponse(data);
      setLoadingResult(false);
    } catch (error) {
      console.error(error);
      setResponse('Error generating article');
      setLoadingResult(false);
    }
    handleComplete();
  };

  const sendRequest = async (formData: string, sectionData: string) => {
    const articlePrompt = [{ role: "user", content: formData }, ...JSON.parse(sectionData).map((section: string) => ({ role: "user", content: section })), { role: "user", content: "merge all into one article" }];
    return await generateArticle(articlePrompt);
  };

  const createHistory = async (output: string, article_title: string, created_by: string) => {
    try {
      await supabase.from('history').insert({ created_by, article_output: output, article_title });
      alert(`${article_title} has been saved.`);
    } catch (error : any) {
      alert(error.message);
    }
  };

  return (
    <Box component="main" sx={{ width: '120vh', height: '90vh', flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: '120vh', height: '80vh', overflowY: 'scroll' }}>
        <CardContent>
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
              0: <ArticleOutlineForm {...{ handleSubmit, inputFieldStaticOutline, setInputFieldStaticOutline, clients, pages,loadingOutline }} />,
              1: <ArticlesForm {...{ handleSubmitArticle, inputFieldStaticArticle, setInputFieldStaticArticle, clients, pages, inputFields, setInputFields, loadingResult,handleAddFields,
                handleRemoveFields,
                handleInputChange }} />,
              2: <ArticlesResult {...{ pageTitle, response, loadingResult }} />
            }[activeStep]
          )}
        </CardContent>
        <CardActions>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext} disabled={activeStep === steps.length - 1}>Next</Button>
            {activeStep !== steps.length && (completed[activeStep] ? <Typography variant="caption" sx={{ display: 'inline-block' }}>Step {activeStep + 1} already completed</Typography> : <Button onClick={handleComplete}>Complete Step</Button>)}
          </Box>
        </CardActions>
      </Card>
    </Box>
  );
}
