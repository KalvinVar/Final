import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import '../app.css';

const Flashcard = ({ flashcard }) => {
  const [flip, setFlip] = useState(false);

  return (
    <Box
      className={`card ${flip ? 'flip' : ''}`}
      onClick={() => setFlip(!flip)}
      sx={{
        cursor: 'pointer',
        padding: 2,
        margin: 1,
        border: '1px solid #ccc',
        height: '50% !important'  // Changed from 90% to 95%
      }}
    >
      <Box className='front'>
        <Typography variant="h6" component="div" sx={{ mb: 1 }} className="flashcard-text">
          {flashcard.question}
        </Typography>
        {flashcard.image_link && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <img
              src={flashcard.image_link}
              alt="Related to question"
              style={{
                maxWidth: '600px',     // Change this value to adjust max width
                maxHeight: '600px',    // Change this value to adjust max height
                width: '100%',
                height: 'auto',
                margin: '0 auto'
              }}
            />
          </Box>
        )}
        <Box className='options' sx={{ mt: 1 }}>
          {flashcard.option && flashcard.option.map(option => (
            <Box key={option} className='option' sx={{ mb: 0.5 }}>
              <Typography variant="body2" className="flashcard-option">{option}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box className='back' sx={{ mt: 1 }}>
        <Typography variant="body1" className="flashcard-text-back">
          <strong>Answer:</strong> {flashcard.ans}
        </Typography>
      </Box>
    </Box>
  );
};

Flashcard.propTypes = {
  flashcard: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    ans: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    option: PropTypes.arrayOf(PropTypes.string).isRequired,
    image_link: PropTypes.string,
  }).isRequired,
};

export default Flashcard;
