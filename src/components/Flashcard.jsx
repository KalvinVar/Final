import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import '../app.css';

const Flashcard = ({ flashcard, flip, onFlip, playFlipSound }) => {
  const [height, setHeight] = useState('auto');
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const cardRef = useRef(null);

  // Calculate and set the height based on content
  useEffect(() => {
    const updateHeight = () => {
      if (frontRef.current && backRef.current) {
        // Get the content height of both sides and add padding
        const frontHeight = frontRef.current.scrollHeight + 32;
        const backHeight = backRef.current.scrollHeight + 32;
        const newHeight = Math.max(frontHeight, backHeight, 300);
        setHeight(`${newHeight}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [flashcard]);

  // Combined click handler to flip card and play sound
  const handleCardClick = () => {
    onFlip();
    if (playFlipSound) playFlipSound();
  };

  return (
    <div
      className={`card grid-view ${flip ? 'flip' : ''}`}
      onClick={handleCardClick}
      ref={cardRef}
      style={{
        width: '100%',
        height,
        minHeight: "500px",
        margin: '0',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        position: 'relative',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div 
        ref={frontRef}
        className="front"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'whitesmoke',
          borderRadius: '8px',
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            mb: 2,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            textAlign: 'center' 
          }} 
          className="flashcard-text"
        >
          {flashcard.question}
        </Typography>
        
        {flashcard.image_link && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            my: 2, 
            maxHeight: '200px'  // Increased from 120px
          }}>
            <img
              src={flashcard.image_link}
              alt="Related to question"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',  // Increased from 120px
                width: 'auto',
                height: 'auto',
                margin: '0 auto'
              }}
            />
          </Box>
        )}
        
        <Box 
          className='options' 
          sx={{ 
            mt: 1,
            flex: '1',
            pb: 1 // Add padding at the bottom for better spacing
          }}
        >
          {flashcard.option && flashcard.option.map((option, index) => (
            <Box 
              key={index} 
              className='option' 
              sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="body2" 
                className="flashcard-option"
                sx={{ 
                  fontSize: '0.9rem', 
                  textAlign: 'center'
                }}
              >
                {option}
              </Typography>
            </Box>
          ))}
        </Box>
      </div>
      
      <div 
        ref={backRef}
        className="back"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'whitesmoke',
          borderRadius: '8px',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            fontSize: '2rem',  // Match question header size
            textAlign: 'center' 
          }}
        >
          Answer
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '1.5rem',  // Match question options size
            whiteSpace: 'pre-line' 
          }}
        >
          {flashcard.ans}
        </Typography>
        
        {flashcard.reasoning && (
          <Box sx={{ mt: 2, pb: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '2rem'  // Match question header size
              }}
            >
              Explanation:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '1.5rem'  // Match question options size
              }}
            >
              {flashcard.reasoning}
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

// Update the PropTypes definition
Flashcard.propTypes = {
  flashcard: PropTypes.shape({
    id: PropTypes.string,
    question: PropTypes.string.isRequired,
    ans: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]).isRequired,
    option: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string,
    image_link: PropTypes.string,
    reasoning: PropTypes.string,
  }).isRequired,
  flip: PropTypes.bool.isRequired,
  onFlip: PropTypes.func.isRequired,
  playFlipSound: PropTypes.func,
};

export default Flashcard;
