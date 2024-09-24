import React, { useState } from 'react';
import { Grid, TextField, Button, IconButton } from '@mui/material';
import { Add, Close } from '@mui/icons-material';

const DynamicFieldsComponent = ({linkFields, setLinkFields}:any) => {
  // Function to handle adding a new link to a specific field
  const handleAddField = (fieldName: string) => {
    setLinkFields({
      ...linkFields,
      [fieldName]: [
        ...linkFields[fieldName],
        { id: linkFields[fieldName].length + 1, value: '' }, // Add new field with unique id
      ],
    });
  };

  // Function to handle removing a link from a specific field
  const handleRemoveField = (fieldName: string, index: number) => {
    const newFields = linkFields[fieldName].filter((_: any, i: number) => i !== index);
    setLinkFields({
      ...linkFields,
      [fieldName]: newFields,
    });
  };

  // Function to handle input changes for a specific field and index
  const handleInputChange = (fieldName: string, index: number, event: any) => {
    const newValues = [...linkFields[fieldName]];
    newValues[index].value = event.target.value;
    setLinkFields({
      ...linkFields,
      [fieldName]: newValues,
    });
  };

  return (
    <Grid container spacing={2}>
      {/* Keywords Field */}
      <Grid item xs={12}>
        <h3>Keywords</h3>
        {linkFields.keywords.map((field: any, index: any) => (
          <Grid key={`${field.id}-${index}`} container spacing={2} sx={{marginBottom: '1rem'}} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                label={`Keyword ${index + 1}`}
                value={field.value}
                variant="outlined"
                onChange={(e) => handleInputChange('keywords', index, e)}
              />
            </Grid>
            <Grid item xs={1}>
            <IconButton aria-label="delete" onClick={() => handleRemoveField('keywords', index)} size="large" color="error">
                  <Close fontSize="inherit" />
                </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button 
              variant="outlined"
              endIcon={<Add />}
              color="primary" onClick={() => handleAddField('keywords')}>
          Add Keyword
        </Button>
      </Grid>

      {/* Competitor Links Field */}
      <Grid item xs={12}>
        <h3>Competitor Links</h3>
        {linkFields.competitorLinks.map((field: any, index: any) => (
          <Grid key={field.id} container spacing={2} sx={{marginBottom: '1rem'}} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                label={`Competitor Link ${index + 1}`}
                value={field.value}
                variant="outlined"
                onChange={(e) => handleInputChange('competitorLinks', index, e)}
              />
            </Grid>
            <Grid item xs={1}>
            <IconButton aria-label="delete" onClick={() => handleRemoveField('competitorLinks', index)} size="large" color="error">
                  <Close fontSize="inherit" />
                </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button 
              variant="outlined"
              endIcon={<Add />} onClick={() => handleAddField('competitorLinks')}>
          Add Competitor Link
        </Button>
      </Grid>

      {/* Internal Links Field */}
      <Grid item xs={12}>
        <h3>Internal Links</h3>
        {linkFields.internalLinks.map((field: any, index: any) => (
          <Grid key={field.id} container spacing={2} sx={{marginBottom: '1rem'}} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                label={`Internal Link ${index + 1}`}
                value={field.value}
                variant="outlined"
                onChange={(e) => handleInputChange('internalLinks', index, e)}
              />
            </Grid>
            <Grid item xs={1}>
            <IconButton aria-label="delete" onClick={() => handleRemoveField('internalLinks', index)} size="large" color="error">
                  <Close fontSize="inherit" />
                </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button 
              variant="outlined"
              endIcon={<Add />} onClick={() => handleAddField('internalLinks')}>
          Add Internal Link
        </Button>
      </Grid>

      {/* Authority Links Field */}
      <Grid item xs={12}>
        <h3>Authority Links</h3>
        {linkFields.authorityLinks.map((field: any, index: any) => (
          <Grid key={field.id} container spacing={2} sx={{marginBottom: '1rem'}} alignItems="center">
            <Grid item xs={11}>
              <TextField
                fullWidth
                label={`Authority Link ${index + 1}`}
                value={field.value}
                variant="outlined"
                onChange={(e) => handleInputChange('authorityLinks', index, e)}
              />
            </Grid>
            <Grid item xs={1}>
            <IconButton aria-label="delete" onClick={() => handleRemoveField('authorityLinks', index)} size="large" color="error">
                  <Close fontSize="inherit" />
                </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button 
              variant="outlined"
              endIcon={<Add />} onClick={() => handleAddField('authorityLinks')}>
          Add Authority Link
        </Button>
      </Grid>
    </Grid>
  );
};

export default DynamicFieldsComponent;
