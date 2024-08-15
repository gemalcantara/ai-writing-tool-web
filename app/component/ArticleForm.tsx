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

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;;
const organization = process.env.NEXT_PUBLIC_CHAT_GPT_PROJECT_ID;
const project = process.env.NEXT_PUBLIC_CHAT_GPT_organization;

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

interface PagesList {
    id: number;
    name: string;
  }
  interface ClientsList {
    id: number;
    name: string;
  }
  interface InputFields {
    instruction: string;
    title: string;
    details: string;
  }
  interface InputStaticFields {
   instruction:string ;
   clientGuideline: string ;
   articleGuideline: string ;
   selectedClient: string ;
   clientName: string ;
   pageName: string ;
   selectedPage: string ;
   keywords: string;
  }
  export default function ArticlesForm() {

  const router = useRouter();
  const navigate = useNavigate();
      

  // sections
  const [clientDetails, setClientDetails] = useState(0);
  const [pageDetails, setPageDetails] = useState(0);

  const [inputFields, setInputFields] = useState<InputFields[]>([{instruction: '',title: '', details: ''}]);
  const [inputFieldStatic, setInputFieldStatic] = useState<InputStaticFields>({instruction:'',clientGuideline: '',articleGuideline: '',selectedClient: '',clientName: '',pageName: '',selectedPage: '',keywords: ''});
  const [clients, setClients] = useState<ClientsList[]>([]);
  const [pages, setPages] = useState<PagesList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const getClientGuideline = (event: any) => {
    const { name, value } = event.target;
    setClientDetails(value);
}

const getPageGuideline = (event: any) => {
    const { name, value } = event.target;
    setPageDetails(value);
}
useEffect(() => {
    if (clientDetails) {
      const getGuideline = async () => {
        try {
          // Fetch data from Supabase
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id',clientDetails)
            .single();
  
          if (error) throw error;
  
          // Update state with fetched data
            setInputFieldStatic({
              ...inputFieldStatic,
              ['selectedClient']: data.id, // Only update the specific field that changed
              ['clientName']: data.name, // Only update the specific field that changed
              ['clientGuideline']: data.guideline,
          });
          // setClientDetails(data || []);
        } catch (error) {
          // Handle error
          // setError('Failed to fetch clients');
        } finally {
          setLoading(false);
        }
      };
      getGuideline();
    }
  }, [clientDetails]);
useEffect(() => {
  if (pageDetails) {
    const getGuideline = async () => {
      try {
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('id',pageDetails)
          .single();

        if (error) throw error;

        // Update state with fetched data
          setInputFieldStatic({
            ...inputFieldStatic,
            ['selectedPage']: data.id, // Only update the specific field that changed
            ['pageName']: data.name, // Only update the specific field that changed
            ['articleGuideline']: data.guideline,
        });
        // setClientDetails(data || []);
      } catch (error) {
        // Handle error
        // setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };
    getGuideline();
  }
}, [pageDetails]);




const handleAddFields = () => {
  setInputFields([...inputFields, { instruction: '',title: '', details: '' }]);
};

const handleRemoveFields = (index: number) => {
  const values = [...inputFields];
  values.splice(index, 1);
  setInputFields(values);
};
const handleInputChangeStatic = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputFieldStatic({
      ...inputFieldStatic,
      [name]: value, // Only update the specific field that changed
    });
    // console.log(inputFieldStatic)
  };
  const handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const values = [...inputFields];
    values[index] = {
      ...values[index],
      [event.target.name]: event.target.value
    };
    setInputFields(values);
  };
  
  const handleSubmit = async () => {
    let formData = {sections:inputFields, main:inputFieldStatic};
    console.log(formData);
    // Store the object in session storage
    sessionStorage.setItem('articleResult', JSON.stringify(formData));

    // Redirect to the result page
    navigate('/dashboard/articles')
  };


  useEffect(() => {
      const fetchClients = async () => {
        try {
          // Fetch data from Supabase
          const { data, error } = await supabase
            .from('clients')
            .select('*');
  
          if (error) throw error;
  
          // Update state with fetched data
          setClients(data || []);
        } catch (error) {
          // Handle error
          setError('Failed to fetch clients');
        } finally {
          setLoading(false);
        }
      };
      fetchClients();
    }, []);
    useEffect(() => {
        const fetchPages = async () => {
          try {
            // Fetch data from Supabase
            const { data, error } = await supabase
              .from('pages')
              .select('*');
    
            if (error) throw error;
    
            // Update state with fetched data
            setPages(data || []);
          } catch (error) {
            // Handle error
            setError('Failed to fetch pages');
          } finally {
            setLoading(false);
          }
        };
        fetchPages();
      }, []);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
  return (
    <Box component="main"  sx={{ width: '100vh',height: '90vh', flexGrow: 1, p: 3}}>
      <Toolbar />
      <Card sx={{ minWidth: '100vh',height: '80vh',overflowY: 'scroll' }} >
        <CardContent>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            Create Article
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="clientLabel">Client Type</InputLabel>
                <Select
                labelId="clientLabel"
                id="selectedClient"
                name="selectedClient"
                value={inputFieldStatic.selectedClient}
                label="client"
                onChange={(event) => getClientGuideline(event)}
                >
                {
                    clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))
                }
                </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="pageLabel">Page Type</InputLabel>
                <Select
                name="selectedPage"
                labelId="pageLabel"
                id="page"
                value={inputFieldStatic.selectedPage}
                label="page"
                onChange={(event) => getPageGuideline(event)}
                >
                {
                    pages.map((page) => (
                        <MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>
                    ))
                }
                </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12}>
              <TextField
                name="clientGuideline"
                  id="clientGuideline"
                  label="Client Guideline"
                  value={inputFieldStatic.clientGuideline}
                  onChange={(event) => handleInputChangeStatic(event)}
                  multiline
                  fullWidth
                  rows={5}
                />
              </Grid>
              <Grid item xs={12}>
              <TextField
                  id="articleGuideline"
                  label="Article Guideline"
                  name="articleGuideline"
                  value={inputFieldStatic.articleGuideline}
                  onChange={(event) => handleInputChangeStatic(event)}
                  multiline
                  fullWidth
                  rows={5}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="keywords"
                  label="Keywords"
                  name="keywords"
                  value={inputFieldStatic.keywords}
                  variant="outlined"
                  onChange={(event) => handleInputChangeStatic(event)}
                />
              </Grid>
              <Grid item xs={12}>
            <TextField
              name="instruction"
              label="Article Instruction"
              variant="outlined"
                multiline
              fullWidth
              rows={5}
              value={inputFieldStatic.instruction}
              onChange={(event) => handleInputChangeStatic(event)}
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
        type='submit'
      >
        Submit
      </Button>
      </form>
        </CardContent>
      </Card>
    </Box>
  );
}