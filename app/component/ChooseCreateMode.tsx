"use client"

import React from 'react'
import { Button, Card, CardContent, Typography, Box, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Article } from '@mui/icons-material'

export default function ChooseCreateMode() {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh' 
    }}>
      <Grid container spacing={4} maxWidth="md" justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
            onClick={() => navigate('/dashboard/articles/create')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Article sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Client Mode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
            onClick={() => navigate('/constellation/articles/create')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Article sx={{ fontSize: 60, mb: 2, color: 'secondary.main' }} />
              <Typography variant="h5" gutterBottom color="secondary">
                Constellation Mode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}