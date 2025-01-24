"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { ConstructionOutlined } from '@mui/icons-material';

interface SiteOption {
  _id?: string
  name: string
  summary: string
  value: string
  type: 'authority' | 'outline' | 'article'
}

async function createOrUpdateSiteOption(siteOption: SiteOption) {
  const isUpdate = Boolean(siteOption._id);
  const url = isUpdate ? `/api/site-options/${siteOption._id}` : '/api/site-options';
  const method = isUpdate ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: siteOption.name,
        summary: siteOption.summary,
        value: siteOption.value,
        type: siteOption.type
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save site option');
    }

    return { success: true, message: isUpdate ? 'Updated successfully' : 'Created successfully' };
  } catch (error) {
    console.error('Error saving site option:', error);
    throw error;
  }
}

export default function SiteOptionForm() {
  const [siteOption, setSiteOption] = useState<SiteOption>({
    name: '',
    summary: '',
    value: '',
    type: 'authority',
  })
  const { id } =  useParams<{ id: string }>();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSiteOption = async () => {
      try {
        const response = await fetch(`/api/site-options/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch site option')
        }
        const data = await response.json()
        setSiteOption(data)
      } catch (error) {
        console.error('Error fetching site option:', error)
        navigate('/site-options')
      }
    }

    fetchSiteOption()
  }, [id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await createOrUpdateSiteOption(siteOption);
      alert(result.message);
      navigate('/dashboard/site-options');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSiteOption(prevState => ({ ...prevState, [name]: value }))
  }

  return (
    <>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Edit Site Option
      </Typography>

      <Typography variant="h6" gutterBottom>
        Variables to use:
      </Typography>
      {siteOption.type === 'authority' && (
        <>
          <Typography variant="caption" display="block" gutterBottom>
        {'{articleInstruction}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{articleOutline}'}
          </Typography>
        </>
      )}
      {siteOption.type === 'outline' && (
        <>
          <Typography variant="caption" display="block" gutterBottom>
        {'{competitorLinks}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{keywords}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{clientName}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{pageName}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{articleDescription}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
        {'{articleBrief}'}
          </Typography>
        </>
      )}
      {siteOption.type === 'article' && (
        <>
          <Typography variant="caption" display="block" gutterBottom>
            {'{page_type}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            {'{article_briefs}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            {'{client_guidelines}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            {'{sections}'}
          </Typography>
        </>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              disabled
              value={siteOption.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="summary"
              name="summary"
              label="Summary"
              value={siteOption.summary}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="value"
              name="value"
              label="Value"
              value={siteOption.value}
              onChange={handleInputChange}
              multiline
              rows={10}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ float: 'right' }}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}