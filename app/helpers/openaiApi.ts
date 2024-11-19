import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js'

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

async function getPrompt(type: 'authority' | 'outline') {
  const { data, error } = await supabase
    .from('site_options')
    .select('value,summary')
    .eq('type', type)
    .single();

  if (error || !data) { // Ensure `data` is not null or undefined
    console.error(`Error fetching ${type} prompt:`, error);
    return ''; // Return an empty string or handle the error as needed
  }

  const siteOption = {
    summary: data.summary,
    data: data.value,
  };

  return siteOption; // This will always return a valid object if no error
}

async function generateOutline(
  keywords: string,
  articleDescription: string,
  clientName: string,
  pageName: string,
  competitorLinksArray: string
) {
  const outlinePrompt = await getPrompt('outline');

  if (typeof outlinePrompt === 'string' || !outlinePrompt.data) {
    throw new Error('Outline prompt data is unavailable or invalid.');
  }

  
  let prompt = `${outlinePrompt.summary} 
  ${outlinePrompt.data
        .replace('{competitorLinks}', competitorLinksArray)
        .replace('{keywords}', keywords)
        .replace('{clientName}', clientName)
        .replace('{pageName}', pageName)
        .replace('{articleDescription}', articleDescription)}

        Return the response strictly following this JSON template, ensuring valid JSON formatting and no markdown, extraneous content or code block syntax. I will use this with JSON.parse(), so it should be in valid JSON format.'
 
        {
          \"title\": \"\",
          \"meta_description\": \"\",
          \"slug\": \"\",
          \"sections\": [
            {
              \"sectionTitle\": \"main section title\",
              \"description\": \"concatenate all subsections\",
              \"links\": [
                {
                  \"link\": \"leave this empty\"
                }
              ]
            }
          ]
        }
  `
  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ];
  try {
    const response: any = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      // model: "claude-3-opus-20240229",
      // model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      // @ts-ignore
      messages: messages,
    });

    return response.content[0]?.text || '';
  } catch (error) {
    console.error('Error generating article outline:', error);
    throw error;
  }
}


async function generateArticle(formData: string, sectionData: string) {
  let articlePrompt: any = {}
  let response: any = {};
  articlePrompt = [{ role: "user", content: [{type: "text", text: formData + JSON.parse(sectionData).map((section: string) => section).join("\n")} ,{ type: "text", text: "REMINDER: All links must be incorporated; under no circumstances should you create an 'Additional Resources' or 'Further Reading' section at the end. merge all results into one article with markdown" }]} ];
  response = await anthropic.messages.create({
    // model: "claude-3-5-sonnet-20240620",
      model: "claude-3-opus-20240229",
    // model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: articlePrompt,
  });
  return response.content[0].text || '';
}

async function generateAuthorityLink(formData: any, articleSections: any) {
  const authorityPrompt = await getPrompt('authority')
  if (typeof authorityPrompt === 'string' || !authorityPrompt.data) {
    throw new Error('Outline prompt data is unavailable or invalid.');
  }
  const prompt = `${authorityPrompt.summary} ${authorityPrompt.data
    .replace('{articleInstruction}', formData.main.instruction)
    .replace('{articleOutline}', ` ${articleSections.join('\n ')}`)}`;

    console.log(prompt);

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
  ${articleSections.join('\n ')}`;
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
    console.log(data);
    if (data.success) {
      return await data;
    } else {
      console.log(data.error || 'An unknown error occurred')
    }
  } catch (err) {
    throw new Error(`Error: ${err}`)
  }
}

export {generateOutline, generateArticle, generateAuthorityLink, generateInternalLink, checkForPlagiarism}