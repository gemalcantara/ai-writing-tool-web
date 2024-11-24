"use client"

import React, { useState, useEffect } from "react"
import { DataGrid, GridColDef, GridRenderEditCellParams } from "@mui/x-data-grid"
import { Typography, Grid, IconButton, TextField } from "@mui/material"
import { Visibility } from "@mui/icons-material"
import { useNavigate } from "react-router-dom";
interface History {
  _id: string
  outline_input_data: any
  production_date: string
  client_name: string
  keywords: string
  created_at: string
}

export default function ArticleHistory() {
  const [histories, setHistories] = useState<History[]>([])
  const [filteredArticles, setFilteredArticles] = useState<History[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
 
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/articles')
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        const data = await response.json()
        setHistories(data)
        organizeRows(data)
      } catch (err) {
        console.error("Failed to fetch history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const organizeRows = (histories: History[]) => {
    const rows = histories.map((history) => {
      let clientName = ""
      let keywords = ""
      let productionDate = history.production_date

      if (history.outline_input_data) {
        const articleData = history.outline_input_data
        clientName = articleData.inputFieldStaticOutline?.clientName || ""
        keywords = articleData.linkFields?.keywords.map((item: { value: string }) => item.value).join(", ") || ""
      }

      if (!productionDate || productionDate.trim() === "") {
        const createdAt = history.created_at
        const date = new Date(createdAt)
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = String(date.getFullYear()).slice(-2)
        productionDate = `${month}/${year}`
      }

      return {
        ...history,
        client_name: clientName,
        keywords,
        production_date: productionDate,
      }
    })

    setFilteredArticles(rows)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    setSearchTerm(value)
    const filteredData = histories.filter((history) => {
      let clientName = ""
      if (history.outline_input_data) {
        const articleData = history.outline_input_data
        clientName = articleData.inputFieldStaticOutline?.clientName || ""
      }
      return clientName.toLowerCase().includes(value)
    })
    organizeRows(filteredData)
  }

  const handleProductionDateChange = async (id: string, value: string) => {
    const formattedValue = value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})/, "$1/")
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ production_date: formattedValue }),
      })
      if (!response.ok) {
        throw new Error('Failed to update production date')
      }
      // Update the local state after successful API call
      setHistories(prevHistories => 
        prevHistories.map(history => 
          history._id === id ? { ...history, production_date: formattedValue } : history
        )
      )
      organizeRows(histories)
    } catch (err) {
      console.error("Failed to update production date:", err)
    }
  }

  const columns: GridColDef[] = [
    { field: "client_name", headerName: "Client Name", width: 300 },
    {
      field: "production_date",
      headerName: "Production Date",
      width: 150,
      editable: true,
      sortComparator: (v1, v2) => {
        const parseDate = (value: string | null | undefined) => {
          if (!value || value.trim() === "") {
            return new Date(1900, 0)
          }
          const [month, year] = value.split("/").map(Number)
          return new Date(year + 2000, month - 1)
        }
    
        return parseDate(v1).getTime() - parseDate(v2).getTime()
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value.replace(/\D/g, "").slice(0, 4)
          const formattedValue = rawValue.replace(/^(\d{2})/, "$1/")
          params.api.setEditCellValue({ ...params, value: formattedValue }, e)
        }
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            params.api.stopCellEditMode({ id: params.id, field: params.field })
            handleProductionDateChange(params.id.toString(), params.value as string)
          }
        }
        const handleBlur = () => {
          if (params.value) {
            handleProductionDateChange(params.id.toString(), params.value as string)
          }
        }
    
        return (
          <TextField
            value={params.value || ""}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="MM/YY"
            inputProps={{ pattern: "\\d{2}/\\d{2}" }}
          />
        )
      },
    },    
    { field: "keywords", headerName: "Keywords", width: 350 },
    {
      field: "view",
      headerName: "View",
      width: 150,
      renderCell: (params) => (
        <IconButton aria-label="view" color="primary" onClick={() => navigate(`${params.row._id}`)}>
          <Visibility />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Article Outputs
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="standard-basic"
            label="Search by client name"
            variant="standard"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ float: "right" }}
          />
        </Grid>
      </Grid>

      <div style={{ height: 650, width: "100%", backgroundColor: "#fff" }}>
        <DataGrid
          rows={filteredArticles}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          loading={loading}
          getRowId={(row) => row._id}
        />
      </div>
    </>
  )
}