"use client"

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid, CircularProgress } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigate } from 'react-router-dom';

async function createLawClient(clientData: { name: string; guideline: string }) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create client');
  }

  return response.json();
}

export default function ClientsForm() {
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
      await createLawClient(data);
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
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="guideline"
              label="Client Guideline"
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