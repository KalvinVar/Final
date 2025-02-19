import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, Button, Typography } from '@mui/material';

const DraggableItem = ({ item, containerId, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${containerId}-${item}`, // compose a unique id
    data: { container: containerId, item },
    disabled,  // disable dragging when true
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
    marginBottom: '10px',
  };

  return (
    <div ref={setNodeRef} style={style} {...(disabled ? {} : { ...listeners, ...attributes })}>
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          width: '100%',
        }}
      >
        {item}
      </Button>
    </div>
  );
};

const DroppableArea = ({ droppableId, label, items, renderItem }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
  });

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      {/* Left Side (Label) */}
      <Typography variant="h6" sx={{ width: '40%', textAlign: 'left' }}>
        {label}
      </Typography>
      {/* Right Side (Droppable Area) */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          border: `2px dashed ${isOver ? "#0a74da" : "#1976d2"}`,
          padding: '10px',
          minHeight: '50px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {safeItems.length > 0 ? (
          safeItems.map((item, index) => renderItem(item, index))
        ) : (
          <Typography sx={{ color: '#aaa', textAlign: 'center' }}>Drop here</Typography>
        )}
      </div>
    </Box>
  );
};

const MatchingQuestion = ({ pairs, isSubmitted, onMatchingChange }) => {
  // Unsorted descriptions come from pairs definitions.
  const [descriptions, setDescriptions] = useState(pairs.map(pair => pair.definition));
  // Topics come from pairs terms.
  const [topics] = useState(pairs.map(pair => pair.term));

  // For each topic, initialize matchedItems as an empty array.
  const [matchedItems, setMatchedItems] = useState(() => {
    const initialState = {};
    topics.forEach(topic => {
      initialState[topic] = [];
    });
    return initialState;
  });

  // User cannot move items once submitted.
  const submitted = isSubmitted;

  // Lift matching answers to parent.
  useEffect(() => {
    const matchingAnswers = [];
    topics.forEach(topic => {
      if (matchedItems[topic]?.length > 0) {
        matchingAnswers.push({ term: topic, definition: matchedItems[topic][0] });
      }
    });
    onMatchingChange && onMatchingChange(matchingAnswers);
  }, [matchedItems, topics, onMatchingChange]);

  const handleDragEnd = (event) => {
    if (submitted) return;
    const { active, over } = event;
    if (!over) return;
    const sourceContainer = active.data.current.container;
    const draggedItem = active.data.current.item;
    const targetContainer = over.id;
    if (sourceContainer === targetContainer) return;

    // Drag from unsorted descriptions to a topic drop
    if (sourceContainer === 'descriptions' && topics.includes(targetContainer)) {
      // Remove the dragged item from unsorted descriptions
      setDescriptions((prevDescriptions) => prevDescriptions.filter(item => item !== draggedItem));
      setMatchedItems(prev => {
        // If a description already exists in the target, move it back to unsorted descriptions
        const existing = prev[targetContainer]?.[0];
        if (existing) {
          setDescriptions((prevDescriptions) => [...prevDescriptions, existing]);
        }
        // Place the new dragged item into the target container
        return {
          ...prev,
          [targetContainer]: [draggedItem]
        };
      });
    }
    // Drag from a topic drop back to unsorted descriptions
    else if (topics.includes(sourceContainer) && targetContainer === 'descriptions') {
      setMatchedItems(prev => ({
        ...prev,
        [sourceContainer]: prev[sourceContainer].filter(item => item !== draggedItem)
      }));
      setDescriptions(prev => [...prev, draggedItem]);
    }
    // Drag from one topic drop to another topic drop
    else if (topics.includes(sourceContainer) && topics.includes(targetContainer)) {
      setMatchedItems(prev => {
        // If target already has an item, move it back to unsorted descriptions
        const existing = prev[targetContainer]?.[0];
        if (existing) {
          setDescriptions((prevDescriptions) => [...prevDescriptions, existing]);
        }
        const newSource = prev[sourceContainer].filter(item => item !== draggedItem);
        return {
          ...prev,
          [sourceContainer]: newSource,
          [targetContainer]: [draggedItem]
        };
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Container prevents vertical and horizontal scrolling */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'hidden',
        }}
      >
        <DroppableArea
          droppableId="descriptions"
          label="Unsorted Descriptions"
          items={descriptions}
          renderItem={(item, index) => (
            <DraggableItem
              key={`descriptions-${index}`}
              item={item}
              containerId="descriptions"
              disabled={submitted}
            />
          )}
        />

        {topics.map((topic, index) => (
          <DroppableArea
            key={index}
            droppableId={topic}
            label={topic}
            items={matchedItems[topic] || []}
            renderItem={(item, idx) => (
              <DraggableItem
                key={`${topic}-${idx}`}
                item={item}
                containerId={topic}
                disabled={submitted}
              />
            )}
          />
        ))}
      </Box>
    </DndContext>
  );
};

export default MatchingQuestion;
