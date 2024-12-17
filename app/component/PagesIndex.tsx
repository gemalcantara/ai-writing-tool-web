"use client"

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid, TextField, CircularProgress } from '@mui/material';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link, useNavigate, useParams } from 'react-router-dom';
interface PagesList {
  _id: string;
  name: string;
  guideline: string;
}

async function fetchPage(pageId: string): Promise<PagesList> {
  const response = await fetch(`/api/pages/${pageId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch page');
  }
  return response.json();
}

async function updatePage(pageId: string, data: Partial<PagesList>) {
  const response = await fetch(`/api/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update page');
  }
  return response.json();
}

async function deletePage(pageId: string) {
  const response = await fetch(`/api/pages/${pageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete page');
  }
  return response.json();
}

export default function PagesIndex() {
  const router = useRouter();
  const { pageId } =  useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<PagesList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideline, setGuideline] = useState('');
  const [name, setName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {

    const loadPage = async () => {
      if (!pageId) {
        return <p>Page ID is missing!</p>;
      }
      try {
        const data = await fetchPage(pageId);
        setPage(data);
        setGuideline(data.guideline);
        setName(data.name);
      } catch (error) {
        setError('Failed to fetch page details');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId]);

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleChangeGuideline = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuideline(event.target.value);
  };

  const handleUpdate = async () => {
    const confirmed = window.confirm('Are you sure you want to update this record?');
    if (confirmed) {
      if (!pageId) {
        return <p>Page ID is missing!</p>;
      }
      setUpdating(true);
      try {
        await updatePage(pageId, { name, guideline });
        alert('Page updated successfully!');
      } catch (error) {
        setError('Failed to update page');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (confirmed) {
      if (!pageId) {
        return <p>Page ID is missing!</p>;
      }
      setDeleting(true);
      try {
        await deletePage(pageId);
        alert('Page deleted successfully!');
        router.push('/');
      } catch (error) {
        setError('Failed to delete page');
      } finally {
        setDeleting(false);
        navigate('/');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!page) return <Typography>No page found</Typography>;

  return (
    <>
      <Grid container spacing={2} marginBottom={3}>
        <Grid item xs={8}>
          <Typography variant="h5" color="text.primary">
            Article Guidelines
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Button 
            style={{ float: 'right' }} 
            variant="outlined" 
            color='error'
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : <DeleteForeverRounded />}
            Delete Page
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Variable to use:
          </Typography>
          <Typography variant="caption" color="text.primary" gutterBottom>
            {"{{"}client_guidelines{"}}"}
          </Typography>
          <br />
          <Typography variant="caption" color="text.primary" gutterBottom>
            {"{{"}article_instructions{"}}"}
          </Typography>
          <br />
          <Typography variant="caption" color="text.primary" gutterBottom>
            {"{{"}keywords{"}}"}
          </Typography>
          <br />
          <br />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="name"
            label="Name"
            value={name}
            fullWidth
            variant="outlined"
            onChange={handleChangeName}
          />
        </Grid>
      </Grid>
      <TextField
        id="guideline"
        label="Page Guideline"
        onChange={handleChangeGuideline}
        multiline
        fullWidth
        value={guideline}
        rows={20}
      />
      <Grid item xs={12} sx={{ float: "right", marginTop: '1rem' }}>
        <Button 
          size="large" 
          variant="contained" 
          color="primary" 
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? <CircularProgress size={24} /> : 'Update'}
        </Button>
      </Grid>
    </>
  );
}