"use client"
import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Grid, IconButton, TextField } from '@mui/material';
import { PersonAdd, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);
  

interface History {
    id: string;
    created_by: string;
    created_at: string;
    article_title: string;
  }
export default function ArticleHistory() {
    const [histories, setHistories] = useState<History[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<History[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const navigate = useNavigate();

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*') .order('id', { ascending: false });

        if (error) throw error;
        setHistories(data as History[]);
        setFilteredArticles(data);
      } catch (error) {
        setError('Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
        fetchHistory();
      }, []);
      let rows: any[] | undefined = [];
      histories.map((history) => (
        rows.push( { id: history.id, created_by: history.created_by, article_title: history.article_title })
      ));

      const handleDelete = async (id: string | number) => {
        const stringId = id.toString(); // Ensuring id is a string
        const { error } = await supabase.from('history').delete().eq('id', stringId);
        
        if (error) {
          console.error('Error deleting article:', error);
        } else {
          setFilteredArticles(histories.filter((history) => history.id !== stringId));
        }
      };

      // const handleView = async (id: string | number) => {
      //   const stringId = id.toString(); // Ensuring id is a string
      //   const { data } = await supabase.from('history').select('*').eq('id', stringId).single();
      //   console.log(data)
      //   sessionStorage.setItem('selectedArticle', JSON.stringify(data.article_output));
      //   sessionStorage.setItem('selectedArticleTitle', JSON.stringify(data.article_title));
      //   navigate('/dashboard/articles/view');
      // };
        // Handle the search input change
      const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);

        const filteredData = histories.filter((history) =>
          history.article_title.toLowerCase().includes(value)
        );
        setFilteredArticles(filteredData);
      };
      
      const columns: GridColDef[] = [
        // { field: 'id', headerName: 'ID', width: 150 },
        { field: 'article_title', headerName: 'Title', width: 250 },
        { field: 'created_by', headerName: 'Created By', width: 250 },
        { field: 'created_at', headerName: 'Created At', width: 200 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params) => (
            <IconButton aria-label="view" color="primary" onClick={() => navigate(`${params.row.id}`)}>
              <Visibility/>
            </IconButton>
          ),
        },
      ];
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: "120vh",minHeight: "80vh" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Article Outputs
              </Typography>
            </Grid>
            <Grid item xs={4}>
            <TextField id="standard-basic" label="Search by title" variant="standard" value={searchTerm}  onChange={handleSearchChange} sx={{float: 'right'}}/>
            </Grid>
          </Grid>

          <div style={{ height: 650, width: '100%', backgroundColor: '#fff' }}>
            <DataGrid
              rows={filteredArticles}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 20,50,100]}
              loading={loading}
              getRowId={(row) => row.id}
            />
          </div>
        </CardContent>
        <CardActions style={{ float: 'right' }}></CardActions>
      </Card>
    </Box>
  );
}
