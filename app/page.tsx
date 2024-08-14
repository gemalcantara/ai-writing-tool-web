"use client"
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import * as React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Dashboard from './Dashboard';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Users from './component/Users';
import Pages from './component/PagesIndex';
import Client from './component/Client';
import Articles from './component/ArticlesIndex';
import Login from './component/Login';
import UsersForm from './component/UsersForm';
import PagesForm from './component/PagesForm';
import ClientsForm from './component/ClientForm';
import ArticlesForm from './component/ArticleForm';

const supabase = createClient("https://xmocweluatwitidfqkym.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtb2N3ZWx1YXR3aXRpZGZxa3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMyMDY2NTYsImV4cCI6MjAzODc4MjY1Nn0.iGSi5Obo80XXd1_g_H8_uczeCVe-294cI1cfXMuH788");


// async function createUser(params:type) {
//   const { user, error } = await supabase.auth.signUp({
//     email: 'gem.alcantara.ga@gmail.com',
//     password: 'gem.alcantara.ga@gmail.com',
//   })
// }
export default function App() {
  // console.log(createUser());
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Login /> } />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="/dashboard/users" element={ <Users /> } />
          <Route path="/dashboard/users/create" element={ <UsersForm /> } />
          <Route path="/dashboard/pages" element={ <Pages /> } />
          <Route path="/dashboard/pages/create" element={ <PagesForm /> } />
          <Route path="/dashboard/pages/view/:pageId" element={ <Pages /> } />
          <Route path="/dashboard/clients" element={ <Client /> } />
          <Route path="/dashboard/clients/create" element={ <ClientsForm /> } />
          <Route path="/dashboard/clients/view/:clientId" element={ <Client /> } />
          <Route path="/dashboard/articles/create" element={< ArticlesForm /> } />
          <Route path="/dashboard/articles" element={< Articles /> } />
        </Route>
      </Routes>
    </Router>
  );
}
