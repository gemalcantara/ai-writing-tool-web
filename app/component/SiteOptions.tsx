"use client"

import React, { useState, useEffect } from 'react'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigate } from 'react-router-dom'

interface SiteOption {
  _id: string
  name: string
  summary?: string
  value: string
  type: 'authority' | 'outline'
}

export default function SiteOptions() {
  const [authorityPrompts, setAuthorityPrompts] = useState<SiteOption[]>([])
  const [outlinePrompts, setOutlinePrompts] = useState<SiteOption[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchSiteOptions()
  }, [])

  const fetchSiteOptions = async () => {
    try {
      const response = await fetch('/api/site-options')
      if (!response.ok) {
        throw new Error('Failed to fetch site options')
      }
      const data = await response.json()
      setAuthorityPrompts(data.filter((option: SiteOption) => option.type === 'authority'))
      setOutlinePrompts(data.filter((option: SiteOption) => option.type === 'outline'))
    } catch (error) {
      console.error('Error fetching site options:', error)
    }
  }

  const PromptTable = ({ prompts, type }: { prompts: SiteOption[], type: 'authority' | 'outline' }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prompts.map(option => (
            <TableRow key={option._id}>
              <TableCell>{option.name}</TableCell>
              <TableCell>{option.summary}</TableCell>
              <TableCell>{option.value.substring(0, 50)}...</TableCell>
              <TableCell>
              <IconButton onClick={() => navigate(`edit/${option._id}`)}>
                <EditIcon />
              </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 4 }}>
      <Typography variant="h4" gutterBottom>Site Options</Typography>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Authority Prompts</Typography>
      <PromptTable prompts={authorityPrompts} type="authority" />

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Outline Prompts</Typography>
      <PromptTable prompts={outlinePrompts} type="outline" />
    </Box>
  )
}