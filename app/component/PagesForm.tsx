"use client"

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid, CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigate } from 'react-router-dom';

async function createPage(pageData: { name: string; guideline: string }) {
  const response = await fetch('/api/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create page');
  }

  return response.json();
}

export default function PagesForm() {
  const [name, setName] = useState('');
  const [guideline, setGuideline] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        guideline
      };
      await createPage(data);
      alert(`${name} has been created.`);
      router.push('/');
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
      navigate('/');
      
    }
  };

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="text.primary"
        gutterBottom
      >
        Create Page Type
      </Typography>
      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
      >
        Variable to use:
      </Typography>
      <Typography
        variant="caption"
        color="text.primary"
        gutterBottom
      >
        {"{{"}client_guidelines{"}}"}
      </Typography>
      <br />
      <Typography
        variant="caption"
        color="text.primary"
        gutterBottom
      >
        {"{{"}article_instructions{"}}"}
      </Typography>
      <br />
      <Typography
        variant="caption"
        color="text.primary"
        gutterBottom
      >
        {"{{"}keywords{"}}"}
      </Typography>
      <br />
      <br />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              label="Page Name"
              value={name}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="guideline"
              label="Page Guideline"
              value={guideline}
              onChange={(e) => setGuideline(e.target.value)}
              multiline
              fullWidth
              rows={20}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              style={{ float: 'right' }}
              size="large"
              id="submit"
              type="submit"
              variant="outlined"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                'Save'
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}