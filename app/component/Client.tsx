"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
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
interface ClientsList {
  id: number;
  name: string;
  guideline: string;
}


export default function Client() {
  const { clientId } = useParams();
  const [client, setClient] = useState<ClientsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideline, setGuideline] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();

  const handleChangeName = (event) => {
    setName(event.target.value);
  };
  const handleChangeGuideline = (event) => {
    setGuideline(event.target.value);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('clients') // Replace 'users' with your table name
          .select('*') 
          .eq('id', parseInt(clientId))
          .single(); // Ensure that only one row is returned

        if (error) throw error;

        // Update state with fetched data
        setClient(data || []);
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
  }, [clientId]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // update
  const handleUpdate = async () => {
    const confirmed = window.confirm('Are you sure you want to update this record?');
    if (confirmed) {
      try {
        const { error } = await supabase
          .from('clients')
          .update({ name: name,guideline: guideline })
          .eq('id', clientId);

        if (error) throw error;

        alert('Page updated successfully!');
        window.location.reload(false);
      } catch (error) {
        setError(error.message);
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
          .from('clients')
          .delete()
          .eq('id', clientId);

        if (error) throw error;

        alert('Client deleted successfully!');
        navigate('/'); // Redirect after deletion
      } catch (error) {
        setError(error.message);
      }
    }
  };

  
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: 600 }}>
        <CardContent>

        <Grid container spacing={2} marginBottom={3}>
            <Grid item xs={8}>
            <Typography
            variant="h5"
            color="text.primary"
          >
            Client Guidelines
          </Typography>
            </Grid>
            <Grid item xs={4}>
              <Button style={{float: 'right'}} variant="outlined" color='error'
                onClick={(event) => handleDelete()}
                >
                <DeleteForeverRounded /> Delete Client
              </Button>
            </Grid>
            <Grid item xs={12}>
          <TextField 
            id="name"
            label="Name"
            value= {name}
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
            rows={10}
          />
        </CardContent>
        <CardActions style={{ float: 'right' }}>
          <Button size="large" variant="contained" color="primary" onClick={(event) => handleUpdate()}>
            Update
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}