"use client"
import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import '../App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createClient } from '@supabase/supabase-js';
import { CookiesProvider, useCookies  } from 'react-cookie';
import { useNavigate  } from 'react-router-dom';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState(null);
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();
  useEffect(() => {
    // Check for the cookie
    if (cookies.user) { 
      if (cookies.user.session) {
        // Redirect to the dashboard if the cookie is set
        navigate('/dashboard');
      }
    }
  }, [navigate]);
  
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      // setError(error.message);
    } else {
      let loginDate = {
        user: data.session.user,
        session: data.session.access_token
      }
      setCookie('user', loginDate, { path: '/' });
      alert('Login Success');
      navigate('/dashboard');

    }
  };

  return (
    <Card sx={{ minWidth: 500 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          AI Writing Tool
        </Typography>
        <form onSubmit={handleSubmit}>
          <center>
            <TextField
              id="email"
              value={email}
              fullWidth
              style={{ paddingRight: '10px' }}
              label="Email"
              type="email"
              variant="standard"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <TextField
              id="password"
              value={password}
              label="Password"
              type="password"
              fullWidth
              style={{ paddingRight: '10px' }}
              variant="standard"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <Button
              size="large"
              type="submit"
              variant="outlined"
              style={{ marginTop: '1rem' }}
            >
              Login
            </Button>
          </center>
        </form>
      </CardContent>
    </Card>
  );
}
