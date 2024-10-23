"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import '../App.css';
import Grid from '@mui/material/Grid';
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown';
import {marked} from 'marked';

export default function ArticlesResult({ pageTitle, toCopy, response, loadingResult }: any) {
  const convertMarkdownToHTML = (markdown: string) => {
    return marked(markdown); // marked converts markdown to HTML
  };    
  const handleCopy = async () => {
    const htmlContent = convertMarkdownToHTML(response); // Ensure this is a string
    const plainTextContent = response; // The plain markdown as fallback

    try {
      // Copy styled content (HTML) to the clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          // @ts-expect-error need this for copy
          'text/html': new Blob([htmlContent], { type: 'text/html' }), // Ensure this is a resolved string
          'text/plain': new Blob([plainTextContent], { type: 'text/plain' }), // Fallback to plain text
        })
      ]);
      alert('Result copied.');
    } catch (err) {
      console.error('Error copying text: ', err);
    }
  };

  return (
    <div>
      <h1>Article Result:</h1>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <h3>{pageTitle}</h3>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" sx={{ float: "right" }} onClick={handleCopy}>
            Copy Result
          </Button>
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
