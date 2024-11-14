import { NextRequest, NextResponse } from 'next/server'

// Define the response type
type PlagiarismCheckResponse = {
  success: boolean
  data?: any
  error?: string
}

// Environment variables should be properly typed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COPYSCAPE_API_USERNAME: string
      COPYSCAPE_API_KEY: string
    }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<PlagiarismCheckResponse>> {
  // Parse the JSON body
  const body = await req.json()
  const { text } = body

  if (!text) {
    return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 })
  }

  try {
    const result = await checkForPlagiarism(text)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Plagiarism check failed:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

async function checkForPlagiarism(text: string) {
  const url = 'https://www.copyscape.com/api/'

  const formData = new FormData()
  formData.append('u', process.env.NEXT_PUBLIC_COPYSCAPE_USERNAME)
  formData.append('k', process.env.NEXT_PUBLIC_COPYSCAPE_API_KEY)
  formData.append('o', 'csearch')
  formData.append('t', text)
  formData.append('f', 'json')
  // formData.append('x', '1') // enable this for testing

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`)
  }

  return await response.json()
}