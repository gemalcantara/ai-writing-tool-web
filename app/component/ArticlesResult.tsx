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

export default function ArticlesResult({pageTitle,toCopy,response,loadingResult}:any) {
 
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
       loadingResult ?? <p>Loading...</p>
        }
         <Markdown className="process-text" remarkPlugins={[remarkGfm]}>{response}

         </Markdown>

    </div>

  );
}
