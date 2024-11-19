"use client"

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);
interface SiteOption {
  id?: string;
  name: string;
  summary: string;
  value: string;
  type: 'authority' | 'outline';
}

async function createOrUpdateSiteOption(siteOption: SiteOption, isEditing: boolean) {
  if (isEditing) {
    const { error } = await supabase
      .from('site_options')
      .update(siteOption)
      .eq('id', siteOption.id);
    if (error) {
      alert(error.message);
      return false;
    }
    alert(`${siteOption.name} has been updated.`);
  } else {
    const { error } = await supabase
      .from('site_options')
      .insert(siteOption);
    if (error) {
      alert(error.message);
      return false;
    }
    alert(`${siteOption.name} has been created.`);
  }
  return true;
}

export default function SiteOptionForm() {
  const [siteOption, setSiteOption] = useState<SiteOption>({
    name: '',
    summary: '',
    value: '',
    type: 'authority',
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchSiteOption = async () => {
        const { data, error } = await supabase
          .from('site_options')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching site option:', error);
          navigate('/site-options');
        } else if (data) {
          setSiteOption(data);
        }
      };

      fetchSiteOption();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await createOrUpdateSiteOption(siteOption, isEditing);
    if (success) {
      navigate('/dashboard/site-options');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSiteOption(prevState => ({ ...prevState, [name]: value }));
  };
console.log('hello');
  return (
    <>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {isEditing ? 'Edit' : 'Create'} Site Option
      </Typography>

      <Typography variant="h6" gutterBottom>
        Variables to use:
      </Typography>
      {siteOption.type === 'authority' ? (
        <>
          <Typography variant="caption" display="block" gutterBottom>
            {'{articleInstruction}'}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            {'{articleOutline}'}
          </Typography>
        </>
      ) : (
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

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
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
          {/* <Grid item xs={12}>
            <TextField
              select
              fullWidth
              id="type"
              name="type"
              label="Type"
              value={siteOption.type}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="authority">Authority</MenuItem>
              <MenuItem value="outline">Outline</MenuItem>
            </TextField>
          </Grid> */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ float: 'right' }}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}