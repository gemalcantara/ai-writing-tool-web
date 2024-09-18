import React, { useEffect, useState } from 'react';
import { generateOutline } from '../helpers/openaiApi';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../App.css';
import FormLinks from './Links';
const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);
const ArticleOutlineForm = ({handleSubmit,inputFieldStaticOutline,getClientGuideline,clients,handleInputChangeStaticOutline,loading,outline,getPageGuideline,pages,inputFieldsKeywords,
  inputFieldsAuthorityLinks,
  inputFieldsCompetitorLinks,
  inputFieldsInternalLinks}:any) => {
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
          <FormLinks
          inputFields = {inputFieldsKeywords[0]}
          setInputFields = {inputFieldsKeywords[1]}
          name = 'keywords'
          label = 'Keywords'
          ></FormLinks>
          </Grid>
          <Grid item xs={12}>
            <FormLinks
            inputFields = {inputFieldsCompetitorLinks[0]}
            setInputFields = {inputFieldsCompetitorLinks[1]}
            name = 'competitorLinks'
            label = 'Competitor Links'
            ></FormLinks>
          </Grid>
          <Grid item xs={12}>
          <FormLinks
            inputFields = {inputFieldsInternalLinks[0]}
            setInputFields = {inputFieldsInternalLinks[1]}
            name = 'internalLinks'
            label = 'Internal Links'
            ></FormLinks>
          </Grid>
          <Grid item xs={12}>
          <FormLinks
            inputFields = {inputFieldsAuthorityLinks[0]}
            setInputFields = {inputFieldsAuthorityLinks[1]}
            name = 'authorityLinks'
            label = 'Authority Links'
            ></FormLinks>
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
