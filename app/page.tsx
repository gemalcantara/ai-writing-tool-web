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
import Login from './component/Login';
import UsersForm from './component/UsersForm';
import PagesForm from './component/PagesForm';
import ClientsForm from './component/ClientForm';
import ArticlesForm from './component/ArticleForm';
import ArticlesIndex from './component/ArticlesIndex';
import ArticlesResult from './component/ArticlesResult';

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
          <Route path="/dashboard/articles" element={< ArticlesResult /> } />
        </Route>
      </Routes>
    </Router>
  );
}
