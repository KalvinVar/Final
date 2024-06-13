import React, { useState } from 'react';

export default function Flashcard({ flashcard }) {
  const [flip, setFlip] = useState(false); // Initialize flip state to false

  return (
    <div
      className={`card ${flip ? 'flip' : ''}`} // Conditionally apply 'flip' class if flip is true
      // This applies the 'flip' class to activate the flip animation defined in app.css (see app.css line: 25)
      onClick={() => setFlip(!flip)} // Toggle flip state on click
    >
      <div className='front'> {/* Apply CSS for the front side of the card (question side) */}
        {flashcard.question}
        <div className='options'> {/* Apply CSS to the container holding the options */}
          {flashcard.option.map(option => (
            <div className='option' key={option}> {/* Apply CSS to individual options */}
              {option}
            </div>
          ))}
        </div>
      </div>
      <div className='back'> {/* Apply CSS for the back side of the card (answer side) */}
        {flashcard.ans}
      </div>
    </div>
  );
}
