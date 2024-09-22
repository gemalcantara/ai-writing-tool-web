"use client"
import React, { useState } from 'react';
import { TextField, Button, Grid, Divider, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import { Add, BorderAll, Close, DeleteOutlineRounded } from '@mui/icons-material';

const Sections = ({ inputFields, handleInputChange, handleAddFields, handleRemoveFields,handleAddFieldLink,handleRemoveFieldLink } :any) => {
console.log(inputFields);
  return (
    <div >
      {inputFields.map((inputField: any, index: number) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Section Title"
              variant="outlined"
              fullWidth
              value={inputField.title}
              onChange={(event) => handleInputChange(index,null, event)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Section Details"
              variant="outlined"
                  multiline
              fullWidth
              rows={5}
              value={inputField.description}
              onChange={(event) => handleInputChange(index,null, event)}
            />
          </Grid>
          {inputField.links.map((link: any, linkIndex: number) => (
            <Grid container spacing={2} key={linkIndex} style={{ marginLeft: '1rem',marginTop: '1rem' }} >
              <Grid container>
                <Grid item>
                <TextField
                  name="link"
                  label="Links"
                  variant="outlined"
                  value={link.link}
                  onChange={(event) => handleInputChange(index, linkIndex, event)} // pass both parentIndex and childIndex
                />
                </Grid>
                <Grid item alignItems="stretch" style={{ display: "flex" }}>
                <IconButton aria-label="delete" onClick={() => handleRemoveFieldLink(index, linkIndex)} size="large" color="error">
                  <Close fontSize="inherit" />
                </IconButton>
                </Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleAddFieldLink(index)} // add a new link
              endIcon={<Add />}
            >
              Add Link
          </Button>
        </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              style={{ float: 'right',marginBottom: '16px' }}
              onClick={() => handleRemoveFields(index)}
            >
              Remove
            </Button>
            
          </Grid>
        </Grid>
      ))}
           
      <Button
        variant="outlined"
        color="warning"
        onClick={handleAddFields}
        style={{ marginTop: '16px' }}
        fullWidth
      >
        Add More Section
      </Button>
    </div>
  );
};

export default Sections;
