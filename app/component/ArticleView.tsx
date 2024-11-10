"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@supabase/supabase-js";
import { useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('../helpers/Editor'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>
  });
import "../App.css";
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

export default function MergedArticleHistoryView() {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<any>();
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    const fetchArticleById = async () => {
      try {
        const { data, error } = await supabase
          .from("history")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error) {
          setError(`Error fetching article: ${error.message}`);
        } else {
          setArticle(data);
          setOutline(JSON.parse(data.outline));
          const htmlContent = await marked(data.article_output, {
            async: true
          });
          setEditedContent(htmlContent);
        }
      } catch (error) {
        setError(`Error fetching article: ${error}`);
      }
    };

    fetchArticleById();
  }, [articleId]);

  const convertMarkdownToHTML = (markdown: string) => {
    return marked(markdown);
  };

  const handleCopy = async () => {
    if (article) {
      const htmlContent = await marked(article.article_output, {
        async: true
      });
      const plainTextContent = article.article_output;

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([htmlContent], { type: "text/html" }),
            "text/plain": new Blob([plainTextContent], { type: "text/plain" }),
          }),
        ]);
        alert("Result copied.");
      } catch (err) {
        console.error("Error copying text: ", err);
      }
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("history")
        .update({ article_output: editedContent })
        .eq("id", articleId);

      if (error) {
        throw error;
      }

      setEditMode(false);
      setArticle((prev) =>
        prev ? { ...prev, article_output: editedContent } : null
      );
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const components = {
    a: ({ node, ...props }: any) => (
      <a target="_blank" rel="noopener noreferrer" {...props} />
    ),
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
    <div className="container mx-auto px-4 py-8">
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={9}>
          <h3 className="text-2xl font-bold">{article?.article_title}</h3>
        </Grid>
        <Grid item xs={3} className="flex justify-end">
          <Button style={{ marginRight: "3px"}}
            variant="outlined"
            onClick={() => navigate(`/dashboard/articles/create/${articleId}`)}
          >
            Create Article
          </Button>
          <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleCopy}>
            Copy Result
          </Button>
          {!editMode && (
            <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleEdit}>
              Edit
            </Button>
          )}
          {editMode && (
            <Button style={{ marginRight: "3px"}} variant="outlined" onClick={handleSave}>
              Save
            </Button>
          )}
        </Grid>
      </Grid>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Accordion className="mb-6" style={{ marginTop: "1rem"}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <h2>Outline</h2>
        </AccordionSummary>
        <AccordionDetails>
          {outline &&
            outline.sections.map((section: any, index: number) => (
              <div key={index} className="mb-4 ck ck-content"  style={{ marginLeft: "1rem"}}>
                {section.headingLevel === "h2" ? (
                  <h2 className="text-xl font-semibold mb-2">
                    {section.sectionTitle}
                  </h2>
                ) : (
                  <h3 className="text-lg font-semibold mb-2">
                    {section.sectionTitle}
                  </h3>
                )}
                <Typography className="mb-2">{section.description}</Typography>
                <Typography className="font-semibold">Links:</Typography>
                <ul className="list-disc pl-5">
                  {section.links.map((link: any, linkIndex: number) => (
                    <li key={linkIndex}>
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.link}
                      </a>
                    </li>
                  ))}
                </ul>
                </div>
            ))}
        </AccordionDetails>
      </Accordion>

      {editMode ? (
        <div className="mb-4" style={{ marginTop: "1rem"}}>
            <Editor
            data={editedContent}
            onChange={(event, editor) => {
                const data = editor.getData();
                setEditedContent(data);
            }}
            />
        </div>
      ) : (
        <div className="prose max-w-none" style={{ marginTop: "1rem"}}>
            <div className="pl-5 ck ck-content" style={{ marginLeft: "1rem"}} dangerouslySetInnerHTML={{ __html: renderLinksWithTargetBlank(editedContent)}}></div>
          {/* <ReactMarkdown
            className="process-text"
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {editedContent}
          </ReactMarkdown> */}
        </div>
      )}
    </div>
  );
}
