"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Paper,
  Box,
  styled,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from "@mui/material";
import { createClient } from "@supabase/supabase-js";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CheckCircle, BookOpen, Scale, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import OpenAI from 'openai';
import "../App.css";

const Editor = dynamic(() => import('../helpers/Editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_LINK!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Article {
  id: number;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
  outline: string;
  client: string;
  keyword: string;
  meta: string;
  slug: string;
}

interface EditorToolProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
}

interface ArticleDetails {
  client: string;
  keyword: string;
  meta: string;
  slug: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%', // Increased width
  maxWidth: '400px', // Maximum width to prevent it from becoming too wide
  margin: '0 auto', // Center the paper if it's not full width
}));

const DetailsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ResultsContainer = styled(Box)(({ theme }) => ({
  maxHeight: '50vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  '& pre': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
}));
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
const EditorToolsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const ScrollableTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-scroller': {
    overflow: 'auto !important',
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(2),
  },
}));

const EditorTool = ({ icon, label, onClick, loading }: EditorToolProps) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    disabled={loading}
    sx={{
      flex: '1 0 calc(50% - 8px)',
      justifyContent: 'flex-start',
      py: 1.5,
      px: 2,
      color: 'text.primary',
      '&:hover': {
        backgroundColor: 'action.hover',
      }
    }}
  >
    {loading ? 'Processing...' : label}
  </Button>
);

export default function MergedArticleHistoryView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<any>();
  const [articleDetails, setArticleDetails] = useState<ArticleDetails>();
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const [activeTab, setActiveTab] = useState(0);
  const [showResults, setShowResults] = useState(true);
  const [loading, setLoading] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState<string>('');
  const [styleGuideResults, setStyleGuideResults] = useState<string>('');
  const [legalRulesResults, setLegalRulesResults] = useState<string>('');
  const [plagiarismResults, setPlagiarismResults] = useState<string>('');
  useEffect(() => {
    const fetchArticleById = async () => {
      try {
        const { data, error } = await supabase
          .from("history")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error) {
          setError(`Error fetching article: ${error.message}`);
        } else {
          setArticle(data);
          if (data.outline_input_data) {
            const articleData = JSON.parse(data.outline_input_data);
            const outlineData = JSON.parse(data.outline);
            let client = articleData.inputFieldStaticOutline?.clientName || "";
            let keyword = articleData.linkFields?.keywords.map((item: { value: string }) => item.value).join(", ") || "";
            let meta = outlineData.meta_description;
            let slug = outlineData.slug;
            setArticleDetails({
              client,
              keyword,
              meta,
              slug,
            })
          }
          setOutline(JSON.parse(data.outline));
          const htmlContent = await marked(data.article_output, {
            async: true
          });
          setEditedContent(htmlContent);
        }
      } catch (error) {
        setError(`Error fetching article: ${error}`);
      }
    };

    fetchArticleById();
  }, [articleId]);

  const handleCopy = async () => {
    if (article) {
      const htmlContent = await marked(article.article_output, {
        async: true
      });
      const plainTextContent = article.article_output;

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([htmlContent], { type: "text/html" }),
            "text/plain": new Blob([plainTextContent], { type: "text/plain" }),
          }),
        ]);
        alert("Result copied.");
      } catch (err) {
        console.error("Error copying text: ", err);
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("history")
        .update({ article_output: editedContent })
        .eq("id", articleId);

      if (error) {
        throw error;
      }

      setEditMode(false);
      setArticle((prev) =>
        prev ? { ...prev, article_output: editedContent } : null
      );
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const createAssistantMessage = async (content: string, instruction: string, assistantId: string) => {
    setLoading(true);
    setError(null);
    try {

      const run = await openai.beta.threads.createAndRun({
        assistant_id: assistantId,
        thread: {
          messages: [
            { role: "user", content: content },
          ],
        },
      });

      // Poll for completion
      let completedRun;
      while (true) {
        completedRun = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
        if (completedRun.status === 'completed') {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const assistantMessage = messages.data[0].content[0];

      if ('text' in assistantMessage) {
        const htmlContent = await marked(assistantMessage.text.value, {
          async: true
        });

        switch (instruction) {
          case "factCheck":
              setFactCheckResults(htmlContent);
            break;

            case "styleGuide":
              setStyleGuideResults(htmlContent);
            break;
            case "legalRules":
              setLegalRulesResults(htmlContent);
            break;
            case "plagiarism":
              setPlagiarismResults(htmlContent);
            break;
        
          default:
            setFactCheckResults("");
            setStyleGuideResults("");
            setLegalRulesResults("");
            setPlagiarismResults("");
            break;
        }
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process the content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFactCheck = async () => {
    const content = editedContent;
    const assistantId = "asst_vQQJIXDjR7IZ801n9zxanYER"; // Replace with actual assistant ID
    const instruction = "factCheck";
    setActiveTab(0);
    await createAssistantMessage(content, instruction, assistantId);
  };

  const handleStyleGuide = async () => {
    const content = editedContent;
    const assistantId = "asst_iufG2r0lLTIq5HJl4CQIu0YG"; // Replace with actual assistant ID
    const instruction = "styleGuide";
    setActiveTab(1);
    await createAssistantMessage(content, instruction, assistantId);
  };

  const handleLegalRules = async () => {
    const content = editedContent;
    const assistantId = "asst_d2vnrAH6MNssLkkRgnGNfohK"; // Replace with actual assistant ID
    const instruction = "legalRules"
    setActiveTab(2);
    await createAssistantMessage(content, instruction, assistantId);
  };

  const handlePlagiarism = async () => {
    const content = editedContent;
    const assistantId = "asst_plagiarism_id"; // Replace with actual assistant ID
    const instruction = "plagiarism"
    setActiveTab(3);
    await createAssistantMessage(content, instruction, assistantId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={9}>
          <h3 className="text-2xl font-bold">{article?.article_title}</h3>
        </Grid>
        <Grid item xs={3} className="flex justify-end">
          <Button style={{ marginRight: "3px"}}
            variant="outlined"
            onClick={() => navigate(`/dashboard/articles/create/${articleId}`)}
          >
            Create Article
          </Button>
          <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleCopy}>
            Copy Result
          </Button>
          {!editMode && (
            <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleEdit}>
              Edit
            </Button>
          )}
          {editMode && (
            <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleSave}>
              Save
            </Button>
          )}
        </Grid>
      </Grid>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Accordion className="mb-6" style={{ marginTop: "1rem"}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <h2>Outline</h2>
        </AccordionSummary>
        <AccordionDetails>
          {outline &&
            outline.sections.map((section: any, index: number) => (
              <div key={index} className="mb-4 ck ck-content"  style={{ marginLeft: "1rem"}}>
                {section.headingLevel === "h2" ? (
                  <h2 className="text-xl font-semibold mb-2">
                    {section.sectionTitle}
                  </h2>
                ) : (
                  <h3 className="text-lg font-semibold mb-2">
                    {section.sectionTitle}
                  </h3>
                )}
                <Typography className="mb-2">{section.description}</Typography>
                <Typography className="font-semibold">Links:</Typography>
                <ul className="list-disc pl-5">
                  {section.links.map((link: any, linkIndex: number) => (
                    <li key={linkIndex}>
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </AccordionDetails>
      </Accordion>

      <Grid container spacing={3} >
        <Grid item xs={12} md={9}>
          {editMode ? (
            <div className="mb-4" style={{ marginTop: "1rem"}}>
              <Editor
                data={editedContent}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditedContent(data);
                }}
              />
            </div>
          ) : (
            <div className="prose max-w-none" style={{ marginTop: "1rem"}}>
              <div className="pl-5 ck ck-content" style={{ marginLeft: "1rem"}} dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(editedContent)}}></div>
            </div>
          )}
        </Grid>
        <Grid item xs={12} md={3} >
          <StyledPaper elevation={3} style={{ marginTop: "1rem"}}>
            <DetailsContainer>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Client"
                    value={articleDetails?.client || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Keyword"
                    value={articleDetails?.keyword || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    multiline
                    fullWidth
                    rows={3}
                    label="Meta"
                    value={articleDetails?.meta || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Slug"
                    value={articleDetails?.slug || ''}
                    disabled
                  />
                </Grid>
              </Grid>
            </DetailsContainer>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Editor Tools
            </Typography>
            
            <EditorToolsContainer>
              <EditorTool
                icon={<CheckCircle size={20} />}
                label="Fact Checker"
                onClick={handleFactCheck}
                loading={loading && activeTab === 0}
              />
              <EditorTool
                icon={<BookOpen size={20} />}
                label="Style Guide"
                onClick={handleStyleGuide}
                loading={loading && activeTab === 1}
              />
              <EditorTool
                icon={<Scale size={20} />}
                label="Legal Rules"
                onClick={handleLegalRules}
                loading={loading && activeTab === 2}
              />
              <EditorTool
                icon={<Search size={20} />}
                label="Plagiarism"
                onClick={handlePlagiarism}
                loading={loading && activeTab === 3}
              />
            </EditorToolsContainer>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {showResults && (
              <>
                <ScrollableTabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="editor tool results"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}
                >
                  <Tab label="Fact Check" />
                  <Tab label="Style Guide" />
                  <Tab label="Legal Rules" />
                  <Tab label="Plagiarism" />
                </ScrollableTabs>
                <LinksContainer>
                  {activeTab === 0 && factCheckResults && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(factCheckResults) }}></div>
                  )}
                  {activeTab === 1 && styleGuideResults && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(styleGuideResults) }}></div>
                  )}
                     {activeTab === 2 && legalRulesResults && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(legalRulesResults) }}></div>
                  )}
                  {activeTab === 3 && plagiarismResults && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(plagiarismResults) }}></div>
                  )}
                </LinksContainer>
                
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </div>
  );
}