"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

export default function ArticlesIndex() {
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
            Article
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            paddingBottom="2rem"
            color="text.primary"
          >
            Article
          </Typography>
          <textarea name="" id="" rows="10" />
        </CardContent>
        <CardActions style={{ float: 'right' }}>
          <Button size="large" variant="contained" color="primary">
            Save
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}