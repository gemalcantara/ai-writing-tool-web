"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

interface SiteOption {
  _id?: string
  name: string
  summary: string
  value: string
  type: 'authority' | 'outline' | 'article'
}

async function createOrUpdateSiteOption(siteOption: SiteOption) {
  const url =  `/api/site-options/${siteOption._id}`
  const method =  'PUT'

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(siteOption),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save site option')
    }

    const data = await response.json()
    alert(`${siteOption.name} has been updated.`)
    return true
  } catch (error) {
    console.error('Error saving site option:', error)
    alert(error)
    return false
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
    event.preventDefault()
    const success = await createOrUpdateSiteOption(siteOption, )
    if (success) {
      navigate('/site-options')
    }
  }

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
        </>
      )}
      {siteOption.type === 'article' && (
        <>
          {/* No variables to display for 'article' type wip*/}
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