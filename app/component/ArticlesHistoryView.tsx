"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";
import removeMd from "remove-markdown";
import '../App.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_LINK!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface Article {
  id: number;
  created_by: string;
  created_at: string;
  article_title: string;
  article_output: string;
}

export default function ArticleHistoryView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { articleId } = useParams();

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

  const handleCopy = () => {
    if (article) {
      const plainText = removeMd(article.article_output);
      navigator.clipboard.writeText(plainText);
      alert("Result copied"); // Consider replacing with a snackbar for better UX
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: "100vh", maxWidth: "100vh", height: "80vh", overflowY: "scroll" }}>
        <CardContent>
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
        </CardContent>
      </Card>
    </Box>
  );
}
  