"use client"
import React, { useState } from 'react';
import { TextField, Button, Grid, IconButton } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const Sections = ({ inputFields, handleInputChange, handleAddFields, handleRemoveFields,handleAddFieldLink,handleRemoveFieldLink } :any) => {
  return (
    <div >
      {inputFields.map((inputField: any, index: number) => (
          <Accordion sx={{border: "solid", borderWidth: "1px"}} key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              >
              {inputField.title != '' ? inputField.title : `Section ${index + 1}`}
            </AccordionSummary>
            <AccordionDetails>
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
                <Grid item xs={11}>
                <TextField
                  name="link"
                  label="Links"
                  variant="outlined"
                  fullWidth
                  value={link.link}
                  onChange={(event) => handleInputChange(index, linkIndex, event)} // pass both parentIndex and childIndex
                />
                </Grid>
                <Grid item xs={1} alignItems="stretch" style={{ display: "flex" }}>
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
            </AccordionDetails>
          </Accordion>
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
