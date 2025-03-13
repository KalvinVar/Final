import React, { useState, useEffect, useRef } from 'react'; // Add useRef
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Box, Button, Typography } from '@mui/material';

// Update the DraggableItem component to accept the playSound prop
const DraggableItem = ({ item, containerId, disabled, playSound }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${containerId}-${item}`,
    data: { container: containerId, item },
    disabled,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
    marginBottom: '10px',
  };
  
  // Custom mouse down handler to play sound using the passed function
  const handleMouseDown = (e) => {
    if (!disabled && playSound) {
      playSound();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      {...(disabled ? {} : { ...listeners, ...attributes })}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          width: '100%',
        }}
        aria-grabbed={isDragging}
        aria-label={`${item} (Draggable)`}
      >
        {item}
      </Button>
    </div>
  );
};

// Droppable area for topics
const TopicDroppableArea = ({ topic, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: topic,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        border: `2px dashed ${isOver ? "#0a74da" : "#1976d2"}`,
        padding: '10px',
        minHeight: '50px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {children}
    </Box>
  );
};

// Droppable area for descriptions
const DescriptionsDroppableArea = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'descriptions',
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        border: `2px dashed ${isOver ? "#0a74da" : "#1976d2"}`,
        padding: '10px',
        minHeight: '50px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {children}
    </Box>
  );
};

const MatchingQuestion = ({ pairs, isSubmitted, onMatchingChange }) => {
  // Fix the URLs for both sound references
  const dragStartSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/448/448081_9159316-lq.mp3'));
  const dragEndSoundRef = useRef(new Audio('https://cdn.freesound.org/previews/448/448081_9159316-lq.mp3'));
  
  // Modify the useEffect for audio setup
  useEffect(() => {
    // Preload both audio files
    const preloadAudio = async () => {
      try {
        if (dragStartSoundRef.current) {
          dragStartSoundRef.current.volume = 0.5;
          // Preload the audio
          await dragStartSoundRef.current.load();
        }
        if (dragEndSoundRef.current) {
          dragEndSoundRef.current.volume = 0.5;
          // Preload the audio
          await dragEndSoundRef.current.load();
        }
      } catch (e) {
        console.error("Error preloading audio:", e);
      }
    };

    preloadAudio();

    // Cleanup function
    return () => {
      if (dragStartSoundRef.current) {
        dragStartSoundRef.current.pause();
        dragStartSoundRef.current.currentTime = 0;
      }
      if (dragEndSoundRef.current) {
        dragEndSoundRef.current.pause();
        dragEndSoundRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Function to play drag start sound
  const playDragStartSound = () => {
    if (dragStartSoundRef.current) {
      // Clone the audio for multiple rapid plays
      const sound = dragStartSoundRef.current.cloneNode();
      sound.volume = 0.5;
      sound.play().catch(e => console.log("Audio play error:", e));
    }
  };
  
  // Function to play drag end sound 
  const playDragEndSound = () => {
    try {
      if (dragEndSoundRef.current) {
        dragEndSoundRef.current.currentTime = 0;
        dragEndSoundRef.current.play().catch(e => console.log("Audio play error:", e));
      }
    } catch (e) {
      console.error("Error playing drag end sound:", e);
    }
  };
  
  // Parse pairs data
  const parsedPairs = React.useMemo(() => {
    if (!pairs) return [];
    
    if (typeof pairs === 'string') {
      try {
        return JSON.parse(pairs);
      } catch (e) {
        console.error('Failed to parse pairs as JSON:', e);
        return [];
      }
    }
    
    if (Array.isArray(pairs) && pairs.length > 0) {
      return pairs;
    }
    
    console.error('Unrecognized pairs format:', pairs);
    return [];
  }, [pairs]);
  
  // State setup
  const [descriptions, setDescriptions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [originalPairs, setOriginalPairs] = useState([]);
  const [matchedItems, setMatchedItems] = useState({});
  
  // Initialize from parsed pairs
  useEffect(() => {
    if (parsedPairs && parsedPairs.length > 0) {
      setDescriptions(parsedPairs.map(pair => pair.definition));
      setTopics(parsedPairs.map(pair => pair.term));
      setOriginalPairs(parsedPairs);
    }
  }, [parsedPairs]);

  // Initialize matchedItems when topics change
  useEffect(() => {
    if (topics && topics.length > 0) {
      const initialState = {};
      topics.forEach(topic => {
        initialState[topic] = [];
      });
      setMatchedItems(initialState);
    }
  }, [topics]);

  // User cannot move items once submitted
  const submitted = isSubmitted;

  // Lift matching answers to parent
  useEffect(() => {
    const matchingAnswers = [];
    topics.forEach(topic => {
      if (matchedItems[topic]?.length > 0) {
        matchingAnswers.push({ term: topic, definition: matchedItems[topic][0] });
      }
    });
    onMatchingChange && onMatchingChange(matchingAnswers);
  }, [matchedItems, topics, onMatchingChange]);

  // Detect when all items are matched
  useEffect(() => {
    if (descriptions.length === 0 && 
        Object.values(matchedItems).filter(items => items.length > 0).length === topics.length) {
      console.log("All items matched successfully");
    }
  }, [descriptions, matchedItems, topics]);

  // Handle drag and drop
  const handleDragEnd = (event) => {
    // Make this call explicit and at the top of the function
    playDragEndSound();
    console.log("Drag end sound triggered");
    
    if (submitted) return;
    const { active, over } = event;
    if (!over) return;
    const sourceContainer = active.data.current.container;
    const draggedItem = active.data.current.item;
    const targetContainer = over.id;
    if (sourceContainer === targetContainer) return;

    // Handle different drag scenarios
    if (sourceContainer === 'descriptions' && topics.includes(targetContainer)) {
      // From descriptions to topic
      setDescriptions(prev => prev.filter(item => item !== draggedItem));
      setMatchedItems(prev => {
        const existing = prev[targetContainer]?.[0];
        if (existing) {
          setDescriptions(prevDescriptions => [...prevDescriptions, existing]);
        }
        return {
          ...prev,
          [targetContainer]: [draggedItem]
        };
      });
    } else if (topics.includes(sourceContainer) && targetContainer === 'descriptions') {
      // From topic to descriptions
      setMatchedItems(prev => ({
        ...prev,
        [sourceContainer]: prev[sourceContainer].filter(item => item !== draggedItem)
      }));
      setDescriptions(prev => [...prev, draggedItem]);
    } else if (topics.includes(sourceContainer) && topics.includes(targetContainer)) {
      // Between topics
      setMatchedItems(prev => {
        const existing = prev[targetContainer]?.[0];
        if (existing) {
          setDescriptions(prevDescriptions => [...prevDescriptions, existing]);
        }
        return {
          ...prev,
          [sourceContainer]: prev[sourceContainer].filter(item => item !== draggedItem),
          [targetContainer]: [draggedItem]
        };
      });
    }
  };

  // If no pairs data, show message
  if (originalPairs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', padding: '20px' }}>
        <Typography>No matching items available.</Typography>
      </Box>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ width: '100%', overflowX: 'hidden', overflowY: 'hidden' }}>
        {/* Descriptions Area */}
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ marginBottom: '10px' }}>
            Unsorted Descriptions
          </Typography>
          <DescriptionsDroppableArea>
            {descriptions.length > 0 ? (
              descriptions.map((item, index) => (
                <DraggableItem
                  key={`descriptions-${index}`}
                  item={item}
                  containerId="descriptions"
                  disabled={submitted}
                  playSound={playDragStartSound}  // Pass the function here
                />
              ))
            ) : (
              <Typography sx={{ color: '#aaa', textAlign: 'center' }}>
                {Object.values(matchedItems).some(items => items.length > 0) 
                  ? 'All items are matched!' 
                  : 'Drop here'}
              </Typography>
            )}
          </DescriptionsDroppableArea>
        </Box>

        {/* Topics Areas */}
        {topics.map((topic, index) => (
          <Box key={`topic-${index}`} sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
            <Typography variant="h6" sx={{ width: '40%', textAlign: 'left' }}>
              {topic}
            </Typography>
            <TopicDroppableArea topic={topic}>
              {matchedItems[topic]?.length > 0 ? (
                matchedItems[topic].map((item, idx) => (
                  <DraggableItem
                    key={`${topic}-${idx}`}
                    item={item}
                    containerId={topic}
                    disabled={submitted}
                    playSound={playDragStartSound}  // Pass the function here
                  />
                ))
              ) : (
                <Typography sx={{ color: '#aaa', textAlign: 'center' }}>
                  Drop here
                </Typography>
              )}
            </TopicDroppableArea>
          </Box>
        ))}
      </Box>
    </DndContext>
  );
};

export default MatchingQuestion;
