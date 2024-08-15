"use client"
import React, { useState } from 'react';
import { TextField, Button, Grid, Divider } from '@mui/material';

const Sections = ({ inputFields, handleInputChange, handleAddFields, handleRemoveFields }) => {

  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log('Input Fields:', inputFields);
    // Handle form submission logic here
  };

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
              onChange={(event) => handleInputChange(index, event)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="details"
              label="Section Details"
              variant="outlined"
                  multiline
              fullWidth
              rows={5}
              value={inputField.details}
              onChange={(event) => handleInputChange(index, event)}
            />
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
