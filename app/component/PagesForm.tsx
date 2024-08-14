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

const supabase = createClient(
  'https://xmocweluatwitidfqkym.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb2N3ZWx1YXR3aXRpZGZxa3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMyMDY2NTYsImV4cCI6MjAzODc4MjY1Nn0.iGSi5Obo80XXd1_g_H8_uczeCVe-294cI1cfXMuH788',
);

async function createPage(pageData) {
  const { error } = await supabase.from('pages').insert({
    name: pageData.name,
    guideline: pageData.guideline,
  });
  if (error) {
    alert(error.message);
  }
  alert(`${pageData.name} has been created.`);
  window.location.reload(true)
}

export default function PagesForm() {
  const [name, setName] = useState('');
  const [guideline, setGuideline] = useState('');
  const handleSubmit = async () => {
    event.preventDefault();
    let data = {
      name,
      guideline
    };
    createPage(data);
  };
  const session = supabase.auth.getSession();
  session.then(e => console.log(e));
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: 600 }}>
        <CardContent>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Create Page Type
          </Typography>
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
                  rows={10}
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
