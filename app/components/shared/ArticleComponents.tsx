import { styled } from '@mui/material'
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Link,
  Button,
  Tabs,
  Tab
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import React from "react"
import {   ArticleDetails as ArticleDetailsComponent, PlagiarismData } from '@/app/types/article'

export const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
}))

export const DetailsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}))

export const LinksContainer = styled(Box)(({ theme }) => ({
  maxHeight: '75vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  '& h3': {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  '& ol, & ul': {
    paddingLeft: theme.spacing(2),
    marginTop: 0,
    marginLeft: '1rem',
    marginBottom: theme.spacing(1),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
    wordBreak: 'break-word',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    wordBreak: 'break-word',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}))

export const EditorToolsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}))

export const ScrollableTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-scroller': {
    overflow: 'auto !important',
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(2),
  },
}))

export const ArticleOutline = ({ outline }: { outline: any }) => (
  <Accordion className="mb-6" style={{ marginTop: "1rem"}}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <h2>Outline</h2>
    </AccordionSummary>
    <AccordionDetails>
      {outline &&
        outline.sections.map((section: any, index: number) => (
          <div key={index} className="mb-4 result result-content" style={{ marginLeft: "1rem"}}>
            {section.headingLevel === "h2" ? (
              <h2 className="text-xl font-semibold mb-2">
                {section.sectionTitle}
              </h2>
            ) : (
              <h3 className="text-lg font-semibold mb-2">
                {section.sectionTitle}
              </h3>
            )}
            <Typography className="mb-2">{section.description}</Typography>
            <Typography className="font-semibold">Links:</Typography>
            <ul className="list-disc pl-5">
              {section.links.map((link: any, linkIndex: number) => (
                <li key={linkIndex}>
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </AccordionDetails>
  </Accordion>
)

export const ArticleDetails = ({editMode, articleDetails, handleArticleDetailsChange }: {editMode: boolean ,articleDetails: ArticleDetailsComponent, handleArticleDetailsChange: any }) => (
  <Accordion className="mb-6" style={{ marginTop: "1rem"}}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Details
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Client"
            value={articleDetails.client}
            onChange={(e) => handleArticleDetailsChange('client', e.target.value)}
            InputProps={{ readOnly: !editMode }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Keyword"
            value={articleDetails.keyword}
            onChange={(e) => handleArticleDetailsChange('keyword', e.target.value)}
            InputProps={{ readOnly: !editMode }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            multiline
            fullWidth
            rows={3}
            label="Meta"
            value={articleDetails.meta}
            onChange={(e) => handleArticleDetailsChange('meta', e.target.value)}
            InputProps={{ readOnly: !editMode }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Slug"
            value={articleDetails.slug}
            onChange={(e) => handleArticleDetailsChange('slug', e.target.value)}
            InputProps={{ readOnly: !editMode }}
          />
        </Grid>
      </Grid>
    </AccordionDetails>
  </Accordion>
)

export const PlagiarismResults = ({ data }: { data: PlagiarismData }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Plagiarism Check Results
    </Typography>
    <Typography variant="body1" gutterBottom>
      Total matches found: {data.count}
    </Typography>
    <List>
      {data.result.map((item, index) => (
        <ListItem key={index} alignItems="flex-start">
          <ListItemText
            primary={
              <>
               <Typography component="span" variant="h6" color="text.primary">
                  {index + 1 + '. '}
                </Typography>
              <Link href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </Link>
              </>
            }
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary">
                  Minimum words matched: {item.minwordsmatched}
                </Typography>
                <br />
                <Link href={item.viewurl} target="_blank" rel="noopener noreferrer">
                  View comparison
                </Link>
                <br />
                <Typography component="span" variant="body2">
                  Snippet:
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: item.htmlsnippet }} />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  </Box>
)

export const EditorTool = ({ icon, label, onClick, loading }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  loading?: boolean
}) => (
  <Button
    variant="outlined"
    startIcon={icon}
    onClick={onClick}
    disabled={loading}
    sx={{
      flex: '1 0 calc(50% - 8px)',
      justifyContent: 'flex-start',
      py: 1.5,
      px: 2,
      color: 'text.primary',
      '&:hover': {
        backgroundColor: 'action.hover',
      }
    }}
  >
    {loading ? 'Processing...' : label}
  </Button>
)