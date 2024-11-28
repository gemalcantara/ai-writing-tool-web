"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CircularProgress, Container, Typography, Button, Box } from '@mui/material'
import { getAuthToken } from '@/lib/jwt'
import { marked } from "marked"
import "../../App.css"

export const renderLinksWithTargetBlank = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const links = doc.getElementsByTagName('a')
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank')
      links[i].setAttribute('rel', 'noopener noreferrer')
    }
    return doc.body.innerHTML
  }
export default function SharedArticlePage() {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()

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
        console.log(data);
        const htmlContent = await marked(data.article_output, {
            async: true
        })
        setArticle(htmlContent)
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
    //make the margen top 2rem left and right  5rem and bottm 1rem
    <div className="prose max-w-none"style={{ margin: '2rem 5rem 1rem' }}>
      <div className="result result-content" dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(article)}}></div>
    </div>
  )
}