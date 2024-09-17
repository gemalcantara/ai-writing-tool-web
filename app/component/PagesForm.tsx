"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CookiesProvider, useCookies  } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

async function createPage(pageData: any) {
  const { error } = await supabase.from('pages').insert({
    name: pageData.name,
    guideline: pageData.guideline,
  });
  if (error) {
    alert(error.message);
        return 0;
  }
  alert(`${pageData.name} has been created.`);
    return 1

}

export default function PagesForm() {
  const [name, setName] = useState('');
  const [guideline, setGuideline] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    let data = {
      name,
      guideline
    };
    let isCreated = await createPage(data);
    if (isCreated) {
      navigate('/');
    }
  };
  const session = supabase.auth.getSession();
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: "120vh",minHeight: "80vh" }}>
        <CardContent>
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
                />
              </Grid>
              <Grid item xs={12}>
              <TextField
                  id="guideline"
                  label="Page Guideline"
                  onChange={(e) => setGuideline(e.target.value)}
                  multiline
                  fullWidth
                  rows={20}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{ float: 'right' }}
                  size="large"
                  id="submit"
                  type="submit"
                  variant="outlined"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
