import React, { useState, useEffect } from 'react';
import {Route, Routes} from 'react-router-dom'
import FlashcardList from './components/FlashcardList';
import sampleData from './sampleData'; // grab the data
import axios from 'axios' // makes the fetching process easier
import './app.css'
import { Games } from './games';
import { Animal } from './animal';

function App() {
  const [flashcards, setFlashcards] = useState(sampleData); // grab the current state of sampleData and give it a name flashcards

  useEffect(() => {
    axios.get(Animal()) // fetches the trivia data
      .then(results => {
        setFlashcards(results.data.results.map((qItem, index) => { // get the data and identifier/our curent place in the array for each question we recive from trivia aray
          const a = htmldecoder(qItem.correct_answer) /* rename the qitem.answer to ans to make the triva array compatible with our code */
          const q = [...qItem.incorrect_answers.map(o => htmldecoder(o)/* pass to decoder for readability*/), a] /* add a/answer to the option array */
          return {
            id: `${index /* rename the index to id to make the triva array compatible with our code */}
          -${Date.now() /* to make sure id is unique attach the current time alongside the id value*/}`,
            question: htmldecoder(qItem.question), /* rename the qitem.question to question to make the triva array compatible with our code */
            ans: a, /* make a = ans */
            option: q.sort(() => Math.random() - .5) /*randomize the position of the array that contains the option and answer*/
          }

        }))
        console.log(results.data)

      })
  }, [])

  function htmldecoder(string) /*recive string that contain unreadable html text*/ {
    const textArea = document.createElement('textarea') /*creat element called text*/
    textArea.innerHTML = string /*make string = to .innerHtml to make it readable*/
    return (
      textArea.value
    )
  }

  return (
    <div className="app">
      <button>asdasd</button>
      <FlashcardList flashcards={flashcards} />
    </div> // send flashcards to FlashcardList
    
  );
}

export default App;
