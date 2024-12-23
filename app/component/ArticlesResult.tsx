"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Button,
  Grid,
  Typography,
  ButtonGroup,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Tab,
} from "@mui/material"
import { CheckCircle, BookOpen, Scale, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import OpenAI from 'openai'
import { Article, ArticleDetails, PlagiarismData } from '../types/article'
import { 
  updateArticleInMongoDB, 
  renderLinksWithTargetBlank, 
  createAssistantMessage 
} from '../helpers/articleUtils'
import { checkForPlagiarism } from "../helpers/openaiApi"
import {
  StyledPaper,
  ArticleOutline,
  ArticleDetails as ArticleDetailsComponent,
  PlagiarismResults,
  EditorTool,
  DetailsContainer,
  EditorToolsContainer,
  LinksContainer,
  ScrollableTabs
} from "../components/shared/ArticleComponents"
import { marked } from "marked"
import { useParams } from 'react-router-dom';

const Editor = dynamic(() => import('../helpers/Editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY,
  dangerouslyAllowBrowser: true
})

const countWords = (text: string): number => {
  return text.normalize('NFKC').trim().split(/\s+/).length;
}

 interface ArticlesResultProps {  
  article: any;
  setArticle:  React.Dispatch<React.SetStateAction<Article | null>>;
}
export default function ArticlesResult({ article,setArticle }: ArticlesResultProps) {
  const [articleState, setArticleState] = useState<Article | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [outline, setOutline] = useState<any>(null)
  const [articleDetails, setArticleDetails] = useState<ArticleDetails>({
    client: '',
    keyword: '',
    meta: '',
    slug: '',
    articleTitle: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [factCheckResults, setFactCheckResults] = useState('')
  const [styleGuideResults, setStyleGuideResults] = useState('')
  const [legalRulesResults, setLegalRulesResults] = useState('')
  const [plagiarismData, setPlagiarismData] = useState<PlagiarismData | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [showResults, setShowResults] = useState(true)

  const params = useParams();
  const articleId = params?.articleId || article?._id;

  // Effect for word count
  useEffect(() => {
    setWordCount(countWords(editedContent))
  }, [editedContent])

  // Effect for fetching article
  useEffect(() => {
    const fetchArticleById = async () => {
      if (!articleId) return

      try {
        const endpoint =  `/api/articles/${articleId}`;
          
        const response = await fetch(endpoint)
        if (!response.ok) throw new Error('Failed to fetch article')
        
        const data = await response.json()
        setArticleState(data)
        setArticle(data) // Update parent state
        // Handle article details
        if (data.article_details) {
            
          setArticleDetails({
            ...data.article_details,
            articleTitle: data.article_details.articleTitle ||data.outline.title
            })
          
        } else if (data.outline_input_data) {
          const newArticleDetails = {
            client: data.outline_input_data.inputFieldStaticOutline?.clientName || "",
            keyword: data.outline_input_data.linkFields?.keywords
              .map((item: { value: string }) => item.value).join(", ") || "",
            meta: data.outline.meta_description,
            slug: data.outline.slug,
            articleTitle: data.outline.title
          }
          setArticleDetails(newArticleDetails)
          await updateArticleInMongoDB(articleId, { article_details: newArticleDetails })
        }
        setOutline(data.outline)
        const htmlContent = await marked(data.article_output)
        setEditedContent(htmlContent)
        // Set other results
        setFactCheckResults(data.factcheck_result || '')
        setStyleGuideResults(data.styleguide_result || '')
        setLegalRulesResults(data.legalrules_result || '')
        setPlagiarismData(data.plagiarism_result || null)
      } catch (error) {
        setError(`Error fetching article: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    fetchArticleById()
  }, [articleId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent)
      alert('Result copied.')
    } catch (err) {
      console.error('Error copying text: ', err)
    }
  }

  const handleCopyLink = useCallback(async (id: string) => {
    try {
      const privateUrl = `${window.location.origin}/share/${id}`
      await navigator.clipboard.writeText(privateUrl)
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Error copying link:', error)
      setError('Failed to copy link to clipboard')
    }
  }, [])

  const handleEdit = useCallback(() => {
    setEditMode(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      await updateArticleInMongoDB(articleId, { 
        article_output: editedContent,
        article_details: articleDetails
      })

      setEditMode(false)
      const updatedArticle = articleState ? {
        ...articleState,
        article_output: editedContent,
        article_details: articleDetails
      } : null
      
      setArticleState(updatedArticle)
      setArticle(updatedArticle)
    } catch (error) {
      console.error("Error saving changes:", error)
      alert("Failed to save changes. Please try again.")
    }
  }, [articleId, editedContent, articleDetails, articleState])

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setShowResults(true) // Ensure results are visible when changing tabs
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
          {/* <h3 className="text-2xl font-bold">{articleDetails?.articleTitle}</h3> */}
        </Grid>
        <Grid item xs={2} className="flex justify-end">
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <Button onClick={handleCopy}>
              Copy Result
            </Button>
            <Button onClick={() => handleCopyLink(articleId)}>
              Copy Link
            </Button>
            {!editMode && (
              <Button onClick={handleEdit}>
                Edit
              </Button>
            )}
            {editMode && (
              <Button onClick={handleSave}>
                Save
              </Button>
            )}
          </ButtonGroup>
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
              <ArticleDetailsComponent editMode={editMode} articleDetails={articleDetails} handleArticleDetailsChange={handleArticleDetailsChange} />
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Link copied to clipboard"
      />
    </div>
  )
}