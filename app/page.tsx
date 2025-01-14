"use client"
import {
  MemoryRouter as Router,
  // HashRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import * as React from 'react';
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
import ArticlesResult from './component/ArticlesResult';
import ArticleHistory from './component/ArticleHistory';
import ArticleHistoryView from './component/ArticlesHistoryView';
import ArticleSteps from './component/ArticleSteps';
import ArticlesHistoryOutline from './component/ArticlesHistoryOutlineView';
import Profile from './component/Profile';
import ArticleView from './component/ArticleView';
import SiteOptions from './component/SiteOptions';
import SiteOptionForm from './component/SiteOptionsForm';
import ChooseCreateMode from './component/ChooseCreateMode';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Login /> } />
        
        {/* Main Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="users" element={ <Users /> } />
          <Route path="site-options" element={ <SiteOptions /> } />
          <Route path="site-options/new" element={<SiteOptionForm />} />
          <Route path="site-options/edit/:id" element={<SiteOptionForm />} />  
          <Route path="users/create" element={ <UsersForm /> } />
          {/* <Route path="users/profile" element={ <Profile /> } /> */}
          {/* <Route path="pages" element={ <Pages /> } /> */}
          {/* <Route path="pages/create"  element={ <PagesForm /> } /> */}
          {/* <Route path="pages/view/:pageId" element={ <Pages /> } /> */}
          <Route path="clients" element={ <Client /> } />
          <Route path="clients/create" element={ <ClientsForm /> } />
          <Route path="clients/view/:clientId" element={ <Client /> } />
          <Route path="articles" element={< ChooseCreateMode /> } />
          <Route path="articles/create" element={< ArticleSteps /> } />
          <Route index element={< ArticleSteps /> } />
          <Route path="articles/create/:articleId" element={< ArticleSteps /> } />
          <Route path="articles/view" element={< ArticleHistory /> } />
          <Route path="articles/view/:articleId" element={< ArticleView /> } />
          <Route path="articles/view/:articleId/output" element={< ArticlesHistoryOutline /> } />
        </Route>

        {/* Constellation Routes */}
        <Route path="/constellation" element={<Dashboard />}>
          <Route path="articles/create" element={< ArticleSteps constellationMode={true} /> } />
          <Route path="articles/create/:articleId" element={< ArticleSteps constellationMode={true} /> } />
        </Route>
      </Routes>
    </Router>
  );
}
