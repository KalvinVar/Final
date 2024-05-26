import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes library
import Flashcard from './Flashcard'; // Import Flashcard component
import Grid from '@mui/material/Unstable_Grid2';


export default function FlashcardList({ flashcards }) {
  return (
    <div>
      <Grid container>
        {flashcards.map(flashcard => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Flashcard flashcard={flashcard} key={flashcard.id}/>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

// Define propTypes for FlashcardList
FlashcardList.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      ans: PropTypes.string.isRequired,
      option: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};
