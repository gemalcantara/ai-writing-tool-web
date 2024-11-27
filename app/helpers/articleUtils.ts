import { OpenAI } from 'openai'
import { marked } from 'marked'
import { Article } from '../types/article'

export const updateArticleInMongoDB = async (articleId: string, data: any, endpoint?: string) => {
  const apiEndpoint = endpoint || `/api/articles/${articleId}`;
  const response = await fetch(apiEndpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update article');
  }

  return await response.json();
};

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

export const createAssistantMessage = async (
  content: string, 
  instruction: string, 
  assistantId: string,
  openai: OpenAI,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setResults: (results: string) => void,
  articleId: string
) => {
  setLoading(true)
  setError(null)
  try {
    const run = await openai.beta.threads.createAndRun({
      assistant_id: assistantId,
      thread: {
        messages: [
          { role: "user", content: content },
        ],
      },
    })

    let completedRun
    while (true) {
      completedRun = await openai.beta.threads.runs.retrieve(run.thread_id, run.id)
      if (completedRun.status === 'completed') {
        break
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const messages = await openai.beta.threads.messages.list(run.thread_id)
    const assistantMessage = messages.data[0].content[0]

    if ('text' in assistantMessage) {
      const htmlContent = await marked(assistantMessage.text.value)
      setResults(htmlContent)
      await updateArticleInMongoDB(articleId, { 
        [`${instruction.toLowerCase()}_result`]: htmlContent 
      })
    }
  } catch (err) {
    console.error('Error:', err)
    setError('Failed to process the content. Please try again.')
  } finally {
    setLoading(false)
  }
}