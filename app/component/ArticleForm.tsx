"use client"

import React, { useState, useEffect } from 'react';
import {
  Button,
  Divider,
  Grid,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Paper,
  Typography,
  Box,
  styled,
  Tabs,
  Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Link as LinkIcon,
  Refresh,
} from '@mui/icons-material';
import Sections from './Sections';
import { apStyleTitleCase } from 'ap-style-title-case';
import "../App.css";

interface EditorToolProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const EditorToolsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const EditorTool = ({ icon, label, onClick, loading }: EditorToolProps) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    disabled={loading}
    sx={{
      flex: 1,
      justifyContent: 'center',
      color: 'text.primary',
      '&:hover': {
        backgroundColor: 'action.hover',
      }
    }}
  >
    {loading ? 'Processing...' : label}
  </Button>
);

const ProgressIndicator = ({ open }: { open: boolean }) => (
  <Dialog open={open} disableEscapeKeyDown>
    <DialogTitle>Generating Article</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Please wait while we generate your article.
      </DialogContentText>
      <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
    </DialogContent>
  </Dialog>
);

const LinksContainer = styled(Box)(({ theme }) => ({
  maxHeight: '75vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  '& h3': {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  '& ol, & ul': {
    paddingLeft: theme.spacing(2),
    marginTop: 0,
    marginLeft: '1rem',
    marginBottom: theme.spacing(1),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
    wordBreak: 'break-word',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    wordBreak: 'break-word',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default function ArticlesForm({
  handleSubmitArticle,
  inputFieldStaticArticle,
  setInputFields,
  setInputFieldStaticArticle,
  clients,
  pages,
  inputFields,
  loadingResult,
  handleAddFields,
  handleRemoveFields,
  handleInputChange,
  handleAddFieldLink,
  handleRemoveFieldLink,
  handleAuthorityLinks,
  handleInternalLinks,
  authorityLinks,
  internalLinks,
  loadingAuthority,
  loadingInternal
}: any) {
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showLinks, setShowLinks] = useState(true);


  const getNameById = (list: any, id: any) => {
    const entry = list.find((item: { _id: any }) => item._id === id);
    return entry?.name;
  };
  const renderLinksWithTargetBlank = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener noreferrer');
    }
    return doc.body.innerHTML;
  };
  const getGuidelineById = (list: any, id: any) => {
    const entry = list.find((item: { _id: any }) => item._id === id);
    return entry?.guideline;
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAuthorityLinksClick = () => {
    handleAuthorityLinks();
    setActiveTab(0);
    setShowLinks(true);
  };

  const handleInternalLinksClick = () => {
    handleInternalLinks();
    setActiveTab(1);
    setShowLinks(true);
  };
  useEffect(() => {
    if (inputFieldStaticArticle.selectedClient && inputFieldStaticArticle.selectedPage) {
      setInputFieldStaticArticle({
        ...inputFieldStaticArticle,
        clientName: getNameById(clients, inputFieldStaticArticle.selectedClient),
        clientGuideline: getGuidelineById(clients, inputFieldStaticArticle.selectedClient),
        pageName: getNameById(pages, inputFieldStaticArticle.selectedPage),
        articlePrompt: getGuidelineById(pages, inputFieldStaticArticle.selectedPage)
      });
    }
  }, [inputFieldStaticArticle.selectedClient, inputFieldStaticArticle.selectedPage]);

  useEffect(() => {
    setShowProgress(loadingResult);
  }, [loadingResult]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmitArticle(event);
  };

  return (
    <div>
      <h1>Create Article</h1>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <form onSubmit={handleSubmit}>
            <Accordion sx={{ border: "solid", borderWidth: "1px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Article Details
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="pageTitle"
                      label="Page Title"
                      name="pageTitle"
                      value={apStyleTitleCase(inputFieldStaticArticle.pageTitle)}
                      variant="outlined"
                      onChange={(event) => setInputFieldStaticArticle({ ...inputFieldStaticArticle, [event.target.name]: event.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="clientLabel">Select Client</InputLabel>
                      <Select
                        labelId="clientLabel"
                        id="selectedClient"
                        name="selectedClient"
                        value={inputFieldStaticArticle.selectedClient}
                        label="client"
                        required
                        onChange={(event) => setInputFieldStaticArticle({
                          ...inputFieldStaticArticle,
                          [event.target.name]: event.target.value,
                          clientName: getNameById(clients, event.target.value),
                          clientGuideline: getGuidelineById(clients, event.target.value)
                        })}
                      >
                        {clients.map((client: any) => (<MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="pageLabel">Page Template</InputLabel>
                      <Select
                        name="selectedPage"
                        labelId="pageLabel"
                        id="page"
                        required
                        value={inputFieldStaticArticle.selectedPage}
                        label="page"
                        onChange={(event) => setInputFieldStaticArticle({
                          ...inputFieldStaticArticle,
                          [event.target.name]: event.target.value,
                          pageName: getNameById(pages, event.target.value),
                          articlePrompt: getGuidelineById(pages, event.target.value)
                        })}
                      >
                        {pages.map((page: any) => (<MenuItem key={page._id} value={page._id}>{page.name}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} hidden>
                    <TextField
                      name="clientGuideline"
                      id="clientGuideline"
                      label="Client Guidelines"
                      value={inputFieldStaticArticle.clientGuideline}
                      onChange={(event) => setInputFieldStaticArticle({ ...inputFieldStaticArticle, [event.target.name]: event.target.value })}
                      multiline
                      fullWidth
                      rows={5}
                    />
                  </Grid>
                  <Grid item xs={12} hidden>
                    <TextField
                      id="articleGuideline"
                      label="Article Guidelines"
                      name="articleGuideline"
                      value={inputFieldStaticArticle.articleGuideline}
                      onChange={(event) => setInputFieldStaticArticle({ ...inputFieldStaticArticle, [event.target.name]: event.target.value })}
                      multiline
                      fullWidth
                      rows={5}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="instruction"
                      label="Article Instructions"
                      variant="outlined"
                      multiline
                      fullWidth
                      rows={5}
                      value={inputFieldStaticArticle.instruction}
                      onChange={(event) => setInputFieldStaticArticle({
                        ...inputFieldStaticArticle,
                        [event.target.name]: event.target.value,
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="keywords"
                      label="Keywords"
                      name="keywords"
                      value={inputFieldStaticArticle.keywords}
                      variant="outlined"
                      onChange={(event) => setInputFieldStaticArticle({ ...inputFieldStaticArticle, [event.target.name]: event.target.value })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <br />
            <Divider />
            <br />
            <Sections
              inputFields={Array.isArray(inputFields) ? inputFields : []}
              setInputFields={setInputFields}
              handleInputChange={handleInputChange}
              handleAddFields={handleAddFields}
              handleRemoveFields={handleRemoveFields}
              handleAddFieldLink={handleAddFieldLink}
              handleRemoveFieldLink={handleRemoveFieldLink}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: '16px' }}
              fullWidth
              disabled={loadingResult}
              type='submit'
            >
              {loadingResult ? 'Generating...' : 'Generate Article'}
            </Button>
          </form>
        </Grid>
        <Grid item xs={12} md={3}>
        <StyledPaper elevation={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Editor Tools
            </Typography>
            
            <EditorToolsContainer>
              <EditorTool
                icon={<LinkIcon />}
                label="Authority Links"
                onClick={handleAuthorityLinksClick}
                loading={loadingAuthority}
              />
              <EditorTool
                icon={<Refresh />}
                label="Internal Links"
                onClick={handleInternalLinksClick}
                loading={loadingInternal}
              />
            </EditorToolsContainer>

            {showLinks && (
              <>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="link tabs" centered>
                  <Tab label="Authority Links" />
                  <Tab label="Internal Links" />
                </Tabs>
                <LinksContainer>
                  {activeTab === 0 && authorityLinks && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(authorityLinks) }}></div>
                  )}
                  {activeTab === 1 && internalLinks && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(internalLinks) }}></div>
                  )}
                </LinksContainer>
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
      <ProgressIndicator open={showProgress} />
    </div>
  );
}