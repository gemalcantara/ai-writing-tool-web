"use client"
import React, { useState } from 'react';
import { TextField, Button, Grid, IconButton } from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const Sections = ({ inputFields,setInputFields } :any) => {
  const handleAddFields = () => {
    setInputFields([...inputFields, { sectionTitle: '', description: '', links: [{link: ''}],headingLevel: 'h2' }]);
  };
  
  const handleRemoveFields = (index: number) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };
  const handleInputChange = (
    parentIndex: number,
    childIndex: number | null,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
  
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) => {
        if (i === parentIndex) {
          // If childIndex is null, it's a top-level field (e.g., title, description)
          if (childIndex === null) {
            return { ...field, [name]: value };
          } else {
            // For nested field (i.e., links array)
            const updatedLinks = field.links.map((link: any, j: number) =>
              j === childIndex ? { ...link, [name]: value } : link
            );
            return { ...field, links: updatedLinks };
          }
        }
        return field;
      })
    );
  };
  const handleAddFieldLink = (index: number) => {
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) =>
        i === index
          ? { ...field, links: [...field.links, { link: '' }] } // Add new link object
          : field
      )
    );
  };
  const handleRemoveFieldLink = (parentIndex: number, linkIndex: number) => {
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) =>
        i === parentIndex
          ? { ...field, links: field.links.filter((_: any, j: number) => j !== linkIndex) } // Remove link at linkIndex
          : field
      )
    );
  };
  const toggleHeadingLevel = (e: any, index: number) => {
    e.stopPropagation();
    const newFields = [...inputFields];
    newFields[index].headingLevel = newFields[index].headingLevel === 'h2' ? 'h3' : 'h2';
    setInputFields(newFields);
  };

  return (
    <div >
      {inputFields.map((inputField: any, index: number) => (
          <Accordion sx={{border: "solid", borderWidth: "1px"}} key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              >
                <Button variant="text" size='large' onClick={(e) => toggleHeadingLevel(e,index)}>
                  {inputField.headingLevel === 'h2' ? 'H2 ' : 'H3 '}
                </Button>
            {inputField.headingLevel === 'h2' ? (
              <h2> { inputField.sectionTitle || `Section ${index + 1}`}</h2>
            ) : (
              <h3> { inputField.sectionTitle || `Section ${index + 1}`}</h3>
            )}
            </AccordionSummary>
            <AccordionDetails>
            <Grid container spacing={2} key={index}>

          <Grid item xs={11}>
            <TextField
              name="sectionTitle"
              label="Section Title"
              variant="outlined"
              fullWidth
              value={inputField.sectionTitle}
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
