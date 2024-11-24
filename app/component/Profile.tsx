"use client"

import React, { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/navigation"
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useCookies } from "react-cookie"
import { verifyToken } from "@/lib/jwt"

interface UserProfile {
  _id: string
  name: string
  email: string
  user_type: 'admin' | 'user'
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'admin' | 'user'>('user')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cookies, setCookie] = useCookies(['user']);

  const router = useRouter()
  useEffect(() => {
    if (cookies.user?.user.id && verifyToken(cookies.user.session)) {
      fetchProfile(cookies.user.user.id)

    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
      setName(data.name)
      setEmail(data.email)
      setUserType(data.user_type)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    }
  }

  const handleUpdate = async () => {
    if (!profile) return

    const updates = {
      name,
      email,
      user_type: userType,
      password: password.trim() !== '' ? password : undefined,
    }

    try {
      const response = await fetch(`/api/users/${profile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
      setPassword('')
      setError('')
      alert('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to logout')
      }
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out')
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  if (!profile) {
    return <Typography>Loading...</Typography>
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
            disabled
          />
        </Grid>
        {isEditing && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
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
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button variant="contained" onClick={handleUpdate} sx={{ mr: 2 }}>
                Save Changes
              </Button>
              <Button variant="outlined" onClick={() => {
                setIsEditing(false)
                setPassword('')
              }}>
                Cancel
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </>
  )
}