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

async function createLawClient(clientData: any) {
  const { error } = await supabase.from('clients').insert({
    name: clientData.name,
    guideline: clientData.guideline,
  });
  if (error) {
    alert(error.message);
  }
  alert(`${clientData.name} has been created.`);
  window.location.reload()
}

export default function ClientsForm() {
  const [name, setName] = useState('');
  const [guideline, setGuideline] = useState('');
  const handleSubmit = async () => {
    let data = {
      name,
      guideline
    };
    createLawClient(data);
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
