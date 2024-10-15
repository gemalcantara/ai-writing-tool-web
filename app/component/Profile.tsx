"use client";

import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);

interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
  supabase_id: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } else if (data) {
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
      setUserType(data.user_type);
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;

    const updates = {
      name,
      email,
      user_type: userType,
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('supabase_id', profile.supabase_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
      return;
    }

    if (password.trim() !== '') {
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) {
        console.error('Error updating password:', passwordError);
        setError('Failed to update password');
        return;
      }
    }

    if (email !== profile.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        console.error('Error updating email:', emailError);
        setError('Failed to update email');
        return;
      }
    }

    setProfile({ ...profile, ...updates });
    setIsEditing(false);
    setPassword(''); // Clear the password field after update
    setError('');
    alert('Profile updated successfully');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    } else {
      router.push('/login');
    }
  };

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            gutterBottom
          >
            User Profile
          </Typography>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
        </Grid>
        <Grid item xs={2}>
          {!isEditing ? (
            <Button style={{ float: 'right' }} variant="outlined" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            ""
          )}
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
          />
        </Grid>
        {isEditing && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'} // Toggle between 'password' and 'text'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Leave blank to keep current password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <FormControl fullWidth disabled={!isEditing}>
            <InputLabel id="user-type-label">User Type</InputLabel>
            <Select
              labelId="user-type-label"
              value={userType}
              label="User Type"
              onChange={(e) => setUserType(e.target.value as 'admin' | 'user')}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          {!isEditing ? (
            ""
          ) : (
            <>
              <Button variant="contained" onClick={handleUpdate} sx={{ mr: 2 }}>
                Save Changes
              </Button>
              <Button variant="outlined" onClick={() => {
                setIsEditing(false);
                setPassword('');
              }}>
                Cancel
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}