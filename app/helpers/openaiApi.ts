import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js'
import { generateComparisonWithAssistant } from './articleUtils';

const anthropic = new Anthropic({
  apiKey:process.env.NEXT_PUBLIC_CLAUDE_AI_API_KEY,
  dangerouslyAllowBrowser: true // defaults to process.env["ANTHROPIC_API_KEY"]
});

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
const COPYSCOPE_API_USERNAME = process.env.NEXT_PUBLIC_COPYSCAPE_USERNAME;
const COPYSCOPE_API_KEY = process.env.NEXT_PUBLIC_COPYSCAPE_API_KEY;

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);


interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestPayload {
  messages: Message[];
  stream: boolean;
  model: string;
}

async function getPrompt(type: 'authority' | 'outline' | 'article', mode?: string) {
    const response = await fetch(`/api/site-options?type=${type}${mode ? `&mode=${mode}` : ''}`)
    if (!response.ok) {
      throw new Error('Failed to fetch site options')
    }
    const data = await response.json()

    const siteOption = {
      summary: data[0].summary,
      data: data[0].value,
    };

    return siteOption; // This will always return a valid object if no error
  }

const isOverloadedError = (error: any) => {
  return error?.type === 'error' && 
         error?.error?.type === 'overloaded_error' && 
         error?.error?.message === 'Overloaded';
};

async function generateOutline(
  keywords: string,
  articleDescription: string,
  clientName: string,
  pageName: string,
  competitorLinksArray: string,
  constellationMode: string
) {
  const outlinePrompt = await getPrompt('outline',constellationMode);
  if (typeof outlinePrompt === 'string' || !outlinePrompt.data) {
    throw new Error('Outline prompt data is unavailable or invalid.');
  }
  let prompt = `Format the outline section in ${articleDescription} into a JSON object following these requirements:

1. The JSON must follow this exact structure with no additional fields:
{
  "title": "title from the outline section",
  "metaDescription": "brief summary of the article's content and purpose",
  "slug": "url-friendly version of title",
  "sections": [
    {
      "headingLevel": "h3",
      "sectionTitle": "name of the main section",
      "description": [
        "- bullet point with dash prefix", \n
        "- another bullet point with dash prefix" \n
      ],
      "links": [
        {
          "link": ""
        }
      ]
    }
  ]
}

2. Only process content under the "### **4. Outline**" heading
- Convert the main section "Explore the World of Arts and Crafts" into the title
- Each bullet point under the title becomes a section
- Convert subsection content into an array of strings, each prefixed with "- "
- Create a slug from the title
- Create a metaDescription that summarizes the content
- Ensure valid JSON syntax that can be parsed with JSON.parse()
- headingLevel must always be "h3"
- links array should contain one empty link object
- Each description array item must start with "- " to create bullet points

3. Do not include:
- Content from other sections of the article brief
- Markdown formatting
- Code block syntax
- Any content outside the JSON structure
  `
  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];
  try {
    const response: any = await anthropic.messages.create({
      // model: "claude-3-opus-20240229",
      model: "claude-3-5-sonnet-20241022",
      // model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      // @ts-ignore
      messages: messages,
    });

    if (isOverloadedError(response)) {
      throw new Error('The AI service is currently overloaded. Please try again in a few minutes.');
    }

    return response.content[0]?.text || '';
  } catch (error) {
    if (isOverloadedError(error)) {
      throw new Error('The AI service is currently overloaded. Please try again in a few minutes.');
    }
    console.error('Error generating article outline:', error);
    throw error;
  }
}


async function generateArticle(formData: any, sectionData: string, constellationMode: string) {
  let articlePrompt: any = {}
  let content;
  let response: any = {};
  let finalResponse: any = {};
  const parsedFormData = formData;
  if (constellationMode === 'constellation') {  
    const articlePromptRaw = await getPrompt('article', constellationMode);
    if (typeof articlePromptRaw === 'string' || !articlePromptRaw.data) {
      throw new Error('Outline prompt data is unavailable or invalid.');
    }

    content = articlePromptRaw.data
      // .replace('{page_type}', parsedFormData.pageName)
      .replace('{article_briefs}', parsedFormData.instruction)
      .replace('{client_guidelines}', parsedFormData.clientGuideline);
  } else { 
    const articlePromptRaw = await getPrompt('article', constellationMode);
    if (typeof articlePromptRaw === 'string' || !articlePromptRaw.data) {
      throw new Error('Outline prompt data is unavailable or invalid.');
    }
    
    content = articlePromptRaw.data
      // .replace('{page_type}', parsedFormData.pageName)
      .replace('{article_briefs}', parsedFormData.instruction)
      .replace('{client_guidelines}', parsedFormData.clientGuideline)
      .replace('{sections}', sectionData);
    }
    articlePrompt = [{
      role: "user",
      content: content
    }];
  try {
    response = await anthropic.messages.create({
      // model: "claude-3-opus-20240229",
      model: "claude-3-5-sonnet-20241022",
      // model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
    // @ts-ignore
      messages: articlePrompt,
    });

    if (isOverloadedError(response)) {
      throw new Error('The AI service is currently overloaded. Please try again in a few minutes.');
    }
// second part
    let finalContent = [{role: "user", 
      content: content},
      {role: "assistant", 
      content: response.content[0].text},
      {role: "user", 
      content: sectionData}]
  finalResponse = await anthropic.messages.create({
    // model: "claude-3-opus-20240229",
    // model: "claude-3-5-sonnet-20241022",
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 8192,
    // max_tokens: 3000,
  // @ts-ignore
    messages: finalContent,
  });
    return `## ${parsedFormData.pageTitle} \n ${finalResponse.content[0].text}` || '';
  } catch (error) {
    if (isOverloadedError(error)) {
      throw new Error('The AI service is currently overloaded. Please try again in a few minutes.');
    }
    throw error;
  }
}

async function generateAuthorityLink(formData: any, articleSections: any,constellationMode: string) {

  const authorityPrompt = await getPrompt('authority',constellationMode)
  if (typeof authorityPrompt === 'string' || !authorityPrompt.data) {
    throw new Error('Outline prompt data is unavailable or invalid.');
  }
  const prompt = `${authorityPrompt.summary} ${authorityPrompt.data
    .replace('{articleInstruction}', formData.main.instruction)
    .replace('{articleOutline}', ` ${articleSections}`)}`;


  const perplexityKey = process.env.NEXT_PUBLIC_PERPLEXITY_AI_API_KEY;
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        // { role: "system", content: authorityPrompt.summary },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      top_p: 0.9,
      search_domain_filter: ["perplexity.ai"],
      return_images: false,
      return_related_questions: false,
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    })
  };
  const response = await fetch('https://api.perplexity.ai/chat/completions', options);
  const data = await response.json();

  return data;
}

async function generateInternalLink(formData: any, articleSections: any) {
  const prompt = `
  #### Article Outline:
  ${articleSections}`;
  const payload: RequestPayload = {
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: false,
    model: "gpt-4o",
  };

  const response = await fetch(`https://prod-1-data.ke.pinecone.io/assistant/chat/internal-linking`, {
    method: "POST",
    headers: {
      "Api-Key": process.env.NEXT_PUBLIC_PINECONE_AI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}

async function checkForPlagiarism(text: string) {
  try {
    const response = await fetch('/api/check-plagiarism', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()
    // console.log(data);
    if (data.success) {
      return await data;
    } else {
      console.error(data.error || 'An unknown error occurred')
    }
  } catch (err) {
    throw new Error(`Error: ${err}`)
  }
}

async function generateComparison(prompt: string) {

  try {
    const comparisonAssistantId = "asst_GdXjH8ye0xL5MphGWv62by5Z";
    if (!comparisonAssistantId) throw new Error('Comparison assistant ID not configured');

    const result = await generateComparisonWithAssistant(prompt, comparisonAssistantId, openai);
    return result;
  } catch (error) {
    console.error('Error in generateComparison:', error);
    throw error;
  }
}

export {generateOutline, generateArticle, generateAuthorityLink, generateInternalLink, checkForPlagiarism, generateComparison}