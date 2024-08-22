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
import '../App.css';

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;;
const organization = process.env.NEXT_PUBLIC_CHAT_GPT_PROJECT_ID;
const project = process.env.NEXT_PUBLIC_CHAT_GPT_organization;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

interface ArticlePromt {
  role: string;
  content: string;
}
async function sendRequest(formData: any,sectionData: string) {
  let finalResult = new Array();
let articlePrompt: ArticlePromt[] = [{role: "user", content: formData}]
  
  // finalResult.push(completion.choices[0].message.content);
  let sections = JSON.parse(sectionData);
   sections.forEach((section: any,index: number) => {
    articlePrompt.push({ role: "user", content: section });
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "user", content: section }],
    //   model: "gpt-4o",
    // });
    // finalResult.push(completion.choices[0].message.content);
  });
  articlePrompt.push({ role: "user", content: "merge all into one article" });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
     // @ts-ignore
    messages: articlePrompt,
  });
  return completion.choices[0].message.content;
}

export default function ArticlesResult() {
  const [formData, setFormData] = useState<any>(null);
  // const [articleResult, setArticleResult] = useState<any>(null);
  const [sectionData, setSectionData] = useState<any>(null);
  const [response, setResponse] = useState<any>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve the object from session storage
    const storedData = sessionStorage.getItem('articleResultPrompt');
    const sectionData = sessionStorage.getItem('articleResultSections');
    // const articleData = sessionStorage.getItem('articleResultAll');
    setFormData(storedData);
    setSectionData(sectionData);
    if (formData && sectionData) {
      // setArticleResult(articleResult);
    }
  }, []);

  useEffect(() => {
    console.log(formData,sectionData);
    
    // Retrieve the object from session storage
    const sendArticle = async () => {
      if (formData) {
        try {
          let res = sendRequest(formData,sectionData)
          const data = await res;
          // let articleResult = new String('');
          // data.forEach(result => {
          //   articleResult = articleResult.concat(result);
          // });
          // console.log(articleResult);
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
      <Card sx={{ minWidth: '100vh',maxWidth: '100vh',height: '80vh',overflowY: 'scroll' }} >
        <CardContent>
          {/* < ChatComponent 
            formData = {formData}
          /> */}

        <h3>Response:</h3>
       { 
       loading ?? <p>Loading...</p>
        }
        <pre>
        {
          // response.forEach((element: any) => {
            //   <div><p>{element}</p><br /></div>
            // })
            response
          }
          </pre>
         </CardContent>
      </Card>
    </Box>
  );
}
