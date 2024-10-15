"use client"
import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'user_type', headerName: 'User Type', width: 100 },
];
interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
}
export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('users') // Replace 'users' with your table name
          .select('*');

        if (error) throw error;

        // Update state with fetched data
        setUsers(data || []);
      } catch (error) {
        // Handle error
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  let rows: any[] | undefined = [];
  users.map((user) => (
    rows.push({ id: user.id, name: user.name, email: user.email, user_type: user.user_type })
  ));

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Users
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Button style={{ float: 'right' }} variant="outlined"
            component={Link}
            to="create"
          >
            <PersonAdd /> Create User
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: 400, width: '100%', backgroundColor: '#fff' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </div>
    </>
  );
}
