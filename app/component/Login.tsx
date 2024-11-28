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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (cookies.user?.session && verifyToken(cookies.user.session)) {
        navigate('/dashboard');
      } else {
        router.push('/login');
      }
    }, 1000); // Fake loading for 1 seconds
  }, [cookies.user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size="4rem"/>
      </div>
    );
  }

  return
}