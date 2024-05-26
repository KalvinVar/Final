import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import FlashcardList from './components/FlashcardList';
import axios from 'axios'; // makes the fetching process easier
import './app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button } from '@mui/material';

function App() {
  const [flashcards, setFlashcards] = useState([]); // grab the current state of sampleData and give it a name flashcards
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(10);

  useEffect(() => {
    axios.get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories);
      });
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

  return (
    <div className="app-container">
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
          <Button type="submit" variant="contained" color="primary" className="generatebtn">
            Generate
          </Button>
        </div>
      </form>

      <div className="app">
        <FlashcardList flashcards={flashcards /*send flashcards to FlashcardList */} />
      </div>
    </div>
  );
}

export default App;
