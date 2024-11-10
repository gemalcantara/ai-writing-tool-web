"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import '../App.css';
import Grid from '@mui/material/Grid';
import remarkGfm from 'remark-gfm'
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';

export default function ArticlesResult({ pageTitle, toCopy, response, loadingResult }: any) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const convertToHtml = async () => {
      if (response) {
        const html = await marked(response, { async: true });
        setHtmlContent(renderLinksWithTargetBlank(html));
      }
    };

    convertToHtml();
  }, [response]);

  const handleCopy = async () => {
    const plainTextContent = response; // The plain markdown as fallback

    try {
      // Copy styled content (HTML) to the clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([plainTextContent], { type: 'text/plain' }),
        })
      ]);
      alert('Result copied.');
    } catch (err) {
      console.error('Error copying text: ', err);
    }
  };

  const renderLinksWithTargetBlank = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener noreferrer');
    }
    return doc.body.innerHTML;
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

      {loadingResult ? (
        <p>Loading...</p>
      ) : (
        <div className="prose max-w-none" style={{ marginTop: "1rem"}}>
          <div 
            className="pl-5 ck ck-content" 
            style={{ marginLeft: "1rem"}} 
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}
    </div>
  );
}