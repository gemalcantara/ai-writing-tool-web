"use client"

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid, TextField, CircularProgress } from '@mui/material';
import { DeleteForeverRounded } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface ClientsList {
  _id: string;
  name: string;
  guideline: string;
}

async function fetchClient(clientId: string): Promise<ClientsList> {
  const response = await fetch(`/api/clients/${clientId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client');
  }
  return response.json();
}

async function updateClient(clientId: string, data: Partial<ClientsList>) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update client');
  }
  return response.json();
}

async function deleteClient(clientId: string) {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete client');
  }
  return response.json();
}

export default function Client() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideline, setGuideline] = useState('');
  const [name, setName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const data = await fetchClient(clientId);
        setClient(data);
        setGuideline(data.guideline);
        setName(data.name);
      } catch (error) {
        setError('Failed to fetch client details');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleChangeGuideline = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGuideline(event.target.value);
  };

  const handleUpdate = async () => {
    const confirmed = window.confirm('Are you sure you want to update this record?');
    if (confirmed) {
      setUpdating(true);
      try {
        await updateClient(clientId, { name, guideline });
        alert('Client updated successfully!');
      } catch (error) {
        setError('Failed to update client');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (confirmed) {
      setDeleting(true);
      try {
        await deleteClient(clientId);
        alert('Client deleted successfully!');
        router.push('/');
      } catch (error) {
        setError('Failed to delete client');
      } finally {
        setDeleting(false);
        navigate('/')
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!client) return <Typography>No client found</Typography>;

  return (
    <>
      <Grid container spacing={2} marginBottom={3}>
        <Grid item xs={8}>
          <Typography variant="h5" color="text.primary">
            Client Guidelines
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
            Delete Client
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="name"
            label="Name"
            value={name}
            variant="outlined"
            fullWidth
            onChange={handleChangeName}
          />
        </Grid>
      </Grid>
      <TextField
        id="guideline"
        label="Client Guideline"
        onChange={handleChangeGuideline}
        multiline
        fullWidth
        value={guideline}
        rows={20}
      />
      <Grid sx={{float: 'right', marginTop: '1rem'}}>
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