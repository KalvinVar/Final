import React, { useState } from 'react';

export default function Flashcard({ flashcard }) {
  const [flip, setFlip] = useState(false); // set flip to false

  return (
    <div
      className={`card ${flip ? 'flip' : ''}`} // if flip = true, name it flip else leave it blank
      // this is so that when the item is flipped, the className flip would exist and it would then activate the animation of flipping; see app.css line: 25 for reference
      onClick={() => setFlip(!flip)} // when clicked, set flip from false to true, and vice versa
    >
      <div className='front'> {/* give css to frontside/flashcard.question of the card */}
        {flashcard.question}
        <div className='options'> {/* give css to option array/option holder */}
          {flashcard.option.map(option => (
            <div className='option' key={option}> {/* give css to individual options */}
              {option}
            </div>
          ))}
        </div>
      </div>
      <div className='back'> {/* give css to backside/flashcard.ans of the card */}
        {flashcard.ans}
      </div>
    </div>
  );
}
