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
import { useParams } from "react-router-dom";

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

}
interface SectionField {
  sectionTitle: string;
  description: string;
  links: { link: string }[];
  headingLevel: 'h1' | 'h2'; // Track heading level for each section
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
  const [inputFields, setInputFields] = useState<SectionField[]>([{ sectionTitle: '', description: '', links: [{link: ''}],headingLevel: 'h2'  }]);
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

    useEffect(() => {
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
            console.log(data);
            setArticle(data);
            setOutlineResultField(JSON.parse(data.outline_input_data))
            setOutlineResult(data.outline)
          }
        } catch (error) {
          setError(`Error fetching article: ${error}`);
        }
      };
      
      fetchArticleById();
    }, [articleId]);

    useEffect(()=>{
      if(outlineResultField && outlineResult){
        let inputFieldStaticOutline = outlineResultField.inputFieldStaticOutline;
        let linkFields = outlineResultField.linkFields;
        console.log(inputFieldStaticOutline,linkFields)
        setInputFieldStaticOutline(inputFieldStaticOutline);
        setLinkFields(linkFields);
        parseOutlineResultFillArticleField(outlineResult);
      }
    },[article])

  // Define initial state with each field having an array of links
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
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      setter(data || []);
    } catch (error) {
      console.error(`Failed to fetch ${table}`, error);
    }
  };
  
  useEffect(() => { fetchData('clients', setClients); fetchData('pages', setPages); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let internalLinksArray = linkFields.internalLinks.map((link, index) => link.value.trim()).join(', ');
    let internalKeywords = linkFields.keywords.map((link, index) => link.value.trim()).join(', ');
    let authorityLinksArray = linkFields.authorityLinks.map((link, index) => link.value.trim()).join(', ');
    let competitorLinksArray = linkFields.competitorLinks.map((link, index) => link.value.trim()).join(", ");
    try {
      setLoadingOutline(true);
      const generatedOutline = await generateOutline(internalKeywords, inputFieldStaticOutline.articleDescription, inputFieldStaticOutline.clientName, inputFieldStaticOutline.pageName, internalLinksArray, authorityLinksArray, competitorLinksArray);
      // console.log(generatedOutline);
      // return 
      // const result = removeMd(generatedOutline);
      setOutline(generatedOutline);
      parseOutlineResultFillArticleField(generatedOutline);
      setLoadingOutline(false);
      handleComplete();
    } catch (error) {
      setLoadingOutline(true);
      const generatedOutline = await generateOutline(internalKeywords, inputFieldStaticOutline.articleDescription, inputFieldStaticOutline.clientName, inputFieldStaticOutline.pageName, internalLinksArray, authorityLinksArray, competitorLinksArray);
      // console.log(generatedOutline);
      // return 
      const result = removeMd(generatedOutline);
      setOutline(result);
      parseOutlineResultFillArticleField(result);
      setLoadingOutline(false);
      handleComplete();
    }
  };

  const parseOutlineResultFillArticleField = (outline: string) => {
    const parsedOutline = JSON.parse(outline);
    setInputFieldStaticArticle(prev => ({ ...prev, instruction: parsedOutline.metaDescription ?? inputFieldStaticOutline.articleDescription, pageTitle: parsedOutline.title, keywords: inputFieldStaticOutline.keywords,selectedClient: inputFieldStaticOutline.selectedClient,
      selectedPage: inputFieldStaticOutline.selectedPage }));
    setPageTitle(parsedOutline.title);
    setInputFields(parsedOutline.sections || []);
  };

  const handleSubmitArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { sections: inputFields, main: inputFieldStaticArticle };
    let prompt = formData.main.articlePrompt.replace("{{client_guidelines}}", formData.main.clientGuideline).replace("{{article_guidelines}}", formData.main.instruction).replace("{{key_words}}", formData.main.keywords);
    const articleSections = formData.sections.map((section, index) => {
    return `
    Section ${index + 1}
    Section Title: ${section.headingLevel} ${section.sectionTitle}
    Section Details: ${section.description}
    Section Links: ${section.links.join(', ')}
    `
    });
    try {
      // console.log(prompt)
      setLoadingResult(true);
      const data : any = await sendRequest(prompt, JSON.stringify(articleSections));
      // return
      let oulineFields = JSON.stringify({inputFieldStaticOutline,linkFields})
      await createHistory(data, pageTitle, cookies.user.user.email,outline,oulineFields);
      const plainText = removeMd(data);
      console.log(plainText)
      setToCopy(plainText);
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
    return await generateArticle(formData,sectionData);
  };

  const createHistory = async (output: string, article_title: string, created_by: string,outline: string,oulineFields: any) => {
    try {
      await supabase.from('history').insert({ created_by, article_output: output, article_title, outline,outline_input_data:oulineFields });
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
              0: <ArticleOutlineForm {...{ handleSubmit, inputFieldStaticOutline, setInputFieldStaticOutline, clients, pages,loadingOutline,linkFields, setLinkFields }} />,
              1: <ArticlesForm {...{ handleSubmitArticle, inputFieldStaticArticle, setInputFieldStaticArticle, clients, pages, inputFields, setInputFields, loadingResult }} />,
              2: <ArticlesResult {...{ pageTitle, toCopy,response, loadingResult }} />
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
