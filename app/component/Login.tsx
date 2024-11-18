"use client"

import React, { useEffect, useState } from 'react'
import { Button, TextField, Card, CardContent, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie';
import { verifyToken } from '@/lib/jwt';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cookies, setCookie] = useCookies(['user']);
  const router = useRouter()
  const navigate = useNavigate();


  useEffect(() => {
    if (cookies.user?.session && verifyToken(cookies.user.session)) {
      navigate('/dashboard');
    }
  }, [cookies.user, navigate]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      const tokenData = {
        session: data.token,
        user: data.user,
      };
      // Store the token in a cookie
      // document.cookie = `token=${data.token}; path=/; secure; samesite=strict`
      setCookie('user', tokenData, { path: '/' });
      navigate('/dashboard')
      // router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }


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
  )
}