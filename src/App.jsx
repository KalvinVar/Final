import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlashcardList from './components/FlashcardList';
import FlashcardSlider from './components/FlashcardSlider';
import './app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { getCurrentUser, isAuthenticated, logoutUser } from './auth';
import eventsData from './questions/Events.json';
import peopleData from './questions/People.json';
import proceduresData from './questions/Procedures.json';
import qualityData from './questions/Quality.json';

const App = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState(['Events', 'People', 'Procedures', 'Quality']);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState('');
  const [isSliderActive, setIsSliderActive] = useState(true); // Set default view to slider
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let selectedQuestions = [];
    switch (category) {
      case 'Events':
        selectedQuestions = eventsData;
        break;
      case 'People':
        selectedQuestions = peopleData;
        break;
      case 'Procedures':
        selectedQuestions = proceduresData;
        break;
      case 'Quality':
        selectedQuestions = qualityData;
        break;
      default:
        break;
    }

    selectedQuestions = selectedQuestions
      .slice(0, amount)
      .map((qItem) => {
        const correctAnswer = htmldecoder(qItem.correct_answer);
        const options = [...qItem.incorrect_answers.map(o => htmldecoder(o)), correctAnswer];
        return {
          id: qItem.id,
          question: htmldecoder(qItem.question),
          ans: correctAnswer,
          option: options.sort(() => Math.random() - 0.5) // Shuffle options
        };
      });
    setFlashcards(selectedQuestions);
  };

  const handleScoreSubmit = (e) => {
    e.preventDefault();
    const newScore = score + Number(correctAnswers);
    setScore(newScore);
    setCorrectAnswers('');
    localStorage.setItem(`score_${username}`, newScore);
  };

  const handleScoreReset = () => {
    setScore(0);
    localStorage.removeItem(`score_${username}`);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleSliderClick = () => {
    setIsSliderActive(!isSliderActive);
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="app-container">
      {/*----------------------------------------------------NAME, SCORE AND LOGOUT SECTION----------------------------------------------------------------------------------- */}
      <AppBar position="static" sx={{ borderRadius: '10px', marginBottom: '20px' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Welcome, {username} {/* Step 1.2.1: Display username */}
          </Typography>
          <Typography variant="h6" component="div" sx={{ marginLeft: '20px' }}>
            Total Correct Answers: {score} {/* Step 1.2.2: Display total correct answers */}
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: isSliderActive ? 'whitesmoke' : 'secondary.main', color: isSliderActive ? 'black' : 'white' }}
              onClick={handleSliderClick}
            >
              {isSliderActive ? 'Grid' : 'Slider'}
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout {/* Step 1.2.3: Logout button */}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/*----------------------------------------------------NAME, SCORE AND LOGOUT SECTION----------------------------------------------------------------------------------- */}

      {/*----------------------------------------------------CATEGORY AND CARD # SECTION----------------------------------------------------------------------------------- */}
      <form className="header" onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <Box className="form-row" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
          <FormControl className="form-group" sx={{ minWidth: 120 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)} // Step 2.1: User selects category
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
              onChange={(e) => setAmount(e.target.value)} // Step 2.2: User inputs number of questions
              InputProps={{ inputProps: { min: 1 } }}
            />
          </FormControl>
        </Box>
        <div className="form-group" style={{ marginTop: '20px', width: '100%' }}>
          <Button type="submit" variant="contained" color="primary" className="generatebtn" sx={{ height: '56px' }}>
            Generate {/* Step 2.3: Generate flashcards */}
          </Button>
        </div>
      </form>
      {/*----------------------------------------------------CATEGORY AND CARD # SECTION----------------------------------------------------------------------------------- */}

      {/*----------------------------------------------------FLASHCARD LIST SECTION----------------------------------------------------------------------------------- */}
      {flashcards.length > 0 && (
        isSliderActive ? (
          <FlashcardSlider flashcards={flashcards} /> // Render FlashcardSlider when isSliderActive is true
        ) : (
          <FlashcardList flashcards={flashcards} /> // Render FlashcardList when isSliderActive is false
        )
      )}
      {/*----------------------------------------------------FLASHCARD LIST SECTION----------------------------------------------------------------------------------- */}

      {/*----------------------------------------------------SCORE SECTION----------------------------------------------------------------------------------- */}
      <form className="header" onSubmit={handleScoreSubmit} style={{ marginTop: '20px' }}>
        <Box className="form-row" sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '20px' }}>
          <Button type="submit" variant="contained" color="primary" className="scorebtn" sx={{ flex: 1, height: '56px' }}>
            Submit {/* Step 2.5: Submit correct answers count */}
          </Button>
          <FormControl className="form-group" sx={{ flex: 6 }}>
            <TextField
              id="correct"
              label="How many questions you answered correctly?"
              type="number"
              value={correctAnswers}
              onChange={(e) => setCorrectAnswers(e.target.value)} // Step 2.6: User inputs correct answers count
              InputProps={{ inputProps: { min: 0 } }}
              fullWidth
              sx={{ height: '56px' }}
            />
          </FormControl>
          <Button type="button" variant="contained" color="secondary" onClick={handleScoreReset} className="resetbtn" sx={{ flex: 1, height: '56px' }}>
            Reset {/* Step 2.7: Reset correct answers count */}
          </Button>
        </Box>
      </form>
      {/*----------------------------------------------------SCORE SECTION----------------------------------------------------------------------------------- */}
    </div>
  );
};

export default App;
