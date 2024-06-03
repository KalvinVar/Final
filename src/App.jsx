import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Route, Routes } from 'react-router-dom';
=======
>>>>>>> 108adef (added score counting functionality)
import FlashcardList from './components/FlashcardList';
import axios from 'axios'; // makes the fetching process easier
import './app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

function App() {
  const [flashcards, setFlashcards] = useState([]); // grab the current state of sampleData and give it a name flashcards
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0); // state to keep track of the score
  const [correctAnswers, setCorrectAnswers] = useState(''); // state for the number of correct answers

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories);
      });

    // Load score from local storage on initial load
    const savedScore = localStorage.getItem('score');
    if (savedScore) {
      setScore(Number(savedScore)); // set the score state from local storage
    }
  }, []);

  function htmldecoder(string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = string;
    return textArea.value;
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios.get('https://opentdb.com/api.php', {
      params: {
        amount: amount,
        category: category
      }
    })
      .then(results => {
        setFlashcards(results.data.results.map((qItem, index) => {
          const a = htmldecoder(qItem.correct_answer);
          const q = [...qItem.incorrect_answers.map(o => htmldecoder(o)), a];
          return {
            id: `${index}-${Date.now()}`,
            question: htmldecoder(qItem.question),
            ans: a,
            option: q.sort(() => Math.random() - 0.5)
          };
        }));
        console.log(results.data);
      });
  }

  function handleScoreSubmit(e) {
    e.preventDefault();
    const newScore = score + Number(correctAnswers);
    setScore(newScore);
    setCorrectAnswers(''); // Empty the text box after submitting the correct answers

    // Save the new score to local storage
    localStorage.setItem('score', newScore); // save the updated score to local storage
  }

  function handleScoreReset() {
    setScore(0);
    localStorage.removeItem('score'); // remove the score from local storage
  }

  return (
    <div className="app-container">
<<<<<<< HEAD
=======
      {/*--------------------------------------- Hedder Starts------------------------------------------------------------ */}
>>>>>>> 108adef (added score counting functionality)
      <form className="header" onSubmit={handleSubmit}>
        <Box className="form-row" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <FormControl className="form-group" sx={{ minWidth: 120 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-group">
            <TextField
              id="amount"
              label="Number of Questions"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </FormControl>
        </Box>
        <div className="form-group">
          <Button type="submit" variant="contained" color="primary" className="generatebtn" sx={{ height: '56px' }}>
            Generate
          </Button>
        </div>
      </form>
      {/*--------------------------------------- Hedder Ends------------------------------------------------------------ */}

<<<<<<< HEAD
      <div className="app">
        <FlashcardList flashcards={flashcards /*send flashcards to FlashcardList */} />
      </div>
=======
        {/*--------------------------------------- Flascard Starts------------------------------------------------------------ */}
        <div className="app">
          <FlashcardList flashcards={flashcards} setCorrectAnswers={setCorrectAnswers} />
        </div>
        {/*--------------------------------------- Flascard Ends------------------------------------------------------------ */}
        
      {/*--------------------------------------- Score Counter Starts------------------------------------------------------------ */}
      <Paper className="score-display">
        <Typography variant="h5" component="div">
          Total Correct Answers: {score} {/* Display the total correct answers */}
        </Typography>
      </Paper>
      {/*--------------------------------------- Score Counter Ends------------------------------------------------------------ */}
      {/*--------------------------------------- Score Submit Stars------------------------------------------------------------ */}
      <form className="header" onSubmit={handleScoreSubmit}>
        <div className="form-group">
          <Box className="form-row" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Button type="submit" variant="contained" color="primary" className="scorebtn" sx={{ flex: 1, height: '56px' }}>
              Submit
            </Button>
            <FormControl className="form-group" sx={{ flex: 6, marginLeft: '10px', marginRight: '10px' }}>
              <TextField
                id="correct"
                label="How many questions you answered correctly?"
                type="number"
                value={correctAnswers}
                onChange={(e) => setCorrectAnswers(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
                sx={{ height: '56px' }}
              />
            </FormControl>
            <Button type="button" variant="contained" color="secondary" onClick={handleScoreReset} className="resetbtn" sx={{ flex: 1, height: '56px' }}>
              Reset
            </Button>
          </Box>
        </div>
      </form>
      {/*--------------------------------------- Score Submit Ends------------------------------------------------------------ */}
>>>>>>> 108adef (added score counting functionality)
    </div>
  );
}

export default App;

 {/*
Show me your Github commits so far.

Walk me through where you're at in your project:
Im on the last part which is adding a User Authentication to the website
  and hopefully it would keep track each users score
What's your code base look like so far?

What have you completed and what are you in the middle of working on?
  I Added the category and card number functionality
  I Added a score tracker functionality 
  Im doing nothing right now but next week i might be able to add the user authentication.

What challenges have you faced and how have you overcome them or what are you planning to do to overcome them?
deploying the website for some reason the "npm deploy is creating a dist file instead of a build file 
and the dist contain .js files which dosent go well with my jsx files and for some reason in the html it keeps delating the
link or <script type="module" src="/src/main.jsx"></script> to link the main.jsx which launce the app.jsx so i have to keep 
adding it back whem i npm deploy

What did you learn from the Learning Resources you explored this week that you have or plan to implement into your project?
Express.js/node.js for user authentication but Im not really that confident about it so I need to learn more I currently watching web dev simplified for explaining
express and user authentication 
*/}