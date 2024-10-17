"use client"

import React, { useEffect,useState } from 'react';
import { TextField, Button, Grid, IconButton } from '@mui/material';
import { Add, Close, DragIndicator } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { apStyleTitleCase } from 'ap-style-title-case';
import { DragDropContext, Droppable, Draggable, DropResult,DroppableProps } from 'react-beautiful-dnd';
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};
const Sections = ({ inputFields, setInputFields }: any) => {
  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  const handleAddFields = () => {
    setInputFields([...inputFields, { sectionTitle: '', description: '', links: [{link: ''}], headingLevel: 'h2' }]);
  };
  
  const handleRemoveFields = (index: number) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleInputChange = (
    parentIndex: number,
    childIndex: number | null,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
  
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) => {
        if (i === parentIndex) {
          if (childIndex === null) {
            return { ...field, [name]: value };
          } else {
            const updatedLinks = field.links.map((link: any, j: number) =>
              j === childIndex ? { ...link, [name]: value } : link
            );
            return { ...field, links: updatedLinks };
          }
        }
        return field;
      })
    );
  };

  const handleAddFieldLink = (index: number) => {
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) =>
        i === index
          ? { ...field, links: [...field.links, { link: '' }] }
          : field
      )
    );
  };

  const handleRemoveFieldLink = (parentIndex: number, linkIndex: number) => {
    setInputFields((prevFields: any[]) =>
      prevFields.map((field, i) =>
        i === parentIndex
          ? { ...field, links: field.links.filter((_: any, j: number) => j !== linkIndex) }
          : field
      )
    );
  };

  const toggleHeadingLevel = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newFields = [...inputFields];
    newFields[index].headingLevel = newFields[index].headingLevel === 'h2' ? 'h3' : 'h2';
    setInputFields(newFields);
  };

  const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleAccordionBlur = () => {
    setTimeout(() => {
      if (!document.activeElement?.closest('.MuiAccordion-root')) {
        setExpandedPanel(false);
      }
    }, 0);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(inputFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setInputFields(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StrictModeDroppable droppableId="sections">  
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {inputFields.map((inputField: any, index: number) => (
              <Draggable key={index} draggableId={`section-${index}`} index={index} isDragDisabled={inputField.headingLevel !== 'h2'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      marginBottom: '16px',
                      opacity: snapshot.isDragging ? 0.5 : 1,
                    }}
                  >
                    <Accordion 
                      expanded={expandedPanel === index}
                      onChange={handleAccordionChange(index)}
                      onBlur={handleAccordionBlur}
                      sx={{
                        border: "solid", 
                        borderWidth: "1px",
                        marginLeft: inputField.headingLevel === 'h2' ? '0' : '2rem'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                      >
                        {inputField.headingLevel === 'h2' && (
                          <div {...provided.dragHandleProps} style={{ cursor: 'move', marginRight: '8px' }}>
                            <DragIndicator />
                          </div>
                        )}
                        <Button variant="text" size='large' onClick={(e) => toggleHeadingLevel(e, index)}>
                          {inputField.headingLevel === 'h2' ? 'H2 ' : 'H3 '}
                        </Button>
                        {inputField.headingLevel === 'h2' ? (
                          <h2> { apStyleTitleCase(inputField.sectionTitle) || `Section ${index + 1}`}</h2>
                        ) : (
                          <h3> { apStyleTitleCase(inputField.sectionTitle) || `Section ${index + 1}`}</h3>
                        )}
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={11}>
                            <TextField
                              name="sectionTitle"
                              label="Section Title"
                              variant="outlined"
                              fullWidth
                              value={apStyleTitleCase(inputField.sectionTitle)}
                              onChange={(event) => handleInputChange(index, null, event)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              name="description"
                              label="Section Details"
                              variant="outlined"
                              multiline
                              fullWidth
                              rows={5}
                              value={inputField.description}
                              onChange={(event) => handleInputChange(index, null, event)}
                            />
                          </Grid>
                          {inputField.links.map((link: any, linkIndex: number) => (
                            <Grid container spacing={2} key={linkIndex} style={{ marginLeft: '1rem', marginTop: '1rem' }} >
                              <Grid container>
                                <Grid item xs={11}>
                                  <TextField
                                    name="link"
                                    label="Links"
                                    variant="outlined"
                                    fullWidth
                                    value={link.link}
                                    onChange={(event) => handleInputChange(index, linkIndex, event)}
                                  />
                                </Grid>
                                <Grid item xs={1} alignItems="stretch" style={{ display: "flex" }}>
                                  <IconButton aria-label="delete" onClick={() => handleRemoveFieldLink(index, linkIndex)} size="large" color="error">
                                    <Close fontSize="inherit" />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                          <Grid item xs={12}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleAddFieldLink(index)}
                              endIcon={<Add />}
                            >
                              Add Link
                            </Button>
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              variant="outlined"
                              color="secondary"
                              style={{ float: 'right', marginBottom: '16px' }}
                              onClick={() => handleRemoveFields(index)}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
      <Button
        variant="outlined"
        color="warning"
        onClick={handleAddFields}
        style={{ marginTop: '16px' }}
        fullWidth
      >
        Add More Section
      </Button>
    </DragDropContext>
  );
};

export default Sections;