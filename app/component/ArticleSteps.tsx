import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Card, CardActions, CardContent, Toolbar } from '@mui/material';
import ArticleOutlineForm from './ArticleOutlineForm';
import { createClient } from '@supabase/supabase-js';
import { generateOutline } from '../helpers/openaiApi';
import ArticlesForm from './ArticleForm';
import ArticlesResult from './ArticlesResult';
const steps = ['Create Outline', 'Create Article', 'Article Result'];
const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);
interface PagesList {
  id: number;
  name: string;
}
interface ClientsList {
  id: number;
  name: string;
}
 interface OutlineFields {
  keywords: string;
  articleDescription: string ;
  selectedClient: string ;
  internalLinks: string;
  authorityLinks: string;
  selectedPage: string ;
  clientName: string;
  pageName: string;
  articlePrompt: string;
  clientDetails: string;
  clientGuideline: string;
 }

 interface ArticleFields {
  instruction:string ;
  clientGuideline: string ;
  articleGuideline: string ;
  articlePrompt: string ;
  selectedClient: string ;
  clientName: string ;
  pageName: string ;
  selectedPage: string ;
  keywords: string;
  pageTitle: string;
 }
 interface InputFields {
  title: string;
  details: string;
}
export default function ArticleSteps() {
  const [activeStep, setActiveStep] = React.useState(0);

  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean;
  }>({});

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
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
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };
  const [clientDetails, setClientDetails] = useState(0);
  const [pageDetails, setPageDetails] = useState(0);
  const [pageType, setPageType] = useState('');
  const [outline, setOutline] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = React.useState<ClientsList[]>([]);
  const [pages, setPages] = React.useState<PagesList[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [inputFields, setInputFields] = useState<InputFields[]>([{title: '', details: ''}]);
  const [inputFieldStaticOutline, setInputFieldStaticOutline] = useState<OutlineFields>({ 
    keywords: '',
    articleDescription: '',
    selectedClient: '',
    internalLinks: '',
    authorityLinks: '',
    selectedPage: '',
    clientName: '',
    clientDetails: '',
    pageName: '',
    articlePrompt: '',
    clientGuideline: '',
  });
  const [inputFieldStaticArticle, setInputFieldStaticArticle] = useState<ArticleFields>({ 
    instruction:'',
    articlePrompt: '',
    clientGuideline: '',
    articleGuideline: '',
    selectedClient: '',
    clientName: '',
    pageName: '',
    selectedPage: '',
    keywords: '',
    pageTitle:''
  });

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const internalLinksArray = inputFieldStaticOutline.internalLinks.split(',').map(link => link.trim());
    const authorityLinksArray = inputFieldStaticOutline.authorityLinks.split(',').map(link => link.trim());

    try {
      const generatedOutline = await generateOutline(
        inputFieldStaticOutline.keywords,
        inputFieldStaticOutline.articleDescription,
      `${inputFieldStaticOutline.clientName} - ${inputFieldStaticOutline.clientGuideline}`,
        inputFieldStaticOutline.selectedPage,
        internalLinksArray,
        authorityLinksArray
      );
      handleComplete();
      sessionStorage.setItem('articleOutlineResult', generatedOutline);
      console.log(generatedOutline);
      setOutline(generatedOutline);
    } catch (error) {
      console.error('Error generating outline', error);
      alert('Failed to generate article outline.');
    }

    setLoading(false);
  };
  const getClientGuideline = (event: any) => {
    const { name, value } = event.target;
    setClientDetails(value);
}
const handleInputChangeStaticOutline  = (event: any) => {
  const { name, value } = event.target;
  setInputFieldStaticOutline({
    ...inputFieldStaticOutline,
    [name]: value, 
  });

};
    useEffect(()=>{
      if (clientDetails) {
        const getClients = async () => {
          try {
            const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id',clientDetails)
            .single();
            if (error) throw error;

              setInputFieldStaticOutline({
                ...inputFieldStaticOutline,
                ['selectedClient']: data.id, 
                ['clientName']: data.name, 
                ['clientGuideline']: data.guideline,
            });
            setInputFieldStaticArticle({
              ...inputFieldStaticArticle,
              ['selectedClient']: data.id, 
              ['clientName']: data.name, 
              ['clientGuideline']: data.guideline,
          });
          } catch (error) {
          } finally {
            setLoading(false);
          }
        };
        getClients();
      }
    },[clientDetails])
    useEffect(()=>{
      if (pageDetails) {
        const getGuideline = async () => {
          try {
            const { data, error } = await supabase
              .from('pages')
              .select('*')
              .eq('id',pageDetails)
              .single();
      
            if (error) throw error;
              setInputFieldStaticOutline({
                ...inputFieldStaticOutline,
                ['selectedPage']: data.id,
                ['pageName']: data.name, 
                ['articlePrompt']: data.guideline,
            });            
            setInputFieldStaticArticle({
              ...inputFieldStaticArticle,
              ['selectedPage']: data.id,
              ['pageName']: data.name, 
              ['articlePrompt']: data.guideline,
          });
          } catch (error) {
      
          } finally {
            setLoading(false);
          }
        };
        getGuideline();
      }
    },[pageDetails])
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*');
  
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*');
        if (error) throw error;
        setPages(data || []);
      } catch (error) {
        setError('Failed to fetch pages');
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchClients();
      fetchPages();
    }, []);


const getPageGuideline = (event: any) => {
    const { name, value } = event.target;
    setPageDetails(value);
}

const handleAddFields = () => {
  setInputFields([...inputFields, { title: '', details: '' }]);
};

const handleRemoveFields = (index: number) => {
  const values = [...inputFields];
  values.splice(index, 1);
  setInputFields(values);
};
const handleInputChangeStaticArticle = (event: any) => {
    const { name, value } = event.target;
    setInputFieldStaticArticle({
      ...inputFieldStaticArticle,
      [name]: value, 
    });

  };
  
  const handleInputChange = (index: number, event: any) => {
    const values = [...inputFields];
    values[index] = {
      ...values[index],
      [event.target.name]: event.target.value
    };
    setInputFields(values);
  };

    const handleSubmitArticle = async (event: any) => {
      event.preventDefault();
      let formData = {sections:inputFields, main:inputFieldStaticArticle};
      console.log(formData);
      sessionStorage.setItem('articleResult', JSON.stringify(formData));
      let prompt = formData.main.articlePrompt;
      prompt = prompt.replace("{{client_guidelines}}", formData.main.clientGuideline);
      prompt = prompt.replace("{{article_guidelines}}", formData.main.instruction);
      prompt = prompt.replace("{{article_instructions}}", formData.main.instruction);
      prompt = prompt.replace("{{key_words}}", formData.main.keywords);
      prompt = prompt.replace("{{keywords}}", formData.main.keywords);
      let articleSections = new Array();
      formData.sections.forEach(async (section,index) => {
        let sectionTemoplate = `\n\nSection ${index +1} \nSection Title: ${section.title} \nSection Details: ${section.details} \n`
        articleSections.push(sectionTemoplate);
  
      });
      sessionStorage.setItem('articleResultPrompt', prompt);
      sessionStorage.setItem('articleResultSections', JSON.stringify(articleSections));
      sessionStorage.setItem('pageTitle', JSON.stringify(formData.main.pageTitle));
      handleComplete();

    };
  return (
    <Box component="main"  sx={{ width: '120vh',height: '90vh', flexGrow: 1, p: 3}}>
    <Toolbar />
    <Card sx={{ minWidth: '120vh',height: '80vh',overflowY: 'scroll' }} >
      <CardContent>
        <Stepper nonLinear activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        {allStepsCompleted() ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {
              {
                0: <ArticleOutlineForm 
                handleComplete={handleComplete} 
                handleSubmit = {handleSubmit} 
                inputFieldStaticOutline = {inputFieldStaticOutline} 
                getClientGuideline = {getClientGuideline} 
                clients = {clients} 
                handleInputChangeStaticOutline  = {handleInputChangeStaticOutline } 
                loading = {loading} 
                outline = {outline}/>,
                1: <ArticlesForm 
                handleSubmitArticle = {handleSubmitArticle}
                inputFieldStaticArticle = {inputFieldStaticArticle}
                handleInputChangeStaticArticle = {handleInputChangeStaticArticle}
                getClientGuideline = {getClientGuideline}
                clients = {clients}
                getPageGuideline = {getPageGuideline}
                pages = {pages}
                inputFields = {inputFields}
                handleInputChange = {handleInputChange}
                handleAddFields = {handleAddFields}
                handleRemoveFields = {handleRemoveFields}                
                />,
                2: <ArticlesResult />
              }[activeStep]
            } 
          </React.Fragment>
        )}
      </div>
        </CardContent>
        <CardActions>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext} sx={{ mr: 1 }}>
                Next
              </Button>
              {activeStep !== steps.length &&
                (completed[activeStep] ? (
                  <Typography variant="caption" sx={{ display: 'inline-block' }}>
                    Step {activeStep + 1} already completed
                  </Typography>
                ) : (
                  <Button onClick={handleComplete}>
                    {completedSteps() === totalSteps() - 1
                      ? 'Finish'
                      : 'Complete Step'}
                  </Button>
                ))}
            </Box>
    </CardActions>
    </Card>
    </Box>
  );
}
