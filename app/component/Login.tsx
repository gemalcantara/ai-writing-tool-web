"use client"

import React, { useState, useEffect } from 'react';
import { Button, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_LINK!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cookies, setCookie] = useCookies(['user']);
  const navigate = useNavigate();

  useEffect(() => {
    if (cookies.user?.session) {
      navigate('/dashboard');
    }
  }, [cookies.user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const loginDate = {
        user: data.user,
        session: data.session?.access_token
      };
      setCookie('user', loginDate, { path: '/' });
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login'>
      <Card sx={{ minWidth: 300, maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            AI Writing Tool
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              id="email"
              value={email}
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              id="password"
              value={password}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              size="large"
              type="submit"
              variant="outlined"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}