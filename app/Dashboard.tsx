/* eslint-disable no-use-before-define */
"use client"
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Link,
  Outlet
} from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  Person,
  Article,
  PermContactCalendar,
  Pages,
  Logout,
  TableChart,
} from '@mui/icons-material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { ListItem } from '@mui/material';
import { useState, useEffect } from 'react';
import useLogout from './component/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createClient } from '@supabase/supabase-js';


const supaBaseLink = process.env.NEXT_PUBLIC_SUPABASE_LINK;
const supaBaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase = createClient(
  supaBaseLink,
  supaBaseKey
);

const drawerWidth = 240;


interface PagesList {
  id: number;
  name: string;
}
interface ClientsList {
  id: number;
  name: string;
}
function SidebarList() {
  const [page, setPage] = React.useState(false);
  const [client, setClient] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const navigate = useNavigate();
  const logout = useLogout();
  // selectedIndex == 0 ? navigate('/dashboard/users');
  const handleListItemClick = (
    index: number,
  ) => {
    setSelectedIndex(index);
    console.log(index != 1);
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
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Dashboard
        </ListSubheader>
      }
    >
      <ListItemButton
        selected={selectedIndex === 4}
        onClick={(event) => {
          handleListItemClick( 4)
        }}
        component={Link}
        to="articles/create"
      >
        <ListItemIcon>
          <Article />
        </ListItemIcon>
        <ListItemText classes={{primary: "awt-font-large"}} primary="Create Article" />
      </ListItemButton>
      <Divider />
      <ListItemButton
        selected={selectedIndex === 7}
        onClick={(event) => {
          handleListItemClick(7)
        }}
        component={Link}
        to="articles/view"
      >
        <ListItemIcon>
          <TableChart />
        </ListItemIcon>
        <ListItemText primary="Article Output Lists" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) => {
          handleClickPage();
          handleListItemClick( 1);
        }}
      >
        <ListItemIcon>
          <Pages />
        </ListItemIcon>
        <ListItemText primary="Page Templates" />
        {page ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={page} timeout="auto" unmountOnExit>
        <PageList />
      </Collapse>
      <ListItemButton
        selected={selectedIndex === 2}
        onClick={(event) => {
          handleClickClient();
          handleListItemClick( 2);
        }}
      >
        <ListItemIcon>
          <PermContactCalendar />
        </ListItemIcon>
        <ListItemText primary="Client" />
        {client ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={client} timeout="auto" unmountOnExit>
        <ClientList />
      </Collapse>
      <Divider />
      <ListItemButton
        selected={selectedIndex === 6}
        onClick={(event) => handleListItemClick( 6)}
        component={Link}
        to="users"
      >
        <ListItemIcon>
          <Person />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 5}
        onClick={logout}
      >
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}
function ClientList() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [clients, setClients] = useState<ClientsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleListItemClick = (
    index: number,
  ) => {
    setSelectedIndex(index);
  };


  useEffect(() => {
      const fetchUsers = async () => {
        try {
          // Fetch data from Supabase
          const { data, error } = await supabase
            .from('clients') // Replace 'users' with your table name
            .select('*');
  
          if (error) throw error;
  
          // Update state with fetched data
          setClients(data || []);
        } catch (error) {
          // Handle error
          setError('Failed to fetch clients');
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    let rows = [];
    clients.map((client) => (
      rows.push( { id: client.id, name: client.name })
    ));
  return (
    <List component="div" disablePadding>
      {clients.map((client, index) => (
        <ListItem key={client.name} disablePadding>
          <ListItemButton sx={{ pl: 4 }} 
            selected={selectedIndex === client.id}
            onClick={(event) => {handleListItemClick( client.id); navigate(`clients/view/${client.id}`)}}
          >
            <ListItemText primary={client.name} />
          </ListItemButton >
        </ListItem>
      ))}
      <Divider />
      <ListItem key='Create Client' disablePadding>
          <ListItemButton sx={{ pl: 4 }} 
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick( 0)}
            component={Link}
            to="clients/create"
                        >
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
            <ListItemText primary="Create Client" />
          </ListItemButton>
        </ListItem>
    </List>
  );
}
function PageList() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [pages, setPages] = useState<PagesList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleListItemClick = (
    index: number,
  ) => {
    setSelectedIndex(index);
  };


  useEffect(() => {
      const fetchUsers = async () => {
        try {
          // Fetch data from Supabase
          const { data, error } = await supabase
            .from('pages') // Replace 'users' with your table name
            .select('*');
  
          if (error) throw error;
  
          // Update state with fetched data
          setPages(data || []);
        } catch (error) {
          // Handle error
          setError('Failed to fetch pages');
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    let rows = [];
    pages.map((pages) => (
      rows.push( { id: pages.id, name: pages.name })
    ));
  return (
    <List component="div" disablePadding>

      {pages.map((page, index) => (
        <ListItem key={page.name} disablePadding>
          <ListItemButton sx={{ pl: 4 }} 
            selected={selectedIndex === page.id}
            onClick={(event) => {handleListItemClick( page.id); navigate(`pages/view/${page.id}`)}}
          >
            <ListItemText primary={page.name} />
          </ListItemButton >
        </ListItem>
      ))}
      <Divider />
      <ListItem key='Create Template' disablePadding>
          <ListItemButton sx={{ pl: 4 }} 
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick( 0)}
            component={Link}
            to="pages/create"
                        >
          <ListItemIcon>
            <AddCircleOutlineIcon />
          </ListItemIcon>
            <ListItemText primary="Create Template" />
          </ListItemButton>
        </ListItem>
    </List>
  );
}
export default function ClippedDrawer() {

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            AI Writing Tool
          </Typography>
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
        <Box sx={{ overflow: 'auto' }}>
          <SidebarList />
          <Divider />
        </Box>
      </Drawer>
      <Outlet />
    </Box>
  );
}
