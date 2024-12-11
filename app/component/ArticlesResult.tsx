"use client"

import React, { useEffect, useState, useCallback } from "react"
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
  Alert,
  List,
  ListItem,
  ListItemText,
  Link
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { CheckCircle, BookOpen, Scale, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import OpenAI from 'openai'
import { Article, ArticleDetails, PlagiarismData } from '../types/article'
import { updateArticleInMongoDB, renderLinksWithTargetBlank, createAssistantMessage } from '../helpers/articleUtils'
import { checkForPlagiarism } from "../helpers/openaiApi";
import {  StyledPaper, 
  ArticleOutline, 
  ArticleDetails as ArticleDetailsComponent,
  PlagiarismResults,
  EditorTool  } from "../components/shared/ArticleComponents";
import { DetailsContainer, EditorToolsContainer, LinksContainer, ScrollableTabs } from "../components/shared/ArticleComponents";

const Editor = dynamic(() => import('../helpers/Editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
  dangerouslyAllowBrowser: true
})

interface ArticlesResultProps {
  history?: any;
  constellationMode?: boolean;
}
const countWords = (text: string): number => {
  // Normalize the text to remove non-printable characters
  const normalizedText = text.normalize('NFKC');

  // Trim the text and split by whitespace, then return the length of the resulting array
  return normalizedText.trim().split(/\s+/).length;
};

export default function ArticlesResult({ history, constellationMode = false }: ArticlesResultProps) {
  const [editedContent, setEditedContent] = useState('');
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [outline, setOutline] = useState<any>()
  const [articleDetails, setArticleDetails] = useState<ArticleDetails>({
    client: '',
    keyword: '',
    meta: '',
    slug: ''
  })
  const articleId = history.id as string
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [showResults, setShowResults] = useState(true)
  const [loading, setLoading] = useState(false)
  const [factCheckResults, setFactCheckResults] = useState<string>('')
  const [styleGuideResults, setStyleGuideResults] = useState<string>('')
  const [legalRulesResults, setLegalRulesResults] = useState<string>('')
  const [plagiarismData, setPlagiarismData] = useState<PlagiarismData | null>(null)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    setWordCount(countWords(editedContent))
  }, [editedContent])

  useEffect(() => {
    const fetchArticleById = async () => {
      try {
        const endpoint = constellationMode 
          ? `/api/constellation/articles/${articleId}`
          : `/api/articles/${articleId}`;
          
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }
        const data = await response.json()
        setArticle(data)
        if (data.article_details) {
          setArticleDetails(data.article_details)
        } else if (data.outline_input_data) {
          const articleData = data.outline_input_data
          const outlineData = data.outline
          const newArticleDetails = {
            client: articleData.inputFieldStaticOutline?.clientName || "",
            keyword: articleData.linkFields?.keywords.map((item: { value: string }) => item.value).join(", ") || "",
            meta: outlineData.meta_description,
            slug: outlineData.slug,
          }
          setArticleDetails(newArticleDetails)
          // Update MongoDB with the new article details
          await updateArticleInMongoDB(articleId, { article_details: newArticleDetails })
        }
        setOutline(data.outline)
        const htmlContent = await marked(data.article_output, {
          async: true
        })
        setEditedContent(htmlContent)
        setFactCheckResults(data.fact_checker_result || '')
        setStyleGuideResults(data.style_guide_result || '')
        setLegalRulesResults(data.legal_rules_result || '')
        setPlagiarismData(data.plagiarism_result || null)
        // console log all set states above
        // console.log("Article:", data)
        // console.log("Article Details:", data.article_details )
        // console.log("Outline:", data.outline)
        // console.log("Edited Content:", htmlContent)
        // console.log("Fact Check Results:", data.fact_checker_result || '')
        // console.log("Style Guide Results:", data.style_guide_result || '')
        // console.log("Legal Rules Results:", data.legal_rules_result || '')
        // console.log("Plagiarism Data:", data.plagiarism_result || null)
        // console.log("Article fetched successfully")
      } catch (error) {
        setError(`Error fetching article: ${error}`)
      }
    }

    if (history?.id) {
      fetchArticleById()
    }
  }, [articleId, constellationMode])

  const handleCopy = async () => {

    try {
      // Copy styled content (HTML) to the clipboard
      await navigator.clipboard.writeText(editedContent)
      alert('Result copied.');
    } catch (err) {
      console.error('Error copying text: ', err);
    }
  };

  const handleEdit = useCallback(() => {
    setEditMode(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const endpoint = constellationMode
        ? `/api/constellation/articles/${articleId}`
        : `/api/articles/${articleId}`;

      await updateArticleInMongoDB(articleId, { 
        article_output: editedContent,
        article_details: articleDetails
      })

      setEditMode(false)
      setArticle((prev) =>
        prev ? { ...prev, article_output: editedContent, article_details: articleDetails } : null
      )
    } catch (error) {
      console.error("Error saving changes:", error)
      alert("Failed to save changes. Please try again.")
    }
  }, [articleId, editedContent, articleDetails, constellationMode])

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }, [])


  const handleFactCheck = useCallback(async () => {
    const assistantId = "asst_vQQJIXDjR7IZ801n9zxanYER"
    setActiveTab(0)
    await createAssistantMessage(
      editedContent,
      "factCheck",
      assistantId,
      openai,
      setLoading,
      setError,
      setFactCheckResults,
      articleId
    )
  }, [editedContent, articleId])

  const handleStyleGuide = useCallback(async () => {
    const assistantId = "asst_iufG2r0lLTIq5HJl4CQIu0YG"
    setActiveTab(1)
    await createAssistantMessage(
      editedContent,
      "styleGuide",
      assistantId,
      openai,
      setLoading,
      setError,
      setStyleGuideResults,
      articleId
    )
  }, [editedContent, articleId])

  const handleLegalRules = useCallback(async () => {
    const assistantId = "asst_d2vnrAH6MNssLkkRgnGNfohK"
    setActiveTab(2)
    await createAssistantMessage(
      editedContent,
      "legalRules",
      assistantId,
      openai,
      setLoading,
      setError,
      setLegalRulesResults,
      articleId
    )
  }, [editedContent, articleId])

  const handlePlagiarism = useCallback(async () => {
    setLoading(true)
    setError(null)
    setActiveTab(3)
    try {
      const response = await checkForPlagiarism(editedContent)
      if (response.success && response.data) {
        const plagiarismResult = {
          count: response.data.count,
          result: response.data.result
        }
        setPlagiarismData(plagiarismResult)
        await updateArticleInMongoDB(articleId, { plagiarism_result: plagiarismResult })
      } else {
        throw new Error("Failed to fetch plagiarism data")
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to check for plagiarism. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [editedContent, articleId])

  const handleArticleDetailsChange = useCallback((field: keyof ArticleDetails, value: string) => {
    setArticleDetails(prev => ({ ...prev, [field]: value }))
  }, [])
  return (
    <div className="container mx-auto px-4 py-8">
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={10}>
          <h3 className="text-2xl font-bold">{article?.article_title}</h3>
        </Grid>
        <Grid item xs={2} className="flex justify-end">
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

      <ArticleOutline outline={outline} />

      <Grid container spacing={3} >
        <Grid item xs={12} md={8}>
          <Typography variant="h6">Word Count: {wordCount}</Typography>
          {editMode ? (
            <div className="mb-4" style={{ marginTop: "1rem"}}>
              <Editor
                data={editedContent}
                onChange={(event, editor) => {
                  const data = editor.getData()
                  setEditedContent(data)
                }}
              />
            </div>
          ) : (
            <div className="prose max-w-none" style={{ marginTop: "1rem"}}>
              <div className="pl-5 result result-content" style={{ marginLeft: "1rem"}} dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(editedContent)}}></div>
            </div>
          )}
        </Grid>
        <Grid item xs={12} md={4} >
          <StyledPaper elevation={3} style={{ marginTop: "1rem"}}>
            <DetailsContainer>
              <ArticleDetailsComponent articleDetails={articleDetails} handleArticleDetailsChange={handleArticleDetailsChange} />
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
                  {activeTab === 3 && plagiarismData && (
                    <div className="prose max-w-none">
                      <PlagiarismResults data={plagiarismData} />
                    </div>
                  )}
                </LinksContainer>
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </div>
  )
}