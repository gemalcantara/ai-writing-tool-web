"use client"
import Button from '@mui/material/Button';
import { Divider, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Sections from './Sections';


  export default function ArticlesForm({
    handleSubmitArticle, inputFieldStaticArticle, setInputFieldStaticArticle, clients, pages, inputFields, loadingResult,handleAddFields,
    handleRemoveFields,
    handleInputChange,handleAddFieldLink,handleRemoveFieldLink}: any) {
      const getNameById = (list: any,id: any) => {
        const entry = list.find((item: { id: any; }) => item.id === id);
        return entry.name;
    };

    const getGuielineById = (list: any,id: any) => {
      const entry = list.find((item: { id: any; }) => item.id === id);
      return entry.guideline;
    };
  return (
     
    <div>
      <h1>Create Outline</h1>
      <form onSubmit={handleSubmitArticle}>
          <Accordion sx={{border: "solid", borderWidth: "1px"}}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Article Details
            </AccordionSummary>
            <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="pageTitle"
                  label="Page Title"
                  name="pageTitle"
                  value={inputFieldStaticArticle.pageTitle}
                  variant="outlined"
                  onChange={(event) => setInputFieldStaticArticle({...inputFieldStaticArticle,[event.target.name]: event.target.value})}
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
                  onChange={(event) => setInputFieldStaticArticle({
                    ...inputFieldStaticArticle,
                    [event.target.name]: event.target.value, 
                    clientName: getNameById(clients,event.target.value),
                    clientGuideline:  getGuielineById(clients,event.target.value)
                  })}
                  >
                  {clients.map((client :any) => (<MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>))}
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
                  onChange={(event) => setInputFieldStaticArticle({
                    ...inputFieldStaticArticle,
                    [event.target.name]: event.target.value, 
                    pageName:  getNameById(pages,event.target.value),
                    articlePrompt : getGuielineById(pages,event.target.value)
                  })}
                  >
                  {pages.map((page : any) => (<MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} hidden>
              <TextField
                name="clientGuideline"
                  id="clientGuideline"
                  label="Client Guidelines"
                  value={inputFieldStaticArticle.clientGuideline}
                  onChange={(event) => setInputFieldStaticArticle({...inputFieldStaticArticle,[event.target.name]: event.target.value})}
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
                    onChange={(event) => setInputFieldStaticArticle({...inputFieldStaticArticle,[event.target.name]: event.target.value})}
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
                  onChange={(event) => setInputFieldStaticArticle({
                    ...inputFieldStaticArticle,
                    [event.target.name]: event.target.value, 
                  })}
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
                  onChange={(event) => setInputFieldStaticArticle({...inputFieldStaticArticle,[event.target.name]: event.target.value})}
                />
              </Grid>
            </Grid>
            </AccordionDetails>
          </Accordion>
          <br />
          <Divider />
          <br />
          <Sections 
           inputFields={inputFields}
           handleInputChange={handleInputChange}
           handleAddFields={handleAddFields}
           handleRemoveFields={handleRemoveFields}
           handleAddFieldLink = {handleAddFieldLink}
           handleRemoveFieldLink = {handleRemoveFieldLink}
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