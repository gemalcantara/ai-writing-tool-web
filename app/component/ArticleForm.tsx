"use client"
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Divider, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CookiesProvider, useCookies  } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import Sections from './Sections';
import ArticlesResult from './ArticlesResult';
import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';
import OpenAI from "openai";

  export default function ArticlesForm({
    handleSubmitArticle,
    inputFieldStaticArticle,
    handleInputChangeStaticArticle,
    getClientGuideline,
    clients,
    getPageGuideline,
    pages,
    inputFields,
    handleInputChange,
    handleAddFields,
    handleRemoveFields,loadingResult}: any) {
  return (
     
    <div>
      <h1>Create Outline</h1>
      <form onSubmit={handleSubmitArticle}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="pageTitle"
                  label="Page Title"
                  name="pageTitle"
                  value={inputFieldStaticArticle.pageTitle}
                  variant="outlined"
                  onChange={(event) => handleInputChangeStaticArticle(event)}
                />
              </Grid>
              <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="clientLabel">Select Client</InputLabel>
                <Select
                labelId="clientLabel"
                id="selectedClient"
                name="selectedClient"
                value={inputFieldStaticArticle.selectedClient}
                label="client"
                onChange={(event) => getClientGuideline(event)}
                >
                {
                    clients.map((client :any) => (
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
                value={inputFieldStaticArticle.selectedPage}
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
              <Grid item xs={12} hidden>
              <TextField
                name="clientGuideline"
                  id="clientGuideline"
                  label="Client Guidelines"
                  value={inputFieldStaticArticle.clientGuideline}
                  onChange={(event) => handleInputChangeStaticArticle(event)}
                  multiline
                  fullWidth
                  rows={5}
                  
                />
              </Grid>
              <Grid item xs={12} hidden>
              <TextField 
                  id="articleGuideline"
                  label="Article Guidelines"
                  name="articleGuideline"
                  value={inputFieldStaticArticle.articleGuideline}
                  onChange={(event) => handleInputChangeStaticArticle(event)}
                  multiline
                  fullWidth
                  rows={5}
                />
              </Grid>
              <Grid item xs={12}>
            <TextField
              name="instruction"
              label="Article Instructions"
              variant="outlined"
                multiline
              fullWidth
              rows={5}
              value={inputFieldStaticArticle.instruction}
              onChange={(event) => handleInputChangeStaticArticle(event)}
            />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="keywords"
                  label="Keywords"
                  name="keywords"
                  value={inputFieldStaticArticle.keywords}
                  variant="outlined"
                  onChange={(event) => handleInputChangeStaticArticle(event)}
                />
              </Grid>

            </Grid>
          <br />
          <Divider />
          <br />
          <Sections 
           inputFields={inputFields}
           handleInputChange={handleInputChange}
           handleAddFields={handleAddFields}
           handleRemoveFields={handleRemoveFields}
          />
        <Button
        variant="outlined"
        color="primary"
        style={{ marginTop: '16px' }}
        fullWidth
        disabled={loadingResult}
        type='submit'
      >
        {loadingResult ? 'Generating...' : 'Generate Article'}

      </Button>
      </form>
    </div>
    
  );
}