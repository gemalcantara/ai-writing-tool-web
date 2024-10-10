import React, { useEffect, useState } from 'react';
import { generateOutline } from '../helpers/openaiApi';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../App.css';
import DynamicFieldsComponent from './OutlineDynamicLinks';
const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
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

const ArticleOutlineForm = ({handleSubmit, inputFieldStaticOutline, setInputFieldStaticOutline, clients, pages,loadingOutline,linkFields, setLinkFields}:any) => {
  const getNameById = (list: any,id: any) => {
    const entry = list.find((item: { id: any; }) => item.id === id);
    return entry.name;
};
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
                  clientName: getNameById(clients,e.target.value)
                })}
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
                  pageName:  getNameById(pages,e.target.value)
                })}
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
              onChange={(e) => setInputFieldStaticOutline({
                ...inputFieldStaticOutline,
                [e.target.name]: e.target.value, 
              })}
              multiline
              rows={5}
            />
          </Grid>
        <Grid item xs={12}>
          <DynamicFieldsComponent linkFields={linkFields} setLinkFields={setLinkFields}></DynamicFieldsComponent>
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
