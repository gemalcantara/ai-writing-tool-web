"use client"
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { CookiesProvider, useCookies  } from 'react-cookie';
import { useNavigate  } from 'react-router-dom';

const supabase = createClient(
  'https://xmocweluatwitidfqkym.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb2N3ZWx1YXR3aXRpZGZxa3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMyMDY2NTYsImV4cCI6MjAzODc4MjY1Nn0.iGSi5Obo80XXd1_g_H8_uczeCVe-294cI1cfXMuH788',
);

const useLogout = () => {
  const [_, removeCookie] = useCookies(); // Get the removeCookie function from react-cookie
  const navigate = useNavigate(); // Get navigate function from React Router
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return;
      }

      // Remove cookies
      removeCookie('user'); // Replace with your actual cookie name

     alert('Logout Success');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return logout;
};

export default useLogout;
