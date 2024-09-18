"use client"
import React, { useState } from 'react';
import { TextField, Button, Grid, Divider } from '@mui/material';

const FormLinks = ({inputFields, setInputFields,name,label}: any) =>  {
const handleAddFields = () => {
  setInputFields([...inputFields, { [label]: '' }]);
};
const handleRemoveFields = (index: number) => {
  const values = [...inputFields];
  values.splice(index, 1);
  setInputFields(values);
};
  const handleInputChange = (index: number, event: any) => {
    const values = [...inputFields];
    values[index] = {
      ...values[index],
      [event.target.name]: event.target.value
    };
    setInputFields(values);
  };
  return (<div >
      {inputFields.map((inputField: any, index: number) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={12}>
            <TextField
              name={name}
              label={label}
              variant="outlined"
              fullWidth
              value={inputField.link}
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
    </div>)
}

export default FormLinks;
