import React, { useEffect, useState } from 'react';
import { generateOutline } from '../helpers/openaiApi';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../App.css';
const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);
const ArticleOutlineForm = ({handleSubmit,inputFieldStaticOutline,getClientGuideline,clients,handleInputChangeStaticOutline,loading,outline,getPageGuideline,pages}:any) => {
  
  return (
 
    <div>
      <h1>Create Outline</h1>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
        <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="clientLabel">Select Client</InputLabel>
                <Select
                labelId="clientLabel"
                id="selectedClient"
                name="selectedClient"
                value={inputFieldStaticOutline.selectedClient}
                label="client"
                onChange={(event) => getClientGuideline(event)}
                >
                {
                    clients.map((client : any) => (
                        <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))
                }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              </Grid>
              <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="pageLabel">Page Template</InputLabel>
                <Select
                name="selectedPage"
                labelId="pageLabel"
                id="page"
                value={inputFieldStaticOutline.selectedPage}
                label="page"
                onChange={(event) => getPageGuideline(event)}
                >
                {
                    pages.map((page : any) => (
                        <MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>
                    ))
                }
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12}>
            <TextField
              fullWidth
              id="articleDescription"
              label="Article Instruction"
              name="articleDescription"
              value={inputFieldStaticOutline.articleDescription}
              variant="outlined"
              onChange={(e) => handleInputChangeStaticOutline(e)}
              multiline
              rows={5}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="keywords"
              label="Keywords (comma-separated)"
              name="keywords"
              value={inputFieldStaticOutline.keywords}
              variant="outlined"
              onChange={(e) => handleInputChangeStaticOutline(e)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="competitorLinks"
              label="Competitor Links (comma-separated)"
              name="competitorLinks"
              value={inputFieldStaticOutline.competitorLinks}
              variant="outlined"
              onChange={(e) => handleInputChangeStaticOutline(e)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="internalLinks"
              label="Internal Links (comma-separated)"
              name="internalLinks"
              value={inputFieldStaticOutline.internalLinks}
              variant="outlined"
              onChange={(e) => handleInputChangeStaticOutline(e)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="authorityLinks"
              label="Authority Links (comma-separated)"
              name="authorityLinks"
              value={inputFieldStaticOutline.authorityLinks}
              variant="outlined"
              onChange={(e) => handleInputChangeStaticOutline(e)}
            />
          </Grid>
        </Grid>
        <Button
        variant="outlined"
        color="primary"
        style={{ marginTop: '16px' }}
        fullWidth
        disabled={loading}
        type='submit'
      >
        {loading ? 'Generating...' : 'Generate Outline'}
      </Button>
      </form>

      {/* {outline && (
        <div>
          <h2>Generated Article Outline:</h2>
          <Markdown className="process-text" remarkPlugins={[remarkGfm]}>{outline}

          </Markdown>
        </div>
      )} */}
    </div>
  );
};

export default ArticleOutlineForm;
