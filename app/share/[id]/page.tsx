"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CircularProgress, Container, Typography, Button, Box, Divider } from '@mui/material'
import { getAuthToken } from '@/lib/jwt'
import { marked } from "marked"
import { ArticleDetails, ArticleOutline } from '@/app/components/shared/ArticleComponents'
import { ArticleDetails as ArticleDetailsType } from '@/app/types/article'
import "../../App.css"

interface ArticlePageProps {
  client: string,
  keyword: string,
  meta_description: string,
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
    meta_description: '',
    slug: '',
    articleTitle: ''
  })
  const params = useParams()

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
    const fetchArticle = async () => {
      try {
        const token = await getAuthToken()
        const response = await fetch(`/api/share/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }

        const data = await response.json()

        const htmlContent = await marked(data.article_output, {
            async: true
        })
        setArticle(htmlContent)
        setOutline(data.outline)  // Store the outline data

        setArticleDetails({
          client: data.article_details ? data.article_details.client : data.outline_input_data.inputFieldStaticOutline.clientName,
          keyword: data.article_details ? data.article_details.keyword : data.outline_input_data.linkFields.keywords.map((item: { value: string }) => item.value).join(", "),
          meta_description: data.article_details ?  data.article_details.meta : data.outline.meta_description,
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
        <strong>Meta Description:</strong> {articleDetails.meta_description}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Slug:</strong> {articleDetails.slug}
      </Typography>
      <Divider sx={{ my: 3, borderWidth: '1px' }} />
      <div className="result result-content" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(article)}}></div>
    </div>
  )
}