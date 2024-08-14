"use client"
import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { CookiesProvider, useCookies  } from 'react-cookie';
import { useNavigate  } from 'react-router-dom';

const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
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
