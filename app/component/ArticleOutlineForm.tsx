"use client"

import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';
import '../App.css';
import DynamicFieldsComponent from './OutlineDynamicLinks';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

const ProgressIndicator = ({ open }: { open: boolean }) => (
  <Dialog open={open} disableEscapeKeyDown>
    <DialogTitle>Generating Outline</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Please wait while we generate your article outline.
      </DialogContentText>
      <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
    </DialogContent>
  </Dialog>
);

function AiToolSelector() {
  let aiTool = sessionStorage.getItem('aiTool');
  const [tool, setTool] = useState(aiTool);
  if (!aiTool) {
    sessionStorage.setItem('aiTool', 'chatGpt');
    setTool('chatGpt');
  }
  const handleChange = (event: any) => {
    setTool(event.target.value);
    sessionStorage.setItem('aiTool', event.target.value)
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="llm">LLM</InputLabel>
      <Select
        value={tool}
        onChange={handleChange}
        label="LLM"
        fullWidth
        id="llm"
      >
        <MenuItem value={'chatGpt'}>Chat GPT</MenuItem>
        <MenuItem value={'claude'}>Claude AI</MenuItem>
      </Select>
    </FormControl>
  );
}

const ArticleOutlineForm = ({ handleSubmit, inputFieldStaticOutline, setInputFieldStaticOutline, clients, pages, loadingOutline, linkFields, setLinkFields }: any) => {
  const [showProgress, setShowProgress] = useState(false);

  const getNameById = (list: any, id: any) => {
    const entry = list.find((item: { id: any; }) => item.id === id);
    return entry.name;
  };

  useEffect(() => {
    setShowProgress(loadingOutline);
  }, [loadingOutline]);

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
                onChange={(e) => setInputFieldStaticOutline({
                  ...inputFieldStaticOutline,
                  [e.target.name]: e.target.value,
                  clientName: getNameById(clients, e.target.value)
                })}
              >
                {
                  clients.map((client: any) => (
                    <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
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
                onChange={(e) => setInputFieldStaticOutline({
                  ...inputFieldStaticOutline,
                  [e.target.name]: e.target.value,
                  pageName: getNameById(pages, e.target.value)
                })}
              >
                {
                  pages.map((page: any) => (
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
              onChange={(e) => setInputFieldStaticOutline({
                ...inputFieldStaticOutline,
                [e.target.name]: e.target.value,
              })}
              multiline
              rows={5}
            />
          </Grid>
          <Grid item xs={12}>
            <DynamicFieldsComponent linkFields={linkFields} setLinkFields={setLinkFields} />
          </Grid>
        </Grid>
        <Button
          variant="outlined"
          color="primary"
          style={{ marginTop: '16px' }}
          fullWidth
          disabled={loadingOutline}
          type='submit'
        >
          {loadingOutline ? 'Generating...' : 'Generate Outline'}
        </Button>
      </form>
      <ProgressIndicator open={showProgress} />
    </div>
  );
};

export default ArticleOutlineForm;