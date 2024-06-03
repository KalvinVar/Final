<<<<<<< HEAD
import React, { useState } from 'react';


export default function Flashcard({ flashcard }) {

  const [flip, setFlip] = useState(false) //set flip to flase

  return (
    <div
      className={
        `card ${flip ? 'flip' : ''}`/* if flip = true name it flip else leave it blank*/
        // this is so that when the item is fliped the className flip would exist and it would then activate the animation of fliping see app.css line: 25 for reference
      }
      onClick={() => setFlip(!flip)} // when click set flip from false to true. vice versa
    >
        <div className='front' /* give css to frontside/flashcard.qestion of the card*/>
          {flashcard.question}
          <div className='options'/* give css to option array/option holder*/>
            {flashcard.option.map(option => {
              return <div className='option'key={option}/* give css to individual options*/> {option} </div>
            })}
          </div>
        </div>

        <div className='back' /* give css to backside/flashcard.ans of the card*/>
          <></>{flashcard.ans}
        </div>


    </div>
  );
}
//       {flip ? flashcard.ans : flashcard.question  /* if flip = true grab flashcard.ans/"show answer" else grab flashcard.qestion/"show qestion" */}
=======
import React, { useState } from 'react';


export default function Flashcard({ flashcard }) {

  const [flip, setFlip] = useState(false) //set flip to flase

  return (
    <div
      className={
        `card ${flip ? 'flip' : ''}`/* if flip = true name it flip else leave it blank*/
        // this is so that when the item is fliped the className flip would exist and it would then activate the animation of fliping see app.css line: 25 for reference
      }
      onClick={() => setFlip(!flip)} // when click set flip from false to true. vice versa
    >
        <div className='front' /* give css to frontside/flashcard.qestion of the card*/>
          {flashcard.question}
          <div className='options'/* give css to option array/option holder*/>
            {flashcard.option.map(option => {
              return <div className='option'key={option}/* give css to individual options*/> {option} </div>
            })}
          </div>
        </div>

        <div className='back' /* give css to backside/flashcard.ans of the card*/>
          <></>{flashcard.ans}
        </div>


    </div>
  );
}
>>>>>>> 108adef (added score counting functionality)
