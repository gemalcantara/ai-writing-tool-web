"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  CssBaseline,
  List,
  Divider,
  Collapse,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Person,
  Article,
  PermContactCalendar,
  Pages,
  Logout,
  TableChart,
  AddCircleOutline,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import useLogout from './component/Logout';
import './App.css';
import { Cog } from 'lucide-react';

const drawerWidth = 240;

interface PagesList {
  _id: string;
  name: string;
}
interface ClientsList {
  _id: string;
  name: string;
}

const SidebarList = ({ open }: { open: boolean }) => {
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
      subheader={<ListSubheader component="div">{open ? "Dashboard" : ''}</ListSubheader>}
    >
      <SidebarItem
        index={4}
        selectedIndex={selectedIndex}
        onClick={handleListItemClick}
        icon={<Article />}
        text="Create Article"
        to="/dashboard/articles"
        open={open}
      />
      <Divider />
      {/* <SidebarItem
        index={9}
        selectedIndex={selectedIndex}
        onClick={handleListItemClick}
        icon={<Article color="secondary" />}
        text="Constellation Create Article"
        to="/constellation/articles/create"
        open={open}
        isConstellation={true}
      /> */}
      <Divider />
      <SidebarItem
        index={7}
        selectedIndex={selectedIndex}
        onClick={handleListItemClick}
        icon={<TableChart />}
        text="Article Output Lists"
        to="/dashboard/articles/view"
        open={open}
      />
      {/* <Tooltip title={open ? "" : "Page Templates"} placement="right">
        <ListItemButton selected={selectedIndex === 1} onClick={() => { handleClickPage(); handleListItemClick(1); }}>
          <ListItemIcon><Pages /></ListItemIcon>
          {open && <ListItemText primary="Page Templates" />}
          {open && (page ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip> */}
      <Collapse in={page && open} timeout="auto" unmountOnExit><PageList /></Collapse>

      <Tooltip title={open ? "" : "Client"} placement="right">
        <ListItemButton selected={selectedIndex === 2} onClick={() => { handleClickClient(); handleListItemClick(2); }}>
          <ListItemIcon><PermContactCalendar /></ListItemIcon>
          {open && <ListItemText primary="Client" />}
          {open && (client ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip>
      <Collapse in={client && open} timeout="auto" unmountOnExit><ClientList /></Collapse>
      <Divider />

      <SidebarItem index={6} selectedIndex={selectedIndex} onClick={handleListItemClick} icon={<Person />} text="Users" to="/dashboard/users" open={open} />
      {/* <SidebarItem index={11} selectedIndex={selectedIndex} onClick={handleListItemClick} icon={<Person />} text="Profile" to="/dashboard/users/profile" open={open} /> */}
      <SidebarItem index={12} selectedIndex={selectedIndex} onClick={handleListItemClick} icon={<Cog />} text="Site Options" to="/dashboard/site-options" open={open} />
      <Tooltip title={open ? "" : "Logout"} placement="right">
        <ListItemButton selected={selectedIndex === 5} onClick={logout}>
          <ListItemIcon><Logout /></ListItemIcon>
          {open && <ListItemText primary="Logout" />}
        </ListItemButton>
      </Tooltip>
      <Divider />
    </List>
  );
};

const SidebarItem = ({ index, selectedIndex, onClick, icon, text, to, open, isConstellation }: any) => (
  <Tooltip title={open ? "" : text} placement="right">
    <ListItemButton selected={selectedIndex === index} onClick={() => onClick(index)} component={Link} to={to}>
      <ListItemIcon>{icon}</ListItemIcon>
      {open && (
        index === 4 ||  index === 9? 
          <ListItemText primary={text} classes={{primary: isConstellation ? "awt-font-large awt-constellation" : "awt-font-large"}} />
          : <ListItemText primary={text} />
      )}
    </ListItemButton>
  </Tooltip>
);

const ClientList = () => {
  const [clients, setClients] = useState<ClientsList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', error);
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
        <ListItem key={client._id} disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate(`/dashboard/clients/view/${client._id}`)}>
            <ListItemText primary={client.name} />
          </ListItemButton>
        </ListItem>
      ))}
      <Divider />
      <ListItemButton sx={{ pl: 4 }} component={Link} to="/dashboard/clients/create">
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
        const response = await fetch('/api/pages');
        if (!response.ok) {
          throw new Error('Failed to fetch pages');
        }
        const data = await response.json();
        setPages(data);
      } catch (error) {
        setError('Failed to fetch pages');
        console.error('Error fetching pages:', error);
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
        <ListItem key={page._id} disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate(`pages/view/${page._id}`)}>
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
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Paper
        elevation={4}
        sx={{
          width: open ? drawerWidth : 64,
          flexShrink: 0,
          height: '100vh',
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : 64,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: open ? drawerWidth : 64,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              border: 'none',
              boxShadow: 'none',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, display: open ? 'block' : 'none' }}>
              Article Writing Tool
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
          <Divider />
          <SidebarList open={open} />
        </Drawer>
      </Paper>
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: open ? `${drawerWidth}px` : '64px' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ClippedDrawer;