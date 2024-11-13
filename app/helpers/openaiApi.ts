import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey:process.env.NEXT_PUBLIC_CLAUDE_AI_API_KEY,
  dangerouslyAllowBrowser: true // defaults to process.env["ANTHROPIC_API_KEY"]
});

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});


interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RequestPayload {
  messages: Message[];
  stream: boolean;
  model: string;
}

async function generateOutline(  
  keywords: string,
  articleDescription: string,
  clientName: string,
  pageName: string,
  competitorLinksArray: string) {
  const messages = [
    {
      role: 'user',
      content: `SUMMARY: Assume the identity of a law firm and create an outline for an article about a specific legal issue that we will provide at the end of this prompt. Your goal is to create a helpful, engaging article outline that informs potential clients about a specific legal topic and how our law firm can help. You must incorporate the the Law Firm that is provided below into the Outline. 

      PROCESS: To generate the Outline, start by reviewiewing these three example articles. 

      Examples: ${competitorLinksArray}

      Read the articles in their entirety so that you are an expert on the topic. When creating your outline, incorporate the most common topics, characteristics, and information that you learn from the example articles.  

      STRUCTURE & FORMAT: The outline should be divided into Sections. Each Section should have a Title formatted in BOLD. Don’t include numbers or Roman numerals in the Section or Subsection Titles. Capitalize the first word of the title/heading and of any subtitle/subheading.
      Capitalize all major words (nouns, verbs including phrasal verbs such as “play with”, adjectives, adverbs, and pronouns) in the title/heading, including the second part of hyphenated major words (e.g., Self-Report not Self-report). Do not capitalize articles, prepositions (regardless of length), and coordinating conjunctions. The Title of the article must prominently feature the Keyword to optimize for SEO. The Meta Description should also include this keyword.

      GUIDANCE: The outline should be exhaustive, including clear guidance for the writer of what should be covered in each section and subsection. Format all guidance for the writer using bullet points. Don’t create a “Resources” section at the end of the article. 

      LINKS: Incorporate the Internal and Authority Links directly into the respective subsections of the outline. Place each link immediately after the guidance given to the writer in the relevant section. Simply add the URL itself; do not create a hyperlink.

      SEO: Create an engaging, SEO-optimized Title. The Title MUST include the Keyword provided below and the title won't mention the words "comprehensive guide". Create an engaging, SEO-optimized Meta Description. The Meta Description MUST include the Keyword provided below.

      IMPORTANT: Ensure that all links (Internal and Authority) are embedded within the relevant sections of the outline. Do not create a separate 'Resources' section. The links should be part of the guidance for the writer, showing where they fit into the article's content. Make sure the Title includes the Keyword listed above.  All links must be incorporated into the outline; DO NOT create an ‘Additional Resources’ section

      FINAL OUTPUT: Be sure to include the following fields in the final output before the Outline: Keyword, Law Firm, Page Type, Title, Meta Description, Recommended slug. 

      INPUT INFORMATION

      KEYWORD: ${keywords}
      CLIENT:  ${clientName}
      PAGE TYPE:  ${pageName}
      ARTICLE INSTRUCTION: ${articleDescription}
      REMINDER: All links must be incorporated into the outline; under no circumstances should you create an ‘Additional Resources’ or ‘Further Reading’ section at the end. 
      
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
              \"link\": \"\"
            }
          ]
        }
      ]
    }

      ` 
    }
  ];
  try {
    let response: any = {};
    response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8000,
   // @ts-ignore
      messages: messages,
    });
    // console.log(response);
    return response.content[0].text || '';
  } catch (error) {
    console.error('Error generating article outline:', error);
    throw error;
  }
};
async function generateArticle(formData: string, sectionData: string) {
  let articlePrompt: any = {}
  let response: any = {};
  articlePrompt = [{ role: "user", content: [{type: "text", text: formData + JSON.parse(sectionData).map((section: string) => section).join("\n")} ,{ type: "text", text: "REMINDER: All links must be incorporated; under no circumstances should you create an ‘Additional Resources’ or ‘Further Reading’ section at the end. merge all results into one article with markdown" }]} ];
  // console.log(articlePrompt);
  // return
    response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8100,
    // @ts-ignore
      messages: articlePrompt,
    });
    return response.content[0].text || '';
}

async function generateAuthorityLink(formData: any, articleSections: any) {
  const prompt = `
  ### STEPS
  1. **Understand the Article's Purpose:**  
    Review the information in the "Article Instructions" to understand the overall purpose and context of the article.
  2. **Review the Outline Sections:**  
    Read through each section in the outline to understand how they contribute to the article's structure and objectives.
  3. **Research and Gather References:**  
    Use the Internet to **search for 1–10 online resources** (e.g., articles, studies, surveys) that will strengthen the content in each section of the outline.
  4. **Provide a Standardized Output:**  
    List your recommended resources in a consistent format, including the article's name, URL, and the corresponding outline section.
  ---

  ### GUIDELINES

  1. **Approved Sources:**  
  Only suggest high-quality sources by prioritizing government websites (.gov) and legal statutes first, followed by reputable sources such as scholarly articles, university studies, publications from non-profit organizations, and reputable news outlets (e.g. CNN, New York Times).
  2. **Disallowed Sources:**  
    - **Law Firm Websites:** Avoid references from law firm websites or directories (e.g., Justia.com, FindLaw.com) since our articles are intended for potential clients, and we do not feature competing legal content.
    - **User-Generated Content:** Do not use articles from platforms like LinkedIn, Medium, or other social media sites.
  3. **Select Only the Best Resources:**  
    Aim for the **highest quality over quantity**. It is acceptable to suggest fewer than 10 resources if they represent the best possible references. Prioritize **quality over volume** in your selections.
  ---
  ### INPUT
  #### Article Instructions:
  ${formData.main.instruction}.
  #### Article Outline:
  ${articleSections.join('\n ')}
  ---

  ### OUTPUT FORMAT
  1. **(ARTICLE NAME)**  
    *(ARTICLE URL)*  
    **(SECTION WHERE ARTICLE SHOULD BE ADDED)**
  2. **(ARTICLE NAME)**  
    *(ARTICLE URL)*  
    **(SECTION WHERE ARTICLE SHOULD BE ADDED)**`;
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
        { role: "system", content: "You are a **research assistant** for our Content Writing team. Your task is to **analyze an article outline** and then **provide a list of high-quality references** from the Internet that will enhance the final article's quality. In your output, list the **name of the article**, the **URL**, and specify the **section where the article should be added** as a reference." },
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

export {generateOutline,generateArticle,generateAuthorityLink,generateInternalLink}