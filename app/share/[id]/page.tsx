"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { CircularProgress, Container, Typography, Button, Box, Divider, FormControlLabel, Switch, TextField, Snackbar, Alert } from '@mui/material'
import { getAuthToken } from '@/lib/jwt'
import { marked } from "marked"
import { updateArticleInMongoDB } from '@/app/helpers/articleUtils'
import dynamic from 'next/dynamic'
import "../../App.css"

const Editor = dynamic(() => import('@/app/helpers/Editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

interface ArticlePageProps {
  client: string,
  keyword: string,
  meta: string,
  slug: string,
  articleTitle: string
}
export default function SharedArticlePage() {
  const [article, setArticle] = useState<any>(null)
  const [outline, setOutline] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [articleDetails, setArticleDetails] = useState<ArticlePageProps>({
    client: '',
    keyword: '',
    meta: '',
    slug: '',
    articleTitle: ''
  })
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const params = useParams()
  const articleId = params?.id || article?._id;

  const renderLinksWithTargetBlank = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const links = doc.getElementsByTagName('a')
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank')
      links[i].setAttribute('rel', 'noopener noreferrer')
    }
    return doc.body.innerHTML
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken()
        console.log("Token:", token)
        setIsAuthenticated(!!token)
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/share/${params.id}`)
        // const response = await fetch(`/api/share/${params.id}`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // })
        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }

        const data = await response.json()

        const htmlContent = await marked(data.article_output, {
            async: true
        })
        setArticle(htmlContent)
        setEditedContent(htmlContent) // Set edited content
        setOutline(data.outline)  // Store the outline data

        setArticleDetails({
          client: data.article_details ? data.article_details.client : data.outline_input_data.inputFieldStaticOutline.clientName,
          keyword: data.article_details ? data.article_details.keyword : data.outline_input_data.linkFields.keywords.map((item: { value: string }) => item.value).join(", "),
          meta: data.article_details ?  data.article_details.meta : data.outline.meta_description,
          slug:  data.article_details  ? data.article_details.slug : data.outline.slug,
          articleTitle: data.article_details  ? data.article_details.articleTitle : data.article_title,
        })
      } catch (err) {
        console.error(err);
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  const handleEditToggle = useCallback(() => {
    setEditMode((prev) => !prev)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await updateArticleInMongoDB(articleId, { 
        article_output: editedContent,
        article_details: articleDetails
      })

      setEditMode(false)
      setArticle(editedContent)
      setSnackbarOpen(true)
    } catch (error) {
      console.error("Error saving changes:", error)
      alert("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }, [params.id, editedContent, articleDetails])

  const handleArticleDetailsChange = useCallback((field: keyof ArticlePageProps, value: string) => {
    setArticleDetails(prev => ({ ...prev, [field]: value }))
  }, [])

  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <Typography variant="h5" color="error">
          {error === '{"error":"Unauthorized"}' ? 'You are not authorized to view this content' : error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          href="/login"
        >
          Go to Login
        </Button>
      </Box>
    )
  }

  return (
    <div className="prose max-w-none" style={{ margin: '2rem 5rem 1rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Article Details</Typography>
        {isAuthenticated && (
          <FormControlLabel
            control={<Switch checked={editMode} onChange={handleEditToggle} />}
            label={editMode ? "Edit Mode" : "View Mode"}
          />
        )}
      </Box>
      {(isAuthenticated && editMode) ? (
        <>
          <TextField
            label="Client"
            value={articleDetails.client}
            onChange={(e) => handleArticleDetailsChange('client', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Title"
            value={articleDetails.articleTitle}
            onChange={(e) => handleArticleDetailsChange('articleTitle', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Keyword"
            value={articleDetails.keyword}
            onChange={(e) => handleArticleDetailsChange('keyword', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Meta Description"
            value={articleDetails.meta}
            onChange={(e) => handleArticleDetailsChange('meta', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Slug"
            value={articleDetails.slug}
            onChange={(e) => handleArticleDetailsChange('slug', e.target.value)}
            fullWidth
            margin="normal"
          />
        </>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>
            <strong>Client:</strong> {articleDetails.client}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Title:</strong> {articleDetails.articleTitle}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Keyword:</strong> {articleDetails.keyword}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Meta Description:</strong> {articleDetails.meta}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Slug:</strong> {articleDetails.slug}
          </Typography>
        </>
      )}
      <Divider sx={{ my: 3, borderWidth: '1px' }} />
      {(isAuthenticated && editMode) ? (
        <div className="mb-4" style={{ marginTop: "1rem"}}>
          <Editor
            data={editedContent}
            onChange={(event, editor) => {
              const data = editor.getData()
              setEditedContent(data)
            }}
          />
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ mt: 2 }} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </div>
      ) : (
        <div className="result result-content" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(article)}}></div>
      )}
      <Snackbar          
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Changes saved successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        onClose={() => setSnackbarOpen(false)}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        Changes saved successfully
      </Alert>
      </Snackbar>
    </div>
  )
}