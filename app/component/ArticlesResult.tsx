"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import '../App.css';
import Grid from '@mui/material/Grid';
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown';

export default function ArticlesResult({pageTitle,toCopy,response,loadingResult}:any) {

 console.log(toCopy);
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
          alert('Result Copied')
        }}>Copy Result</Button>
        </Grid>
      </Grid>


       { 
       loadingResult ?? <p>Loading...</p>
        }
         <ReactMarkdown className="process-text" remarkPlugins={[remarkGfm]}>{response}

         </ReactMarkdown>

    </div>

  );
}
