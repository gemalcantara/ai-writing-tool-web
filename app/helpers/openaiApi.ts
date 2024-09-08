import OpenAI from 'openai';

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

async function generateOutline(  keyword: string,
  description: string,
  clientDetails: string,
  pageType: string,
  internalLinks: string[],
  authorityLinks: string[]) {
  const messages = [
    {
      role: 'system',
      content: 'You are a legal expert writing articles for law firms.'
    },
    {
      role: 'user',
      content: `Please generate an outline for the following legal topic.`
    },
    {
      role: 'user',
      content: `KEYWORD: ${keyword}, ARTICLE DESCRIPTION: ${description}, LAW FIRM: ${clientDetails}, PAGE TYPE: ${pageType}, INTERNAL LINKS: ${internalLinks.join(', ')}, AUTHORITY LINKS: ${authorityLinks.join(', ')} REMINDER: All links must be incorporated into the outline; under no circumstances should you create an ‘Additional Resources’ or ‘Further Reading’ section at the end.`
    }
  ];
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
     // @ts-ignore
      messages: messages,
      max_tokens: 1500,
    });  
    return response.choices[0].message?.content || '';
  } catch (error) {
    console.error('Error generating article outline:', error);
    throw error;
  }
};

export {generateOutline}