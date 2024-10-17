"use client";
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";
import removeMd from "remove-markdown";
import '../App.css';
import {marked} from 'marked';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_LINK!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface Article {
  id: number;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: any;
}

export default function ArticleHistoryView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { articleId } = useParams();
  const convertMarkdownToHTML = (markdown: string) => {
    return marked(markdown); // marked converts markdown to HTML
  };     
  const renderers = {
    a: ({ children }: { children: React.ReactNode }) => (
      <a style={{ color: 'blue',textDecoration: 'undeline' }}>{children}</a>
    )
  };   
  useEffect(() => {
    const fetchArticleById = async () => {
      try {
        const { data, error } = await supabase
          .from("history")
          .select("*")
          .eq("id", articleId)
          .single(); // Ensures we only get one record

        if (error) {
          setError(`Error fetching article: ${error.message}`);
        } else {
          setArticle(data);
        }
      } catch (error) {
        setError(`Error fetching article: ${error}`);
      }
    };

    fetchArticleById();
  }, [articleId]);

  const handleCopy = async () => {
    if (article) {
      const htmlContent = convertMarkdownToHTML(article.article_output); // Ensure this is a string
      const plainTextContent = article.article_output; // The plain markdown as fallback
  
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
      // const plainText = article.article_output;
      // navigator.clipboard.writeText(plainText);
      // alert("Result copied"); // Consider replacing with a snackbar for better UX
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <h3>{article?.article_title}</h3>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" sx={{ float: "right" }} onClick={handleCopy}>
            Copy Result
          </Button>
        </Grid>
      </Grid>
      {error && <p style={{ color: "red" }}>{error}</p>}
        <ReactMarkdown className="process-text" remarkPlugins={[remarkGfm]}>
          {article?.article_output}
        </ReactMarkdown>
    </>
  );
}
