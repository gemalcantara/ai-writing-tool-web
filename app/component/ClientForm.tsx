"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

async function createLawClient(clientData: any) {
  const { error } = await supabase.from('clients').insert({
    name: clientData.name,
    guideline: clientData.guideline,
  });
  if (error) {
    alert(error.message);
    return 0;
  }
  alert(`${clientData.name} has been created.`);
  return 1
}

export default function ClientsForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [guideline, setGuideline] = useState('');
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    let data = {
      name,
      guideline
    };
    let isCreated = await createLawClient(data);
    if (isCreated) {
      navigate('/');
    }
  };
  const session = supabase.auth.getSession();

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="text.primary"
        gutterBottom
      >
        Create Client
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              label="Client Name"
              value={name}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="guideline"
              label="Client Guideline"
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
    </>

  );
}
