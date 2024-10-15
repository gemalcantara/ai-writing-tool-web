"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { Grid, TextField } from '@mui/material';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

interface PagesList {
  id: number;
  name: string;
  guideline: string;
}


export default function PagesIndex() {
  const { pageId } = useParams();
  const [page, setPage] = useState<PagesList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideline, setGuideline] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();

  const handleChangeName = (event: any) => {
    setName(event.target.value);
  };
  const handleChangeGuideline = (event: any) => {
    setGuideline(event.target.value);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('pages') // Replace 'users' with your table name
          .select('*')
          .eq('id', parseInt(pageId!))
          .single(); // Ensure that only one row is returned

        if (error) throw error;

        // Update state with fetched data
        setPage(data || []);
        setGuideline(data.guideline);
        setName(data.name);
        setError(null);

      } catch (error) {
        // Handle error
        setError(`Failed to fetch page details ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pageId]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // update
  const handleUpdate = async () => {
    const confirmed = window.confirm('Are you sure you want to update this record?');
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('pages')
          .update({ name: name, guideline: guideline })
          .eq('id', pageId);

        if (error) throw error;

        alert('Page updated successfully!');
        // navigate('/');
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  // delete
  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('pages')
          .delete()
          .eq('id', pageId);

        if (error) throw error;

        alert('Page deleted successfully!');
        navigate('/');
        // Redirect after deletion
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }
  };


  return (
    <>
      <Grid container spacing={2} marginBottom={3}>
        <Grid item xs={8}>
          <Typography
            variant="h5"
            color="text.primary"
          >
            Article Guidelines
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Button style={{ float: 'right' }} variant="outlined" color='error'
            onClick={(event) => handleDelete()}
          >
            <DeleteForeverRounded /> Delete Page
          </Button>
        </Grid>
        <Grid item xs={12}>
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
        <Button size="large" variant="contained" color="primary" onClick={(event) => handleUpdate()}>
          Update
        </Button>
      </Grid>
    </>
  );
}