"use client"

import React from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useArticleState } from '../hooks/useArticleState';
import { useArticleActions } from '../hooks/useArticleActions';
import { useStepperControl } from '../hooks/useStepperControl';
import ArticleOutlineForm from './ArticleOutlineForm';
import ArticlesForm from './ArticleForm';
import ArticlesResult from './ArticlesResult';
import { useParams } from 'react-router-dom';
const steps = ['Create Outline', 'Create Article', 'Article Result'];
import { useCookies } from 'react-cookie';

interface ArticleStepsProps {
  constellationMode?: boolean;
  params?: { id?: string };
}

export default function ArticleSteps({ constellationMode }: ArticleStepsProps) {
  const params = useParams();
  const articleId = params.articleId as string;
  const {
    state,
    setState,
    isLoading
  } = useArticleState(articleId);
  const [cookies] = useCookies(['user']);

  const {
    handleSubmit,
    handleSubmitArticle,
    handleAuthorityLinks,
    handleInternalLinks,
    handleGenerateComparison
  } = useArticleActions(state, setState,cookies.user.user.email, constellationMode);

  const {
    activeStep,
    completed,
    handleNext,
    handleBack,
    handleStep,
    handleComplete,
    handleReset,
    setCompleted
  } = useStepperControl(steps.length);

  const handleStepComplete = (step: number) => {
    setCompleted(prev => ({...prev, [step]: true}));
    handleNext();
  };

  const onOutlineComplete = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      handleStepComplete(0);
    }
  };

  const onArticleComplete = async (e: React.FormEvent) => {
    const success = await handleSubmitArticle(e);
    if (success) {
      handleStepComplete(1);
    }
  };
  return (
    <div>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {state.error && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" onClose={() => setState.setError('')}>
                {state.error}
              </Alert>
            </Box>
          )}

          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={completed[index]}>
                <StepButton color="inherit" onClick={handleStep(index)}>
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>

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
                constellationMode={constellationMode}
                handleSubmit={onOutlineComplete}
                inputFieldStaticOutline={state.inputFieldStaticOutline}
                setInputFieldStaticOutline={setState.setInputFieldStaticOutline}
                clients={state.clients}
                loadingOutline={state.loadingOutline}
                loadingComparison={state.loadingComparison}
                linkFields={state.linkFields}
                setLinkFields={setState.setLinkFields}
                handleGenerateComparison={handleGenerateComparison}
              />
            )}

            {activeStep === 1 && (
              <ArticlesForm
                constellationMode={constellationMode}
                handleSubmitArticle={onArticleComplete}
                inputFieldStaticArticle={state.inputFieldStaticArticle}
                setInputFieldStaticArticle={setState.setInputFieldStaticArticle}
                clients={state.clients}
                pages={state.pages}
                inputFields={state.inputFields}
                setInputFields={setState.setInputFields}
                loadingResult={state.loadingResult}
                handleAuthorityLinks={handleAuthorityLinks}
                handleInternalLinks={handleInternalLinks}
                authorityLinks={state.authorityLinks}
                internalLinks={state.internalLinks}
                loadingAuthority={state.loadingAuthority}
                loadingInternal={state.loadingInternal}
              />
            )}

            {activeStep === 2 && (
              <ArticlesResult
              article={state.article}
              setArticle={setState.setArticle}
              />
            )}
          </>

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
            <Button 
              onClick={handleNext} 
              disabled={activeStep === steps.length - 1}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </div>
  );
}