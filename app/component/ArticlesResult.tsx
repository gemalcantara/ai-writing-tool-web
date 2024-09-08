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
import Grid from '@mui/material/Grid';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@supabase/supabase-js';
import { CookiesProvider, useCookies  } from 'react-cookie';


const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;;
const organization = process.env.NEXT_PUBLIC_CHAT_GPT_PROJECT_ID;
const project = process.env.NEXT_PUBLIC_CHAT_GPT_organization;

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

interface ArticlePromt {
  role: string;
  content: string;
}
interface History {
  id: string;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
}
async function createHistory(output: string | null,article_title: string | null,created_by: string | null) {
  const { data, error } = await supabase.from('history').insert({
    created_by: created_by,
    article_output: output,
    article_title: article_title,
  });

  if (error) {
    alert(error.message);
  }
  alert(`${article_title} has been saved.`);
}

async function sendRequest(formData: any,sectionData: string) {
let articlePrompt: ArticlePromt[] = [{role: "user", content: formData}]
  let sections = JSON.parse(sectionData);
   sections.forEach((section: any,index: number) => {
    articlePrompt.push({ role: "user", content: section });
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
  const removeMd = require('remove-markdown');
  const [formData, setFormData] = useState<any>(null);
  const [sectionData, setSectionData] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState<any>('');
  const [response, setResponse] = useState<any>('');
  const [toCopy, settoCopy] = useState<any>('');
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie] = useCookies(['user']);

  useEffect(() => {
    const storedData = sessionStorage.getItem('articleResultPrompt');
    const sectionData = sessionStorage.getItem('articleResultSections');
    const pageTitleData = sessionStorage.getItem('pageTitle');
    setPageTitle(pageTitleData);
    setFormData(storedData);
    setSectionData(sectionData);
  }, []);

  useEffect(() => {
    const sendArticle = async () => {
      if (formData) {
        try {
          let res = sendRequest(formData,sectionData)
          const data = await res;
          createHistory(data,pageTitle,cookies.user.user.email);
          const plainText = removeMd(data);
          settoCopy(plainText)
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
    <div>
      <h1>Article Result:</h1>
      <Grid container spacing={2}>
        <Grid item xs={10}>
        <h3>{pageTitle}</h3>
        </Grid>
        <Grid item xs={2}>
        <Button variant="outlined" sx={{float: 'right'}} onClick={() => {
          navigator.clipboard.writeText(toCopy)
          alert('result copied')
        }}>Copy Result</Button>
        </Grid>
      </Grid>


       { 
       loading ?? <p>Loading...</p>
        }
         <Markdown className="process-text" remarkPlugins={[remarkGfm]}>{response}

         </Markdown>

    </div>

  );
}
