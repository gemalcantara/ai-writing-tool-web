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

async function generateOutline(  
  keywords: string,
  articleDescription: string,
  clientName: string,
  pageName: string,
  internalLinksArray: string[],
  authorityLinksArray: string[],
  competitorLinksArray: string[]) {
  let aiTool = sessionStorage.getItem('aiTool');
  const messages = [
    {
      role: 'user',
      content: `SUMMARY: Assume the identity of a law firm and create an outline for an article about a specific legal issue that we will provide at the end of this prompt. Your goal is to create a helpful, engaging article outline that informs potential clients about a specific legal topic and how our law firm can help. You must incorporate the the Law Firm that is provided below into the Outline. 

      PROCESS: To generate the Outline, start by reviewiewing these three example articles. 

      Examples: ${competitorLinksArray.join(', ')}

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
      INTERNAL LINKS: ${internalLinksArray}
      AUTHORITY LINKS: ${authorityLinksArray}
      REMINDER: All links must be incorporated into the outline; under no circumstances should you create an ‘Additional Resources’ or ‘Further Reading’ section at the end. 
      
      make the result into an javascript json to parse with this format and only this
      [{"title": "",
      "sections": {
        "title": "section title",
        "description": "concatinate all subsections",
        "links": [{
            "link": "link here"
        }]
      }]
     REMINDER: strictly follow this format no other text or markdown is required do not cover it in tilde and dont add the word json.`
    }
  ];
  try {
    let response: any = {};
    switch (aiTool) {
      case 'chatGpt':
        response = await openai.chat.completions.create({
          model: 'gpt-4o',
         // @ts-ignore
          messages: messages,
        });  
        return response.choices[0].message?.content || '';
        
        break;
        case 'claude':
           response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 8000,
         // @ts-ignore
            messages: messages,
          });
          return response.content[0].text || '';
          break;
      default:
        break;
    }
  } catch (error) {
    console.error('Error generating article outline:', error);
    throw error;
  }
};
async function generateArticle(formData: string, sectionData: string) {
  let aiTool = sessionStorage.getItem('aiTool');
  let articlePrompt: any = {}
  let response: any = {};
  switch (aiTool) {
    case 'chatGpt':
      articlePrompt = [{ role: "user", content: formData }, ...JSON.parse(sectionData).map((section: string) => ({ role: "user", content: section })), { role: "user", content: "merge all into one article" }];
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
      // @ts-ignore
        messages: articlePrompt,
      });  
      return response.choices[0].message?.content || '';
      
      break;
      case 'claude':
        let content = `${JSON.parse(sectionData).map((section: string) =>  formData += `${section} `).join('\n')}`;
        articlePrompt = [{ role: "user", content }] ;
        response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 8100,
      // @ts-ignore
          messages: articlePrompt,
        });
        return response.content[0].text || '';
        break;
    default:
      break;
  }
}


export {generateOutline,generateArticle}