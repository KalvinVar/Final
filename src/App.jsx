import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlashcardSlider from './components/FlashcardSlider';
import './app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { getCurrentUser, isAuthenticated, logoutUser } from './auth';
import useAudioService from './services/AudioService';

const parseJSONSafely = (data, fallback = []) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return fallback;
  }
};

const App = () => {
  const { 
    audioElements, 
    playButtonClickSound,
    playGenerateFlashcardsSound,
    playFlipSound
  } = useAudioService();

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState(['Events', 'People', 'Procedures', 'Quality']);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState('');
  const [isSliderActive, setIsSliderActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const username = getCurrentUser();

  useEffect(() => {
    if (isAuthenticated() && username) {
      const userScore = localStorage.getItem(`score_${username}`);
      if (userScore) {
        setScore(Number(userScore));
      }
    } else {
      navigate('/login');
    }
  }, [navigate, username]);

  useEffect(() => {
    document.body.classList.toggle('slider-active', isSliderActive);
  }, [isSliderActive]);

  const htmldecoder = (string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = string;
    return textArea.value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playGenerateFlashcardsSound();
    if (!category) return;
    
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`https://mindflipkalvin.mooo.com/${category.toLowerCase()}`);
      if (!response.ok) throw new Error(`Failed to fetch ${category} data`);
      
      const data = await response.json();
      
      if (!Array.isArray(data.message)) {
        throw new Error('Invalid data format received');
      }
  
      const questions = data.message;
      
      const processed = questions
        .slice(0, amount)
        .map(qItem => {
          if (!qItem || !qItem.question) return null;
  
          const question = htmldecoder(qItem.question);
          const incorrectAnswers = parseJSONSafely(qItem.incorrect_answers, [])
            .map(ans => htmldecoder(ans));
  
          const baseQuestion = {
            id: String(qItem.id || Date.now()),
            question,
            reasoning: qItem.reasoning || '',
            image_link: qItem.image_link || null,
            type: qItem.type || 'multiple-choice'
          };
  
          switch (qItem.type) {
            case 'sorting':
              const sortingAnswers = parseJSONSafely(qItem.answers, []);
              const correctOrder = parseJSONSafely(qItem.correct_order, []);
              if (!sortingAnswers.length || !correctOrder.length) return null;
              return {
                ...baseQuestion,
                ans: correctOrder.join(', '),
                option: sortingAnswers
              };
  
            case 'matching':
              const pairs = parseJSONSafely(qItem.answers, []);
              if (!Array.isArray(pairs) || !pairs.length) return null;
              return {
                ...baseQuestion,
                ans: pairs.map(pair => `${pair.term} → ${pair.definition}`).join('\n'),
                option: pairs.map(pair => `${pair.term}: ${pair.definition}`)
              };
  
            case 'multiple-answer':
              const multipleAnswers = parseJSONSafely(qItem.answers, []);
              if (!Array.isArray(multipleAnswers) || !multipleAnswers.length) return null;
              return {
                ...baseQuestion,
                ans: multipleAnswers.join(', '),
                option: shuffleArray([...incorrectAnswers, ...multipleAnswers])
              };
  
            default:
              const correctAnswer = htmldecoder(qItem.correct_answer || '');
              if (!correctAnswer) return null;
              return {
                ...baseQuestion,
                ans: correctAnswer,
                option: shuffleArray([...incorrectAnswers, correctAnswer])
              };
          }
        })
        .filter(Boolean);
  
      setFlashcards(processed);
    } catch (err) {
      console.error('Error processing questions:', err);
      setError(err.message);
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreSubmit = (e) => {
    e.preventDefault();
    playButtonClickSound();
    
    const newScore = score + Number(correctAnswers);
    setScore(newScore);
    setCorrectAnswers('');
    localStorage.setItem(`score_${username}`, newScore);
  };

  const handleScoreReset = () => {
    playButtonClickSound();
    
    setScore(0);
    localStorage.removeItem(`score_${username}`);
  };

  const handleLogout = () => {
    playButtonClickSound();
    
    logoutUser();
    navigate('/login');
  };

  const handleQuizClick = () => {
    playButtonClickSound();
    navigate('/quiz');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="app-container">
      <AppBar position="static" sx={{ borderRadius: '10px', marginBottom: '20px' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Welcome, {username}
          </Typography>
          <Typography variant="h6" component="div" sx={{ marginLeft: '20px' }}>
            Total Correct Answers: {score}
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleQuizClick}
            >
              Quiz
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <form className="header" onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box className="form-row" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
          <FormControl className="form-group" sx={{ minWidth: 120 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category, index) => (
                <MenuItem value={category} key={index}>{category}</MenuItem>
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
        <div className="form-group" style={{ marginTop: '20px', width: '100%' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            className="generatebtn" 
            sx={{ height: '56px' }}
          >
            Generate
          </Button>
        </div>
      </form>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, color: 'error.main' }}>
          <Typography>Error: {error}</Typography>
        </Box>
      )}

      {flashcards.length > 0 && (
        <FlashcardSlider flashcards={flashcards} playFlipSound={playFlipSound} />
      )}

      <form className="header" onSubmit={handleScoreSubmit} style={{ marginTop: '20px' }}>
        <Box className="form-row" sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '20px' }}>
          <Button type="submit" variant="contained" color="primary" className="scorebtn" sx={{ flex: 1, height: '56px' }}>
            Submit
          </Button>
          <FormControl className="form-group" sx={{ flex: 6 }}>
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
      </form>
      
      {audioElements}
    </div>
  );
};

export default App;
