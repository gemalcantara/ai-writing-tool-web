"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";
import removeMd from "remove-markdown";
import '../App.css';
import { Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

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
  outline: string;
}

export default function ArticlesHistoryOutline() {
  const [article, setArticle] = useState<Article>();
  const [error, setError] = useState<string>();
  const [outline, setOutline] = useState<any>();
  const { articleId } = useParams();
  const navigate = useNavigate();

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
          setOutline(JSON.parse(data.outline))
        }
      } catch (error) {
        setError(`Error fetching article: ${error}`);
      }
    };

    fetchArticleById();
  }, [articleId]);
  console.log(outline)
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
              <Button variant="outlined" sx={{ float: "right" }} onClick={() => navigate(`/dashboard/articles/create/${articleId}`)}>
                Create Article
              </Button>
            </Grid>
          </Grid>
          {error && <p style={{ color: "red" }}>{error}</p>}
        {
          outline ? outline.sections.map((section : any, index: any) => (
            <div key={index}>
              {section.headingLevel === 'h2' ? (
                <h2> { section.sectionTitle}</h2>
              ) : (
                <h3> { section.sectionTitle}</h3>
              )}
              <Typography>{`${section.description}`}</Typography>
              <br />
              <Typography>Links:</Typography>
              {section.links.map((link: any,index: any)=>( 
                <div key={index}>
                  <a href={link.link}>{`${link.link}`}</a>
                </div>
              ))}
              <br />
            </div>
          
        
        ))  : ''
        }
        </CardContent>
      </Card>
    </Box>
  );
}
  