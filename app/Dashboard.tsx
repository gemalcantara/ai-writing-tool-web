/* eslint-disable no-use-before-define */
"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  Collapse,
  Paper,
  Card,
  CardContent,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';

import { Person, Article, PermContactCalendar, Pages, Logout, TableChart, AddCircleOutline, ExpandLess, ExpandMore } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import useLogout from './component/Logout';
import './App.css';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);
const drawerWidth = 240;

interface PagesList {
  id: number;
  name: string;
}
interface ClientsList {
  id: number;
  name: string;
}

const SidebarList = () => {
  const [page, setPage] = useState(false);
  const [client, setClient] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const navigate = useNavigate();
  const logout = useLogout();

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    if (index > 2) {
      setPage(false);
      setClient(false);
    }
  };

  const handleClickPage = () => {
    setPage(!page);
    setClient(false);
  };

  const handleClickClient = () => {
    setPage(false);
    setClient(!client);
  };

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={<ListSubheader component="div">Dashboard</ListSubheader>}
    >
      <SidebarItem
        index={4}
        selectedIndex={selectedIndex}
        onClick={handleListItemClick}
        icon={<Article />}
        text="Create Article"
        to="articles/create"
      />
          <Divider />
      <SidebarItem
        index={7}
        selectedIndex={selectedIndex}
        onClick={handleListItemClick}
        icon={<TableChart />}
        text="Article Output Lists"
        to="articles/view"
      />
      <ListItemButton selected={selectedIndex === 1} onClick={() => { handleClickPage(); handleListItemClick(1); }}>
        <ListItemIcon><Pages /></ListItemIcon>
        <ListItemText primary="Page Templates" />
        {page ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={page} timeout="auto" unmountOnExit><PageList /></Collapse>

      <ListItemButton selected={selectedIndex === 2} onClick={() => { handleClickClient(); handleListItemClick(2); }}>
        <ListItemIcon><PermContactCalendar /></ListItemIcon>
        <ListItemText primary="Client" />
        {client ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={client} timeout="auto" unmountOnExit><ClientList /></Collapse>
          <Divider />

      <SidebarItem index={6} selectedIndex={selectedIndex} onClick={handleListItemClick} icon={<Person />} text="Users" to="users" />
      <SidebarItem index={11} selectedIndex={selectedIndex} onClick={handleListItemClick} icon={<Person />} text="Profile" to="users/profile" />
      <ListItemButton selected={selectedIndex === 5} onClick={logout}>
        <ListItemIcon><Logout /></ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
      <Divider />

    </List>
  );
};

const SidebarItem = ({ index, selectedIndex, onClick, icon, text, to }: any) => (
  <ListItemButton selected={selectedIndex === index} onClick={() => onClick(index)} component={Link} to={to}>
    <ListItemIcon>{icon}</ListItemIcon>
    {
      index == 4 ? 
       <ListItemText primary={text}  
      classes={{primary: "awt-font-large"}}
      /> : <ListItemText primary={text} />
    }
  </ListItemButton>
);

const ClientList = () => {
  const [clients, setClients] = useState<ClientsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <List component="div" disablePadding>
      {clients.map((client) => (
        <ListItem key={client.id} disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate(`clients/view/${client.id}`)}>
            <ListItemText primary={client.name} />
          </ListItemButton>
        </ListItem>
      ))}
      <Divider />
      <ListItemButton sx={{ pl: 4 }} component={Link} to="clients/create">
        <ListItemIcon><AddCircleOutline /></ListItemIcon>
        <ListItemText primary="Create Client" />
      </ListItemButton>
    </List>
  );
};

const PageList = () => {
  const [pages, setPages] = useState<PagesList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase.from('pages').select('*');
        if (error) throw error;
        setPages(data || []);
      } catch (error) {
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
    <List component="div" disablePadding>
      {pages.map((page) => (
        <ListItem key={page.id} disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate(`pages/view/${page.id}`)}>
            <ListItemText primary={page.name} />
          </ListItemButton>
        </ListItem>
      ))}
      <Divider />
      <ListItemButton sx={{ pl: 4 }} component={Link} to="pages/create">
        <ListItemIcon><AddCircleOutline /></ListItemIcon>
        <ListItemText primary="Create Template" />
      </ListItemButton>
    </List>
  );
};

const ClippedDrawer = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>AI Writing Tool</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <SidebarList />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Paper elevation={0}>
          <Card sx={{ minWidth: "130vh", maxWidth: "130vh", minHeight: "80vh", maxHeight: '80vh', overflowY: "scroll" }}>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Box>
  );
};

export default ClippedDrawer;
