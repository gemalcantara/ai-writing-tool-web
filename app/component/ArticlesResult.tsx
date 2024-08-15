"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import ChatComponent from './ChatComponent';

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;;
const organization = process.env.NEXT_PUBLIC_CHAT_GPT_PROJECT_ID;
const project = process.env.NEXT_PUBLIC_CHAT_GPT_organization;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});
async function sendRequest(formData) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `Create an article using there parameters lorem ipsum` }],
    model: "gpt-4o",
  });
  return completion.choices[0];
}

export default function ArticlesResult() {
  const [formData, setFormData] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve the object from session storage
    const storedData = sessionStorage.getItem('articleResult');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Retrieve the object from session storage
    const sendArticle = async () => {
      if (formData) {
        try {
          let res = sendRequest(formData)
    
          const data = await res;
          setResponse(data || 'No response');
        } catch (error) {
          console.log(error);
          setResponse(error);
        } finally {
          setLoading(false);
        }
      }
    }
    sendArticle();

  }, [formData]);
  if (loading) return <p>Loading...</p>;
  console.log(response);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: '100vh',height: '80vh',overflowY: 'scroll' }} >
        <CardContent>
          {/* < ChatComponent 
            formData = {formData}
          /> */}

        <h3>Response:</h3>
       { 
       loading ?? <p>Loading...</p>
        }
        <p>{response.message.content}</p>
         </CardContent>
      </Card>
    </Box>
  );
}
