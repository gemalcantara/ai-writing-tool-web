import type { NextApiRequest, NextApiResponse } from 'next';

const openaiApiKey = "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";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://api.openai.com/v1/engines/gpt-4/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: req.body.prompt,
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
