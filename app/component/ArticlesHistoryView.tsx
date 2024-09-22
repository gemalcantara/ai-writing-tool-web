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
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';


const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;;
const organization = process.env.NEXT_PUBLIC_CHAT_GPT_PROJECT_ID;
const project = process.env.NEXT_PUBLIC_CHAT_GPT_organization;

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

interface Article {
  id: number;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
}

export default function ArticleHistoryView() {
  console.log('hello')
  const removeMd = require('remove-markdown');
  const [article, setArticle] = useState<Article | null>(null);
  const [pageTitle, setPageTitle] = useState<any>('');
  const [response, setResponse] = useState<any>('');
  const [toCopy, settoCopy] = useState<any>('');
  const { articleId } = useParams();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Fetch a single article by ID from Supabase
    const fetchArticleById = async () => {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('id', articleId)
        .single(); // Ensures we only get one record

      if (error) {
        setError('Error fetching article: ' + error.message);
      } else {
        setArticle(data);
        setPageTitle(data.article_title);
        const plainText = removeMd(data.article_output);
        settoCopy(plainText)
      }
    };

    fetchArticleById();
  }, [articleId]);
  // useEffect(() => {
  //   // Retrieve the object from session storage
  //   const sectionData = sessionStorage.getItem('selectedArticle');
  //   const pageTitleData = sessionStorage.getItem('selectedArticleTitle');
  //   const plainText = removeMd(sectionData);
  //   settoCopy(plainText)
  //   setPageTitle(pageTitleData);
  //   setResponse(sectionData);
  // }, []);
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: '100vh',maxWidth: '100vh',height: '80vh',overflowY: 'scroll' }} >
        <CardContent>
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
         <ReactMarkdown className="process-text" remarkPlugins={[remarkGfm]}>{article?.article_output}

         </ReactMarkdown>

         </CardContent>
      </Card>
    </Box>
  );
}
