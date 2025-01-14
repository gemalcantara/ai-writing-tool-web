"use client"

import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';
import '../App.css';
import DynamicFieldsComponent from './OutlineDynamicLinks';


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
const ProgressIndicatorComparison = ({ open }: { open: boolean }) => (
  <Dialog open={open} disableEscapeKeyDown>
    <DialogTitle>Generating Brief</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Please wait while we analyze the brief.
      </DialogContentText>
      <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
    </DialogContent>
  </Dialog>
);

const ArticleOutlineForm = ({ 
  handleSubmit, 
  inputFieldStaticOutline, 
  setInputFieldStaticOutline, 
  clients, 
  constellationMode, 
  loadingOutline,
  loadingComparison, 
  linkFields, 
  setLinkFields, 
  handleGenerateComparison 
}: any) => {
  const [showProgress, setShowProgress] = useState(false);

  // Find Constellation Marketing client
  const constellationClient = clients.find((client: any) => client.name === "Constellation Marketing");

  // Set constellation client on mount if in constellation mode
  useEffect(() => {
    if (constellationMode && constellationClient) {
      setInputFieldStaticOutline({
        ...inputFieldStaticOutline,
        selectedClient: constellationClient._id,
        clientName: constellationClient.name
      });
    }
  }, [constellationMode, clients]);

  const getNameById = (list: any, id: any) => {
    const entry = list.find((item: { _id: any; }) => item._id === id);
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
                required
                disabled={constellationMode}
                onChange={(e) => setInputFieldStaticOutline({
                  ...inputFieldStaticOutline,
                  [e.target.name]: e.target.value,
                  clientName: getNameById(clients, e.target.value)
                })}
              >
                {clients.map((client: any) => (
                  <MenuItem key={client._id} value={client._id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="pageLabel">Page Template</InputLabel>
              <Select
                name="selectedPage"
                labelId="pageLabel"
                id="page"
                required
                value={inputFieldStaticOutline.selectedPage}
                label="page"
                onChange={(e) => setInputFieldStaticOutline({
                  ...inputFieldStaticOutline,
                  [e.target.name]: e.target.value,
                  pageName: getNameById(pages, e.target.value),
                  pageGuideline: pages.find((page: { _id: any; }) => page._id === e.target.value).guideline
                })}
              >
                {
                  pages.map((page: any) => (
                    <MenuItem key={page._id} value={page._id}>{page.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12}>
            <DynamicFieldsComponent linkFields={linkFields} setLinkFields={setLinkFields} />
          </Grid>
          <Grid item xs={12}>
          <Button
          variant="outlined"
          color="primary"
          style={{ marginTop: '16px' }}
          fullWidth
          disabled={loadingOutline || loadingComparison || !linkFields.competitorLinks.length}
          onClick={handleGenerateComparison}
          type='button'
        >
          {loadingComparison ? 'Analyzing...' : 'Generate Brief'}
        </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="articleDescription"
              label="Brief"
              name="articleDescription"
              value={inputFieldStaticOutline.articleDescription}
              variant="outlined"
              onChange={(e) => setInputFieldStaticOutline({
                ...inputFieldStaticOutline,
                [e.target.name]: e.target.value,
              })}
              multiline
              rows={30}
            /> 
          </Grid>
        </Grid>
        <Button
          variant="outlined"
          color="primary"
          style={{ marginTop: '16px' }}
          fullWidth
          disabled={loadingOutline || loadingComparison}
          type='submit'
        >
          {loadingOutline ? 'Generating...' : 'Generate Outline'}
        </Button>
      </form>
      <ProgressIndicator open={loadingOutline } />
      <ProgressIndicatorComparison open={loadingComparison} />
    </div>
  );
};

export default ArticleOutlineForm;