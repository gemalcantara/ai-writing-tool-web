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
import { createClient } from '@supabase/supabase-js'
import { Link, useNavigate } from 'react-router-dom'

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_LINK, process.env.NEXT_PUBLIC_SUPABASE_KEY);

interface SiteOption {
  id: string
  name: string
  summary?: string
  value: string
  type: 'authority' | 'outline'
}

export default function SiteOptions() {
  const [authorityPrompts, setAuthorityPrompts] = useState<SiteOption[]>([])
  const [outlinePrompts, setOutlinePrompts] = useState<SiteOption[]>([])
  const [editingOption, setEditingOption] = useState<SiteOption | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newOption, setNewOption] = useState<Omit<SiteOption, 'id'>>({ name: '', summary: '', value: '', type: 'authority' })
  const [openDialog, setOpenDialog] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    fetchSiteOptions()
  }, [])

  const fetchSiteOptions = async () => {
    const { data: authorityData, error: authorityError } = await supabase
      .from('site_options')
      .select('*')
      .eq('type', 'authority')

    const { data: outlineData, error: outlineError } = await supabase
      .from('site_options')
      .select('*')
      .eq('type', 'outline')

    if (authorityError) console.error('Error fetching authority prompts:', authorityError)
    if (outlineError) console.error('Error fetching outline prompts:', outlineError)

    setAuthorityPrompts(authorityData || [])
    setOutlinePrompts(outlineData || [])
  }

  const handleEdit = (option: SiteOption) => {
    setEditingOption(option)
    setIsCreating(false)
    setOpenDialog(true)
  }

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('site_options')
        .insert([newOption])
        .select()

      if (error) throw error

      if (data) {
        if (newOption.type === 'authority') {
          setAuthorityPrompts([...authorityPrompts, data[0]])
        } else {
          setOutlinePrompts([...outlinePrompts, data[0]])
        }
      }

      setNewOption({ name: '', summary: '', value: '', type: 'authority' })
      setOpenDialog(false)
    } catch (error) {
      console.error('Error creating new option:', error)
    }
  }

  const handleUpdate = async (updatedOption: SiteOption) => {
    try {
      const { error } = await supabase
        .from('site_options')
        .update(updatedOption)
        .eq('id', updatedOption.id)

      if (error) throw error

      if (updatedOption.type === 'authority') {
        setAuthorityPrompts(authorityPrompts.map(o => o.id === updatedOption.id ? updatedOption : o))
      } else {
        setOutlinePrompts(outlinePrompts.map(o => o.id === updatedOption.id ? updatedOption : o))
      }

      setOpenDialog(false)
    } catch (error) {
      console.error('Error updating option:', error)
    }
  }

  const handleDelete = async (id: string, type: 'authority' | 'outline') => {
    try {
      const { error } = await supabase
        .from('site_options')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (type === 'authority') {
        setAuthorityPrompts(authorityPrompts.filter(o => o.id !== id))
      } else {
        setOutlinePrompts(outlinePrompts.filter(o => o.id !== id))
      }
    } catch (error) {
      console.error('Error deleting option:', error)
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
            <TableRow key={option.id}>
              <TableCell>{option.name}</TableCell>
              <TableCell>{option.summary}</TableCell>
              <TableCell>{option.value.substring(0, 50)}...</TableCell>
              <TableCell>
              <IconButton onClick={() => navigate(`edit/${option.id}`)}>
                <EditIcon />
              </IconButton>
                {/* <IconButton onClick={() => handleDelete(option.id, type)}>
                  <DeleteIcon />
                </IconButton> */}
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
      {/* <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => { setIsCreating(true); setNewOption({ ...newOption, type: 'authority' }); setOpenDialog(true); }}
        sx={{ mt: 2 }}
      >
        Add Authority Prompt
      </Button> */}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Outline Prompts</Typography>
      <PromptTable prompts={outlinePrompts} type="outline" />
      {/* <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={() => { setIsCreating(true); setNewOption({ ...newOption, type: 'outline' }); setOpenDialog(true); }}
        sx={{ mt: 2 }}
      >
        Add Outline Prompt
      </Button> */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isCreating ? 'Create New' : 'Edit'} {editingOption?.type || newOption.type} Prompt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={isCreating ? newOption.name : editingOption?.name}
            onChange={(e) => isCreating ? setNewOption({ ...newOption, name: e.target.value }) : setEditingOption(editingOption ? { ...editingOption, name: e.target.value } : null)}
          />
          <TextField
            margin="dense"
            id="summary"
            label="Summary"
            type="text"
            fullWidth
            variant="standard"
            value={isCreating ? newOption.summary : editingOption?.summary}
            onChange={(e) => isCreating ? setNewOption({ ...newOption, summary: e.target.value }) : setEditingOption(editingOption ? { ...editingOption, summary: e.target.value } : null)}
          />
          <TextField
            margin="dense"
            id="value"
            label="Value"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={isCreating ? newOption.value : editingOption?.value}
            onChange={(e) => isCreating ? setNewOption({ ...newOption, value: e.target.value }) : setEditingOption(editingOption ? { ...editingOption, value: e.target.value } : null)}
          />
          <DialogContentText sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Legend:</Typography>
            {(isCreating ? newOption.type : editingOption?.type) === 'authority' ? (
              <ul>
                <li>Article Instructions: {'{articleInstruction}'}</li>
                <li>Article Outline: {'{articleOutline}'}</li>
              </ul>
            ) : (
              <ul>
                <li>Competitor Links: {'{competitorLinks}'}</li>
                <li>KEYWORD: {'{keywords}'}</li>
                <li>CLIENT: {'{clientName}'}</li>
                <li>PAGE TYPE: {'{pageName}'}</li>
                <li>ARTICLE INSTRUCTION: {'{articleDescription}'}</li>
              </ul>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => isCreating ? handleCreate() : editingOption && handleUpdate(editingOption)}>
            {isCreating ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}