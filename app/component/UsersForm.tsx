"use client"

import * as React from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Grid } from '@mui/material'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useRouter } from 'next/navigation'

async function registerUser(userData: any) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create user')
    }

    const data = await response.json()
    alert(`User ${userData.name} has been created.`)
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export default function UsersForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState('')
  const router = useRouter()

  const handleChange = (event: SelectChangeEvent) => {
    setUserType(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const data = {
        email,
        password,
        name,
        user_type: userType,
      }
      await registerUser(data)
      router.push('/dashboard/users')
    } catch (error) {
      alert('Failed to create user. Please try again.')
    }
  }

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        color="text.primary"
        gutterBottom
      >
        Create User
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              label="Name"
              value={name}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              value={email}
              id="email"
              type="email"
              label="Email"
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              value={password}
              id="password"
              type="password"
              label="Password"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel id="userTypeLabel">User Type</InputLabel>
              <Select
                labelId="userTypeLabel"
                id="userType"
                value={userType}
                label="User Type"
                onChange={handleChange}
              >
                <MenuItem value={'admin'}>Admin</MenuItem>
                <MenuItem value={'user'}>User</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              style={{ float: 'right' }}
              size="large"
              id="submit"
              type="submit"
              variant="outlined"
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}