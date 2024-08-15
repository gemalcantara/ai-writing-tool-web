"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ArticlesResult() {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Retrieve the object from session storage
    const storedData = sessionStorage.getItem('articleResult');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Retrieve the object from session storage
      if (formData) {
          console.log(formData);
      }
  }, [formData]);

  

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      <Card sx={{ minWidth: 600 }}>
        <CardContent>

         </CardContent>
      </Card>
    </Box>
  );
}
