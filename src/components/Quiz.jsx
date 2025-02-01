import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, AppBar, Toolbar, Paper, LinearProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { getCurrentUser, isAuthenticated, logoutUser } from '../auth';
import eventsData from '../questions/Events.json';
import peopleData from '../questions/People.json';
import proceduresData from '../questions/Procedures.json';
import qualityData from '../questions/Quality.json';

const Quiz = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState(['Events', 'People', 'Procedures', 'Quality']);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [navigateTo, setNavigateTo] = useState(null);
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

  const htmldecoder = (string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = string;
    return textArea.value;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

    selectedQuestions = shuffleArray(selectedQuestions)
      .slice(0, amount)
      .map((qItem) => {
        const correctAnswer = htmldecoder(qItem.correct_answer);
        const options = [...qItem.incorrect_answers.map(o => htmldecoder(o)), correctAnswer];
        return {
          id: qItem.id,
          question: htmldecoder(qItem.question),
          ans: correctAnswer,
          option: options.sort(() => Math.random() - 0.5), // Shuffle options
          reasoning: qItem.reasoning
        };
      });
    setFlashcards(selectedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    setShowReasoning(false);
    setIsCorrect(null);
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (selectedAnswer) {
      setUserAnswers([...userAnswers, selectedAnswer]);
      if (selectedAnswer === flashcards[currentQuestionIndex].ans) {
        setScore(score + 1);
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
      setShowReasoning(true);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer('');
    setShowReasoning(false);
    setIsCorrect(null);
  };

  const handleLogout = () => {
    if (currentQuestionIndex >= flashcards.length) {
      logoutUser();
      navigate('/login');
    } else {
      setNavigateTo('/login');
      setOpenDialog(true);
    }
  };

  const handleFlashcardsClick = () => {
    if (currentQuestionIndex >= flashcards.length) {
      navigate('/app');
    } else {
      setNavigateTo('/app');
      setOpenDialog(true);
    }
  };

  const handleDialogClose = (confirm) => {
    setOpenDialog(false);
    if (confirm && navigateTo) {
      if (navigateTo === '/login') {
        logoutUser();
      }
      navigate(navigateTo);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  const progress = (currentQuestionIndex / flashcards.length) * 100;

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
              onClick={handleFlashcardsClick}
            >
              Flashcards
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
          <Button type="submit" variant="contained" color="primary" className="generatebtn" sx={{ height: '56px' }}>
            Generate Quiz
          </Button>
        </div>
      </form>

      <Paper elevation={3} sx={{ padding: '20px', backgroundColor: 'white' }}>
        {flashcards.length > 0 && (
          <Box sx={{ width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            {currentQuestionIndex < flashcards.length && (
              <Typography variant="body1" sx={{ marginRight: '10px' }}>
                {currentQuestionIndex + 1}/{flashcards.length}
              </Typography>
            )}
            <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1 }} />
          </Box>
        )}
        {flashcards.length > 0 && currentQuestionIndex < flashcards.length && (
          <form onSubmit={handleAnswerSubmit}>
            <Typography variant="h6" component="div" sx={{ marginBottom: '20px' }}>
              {flashcards[currentQuestionIndex].question}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {flashcards[currentQuestionIndex].option.map((option, index) => (
                <Button
                  key={index}
                  variant="contained"
                  sx={{
                    backgroundColor: selectedAnswer === option ? 'white' : 'primary.main',
                    color: selectedAnswer === option ? 'black' : 'white',
                    border: selectedAnswer === option ? '2px solid black' : 'none'
                  }}
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Button type="submit" variant="contained" color="primary">
                Submit Answer
              </Button>
              {showReasoning && (
                <Button variant="contained" color="secondary" onClick={handleNextQuestion}>
                  Next
                </Button>
              )}
            </Box>
          </form>
        )}
        {showReasoning && (
          <Box sx={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <Typography variant="body1" sx={{ marginBottom: '10px' }}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </Typography>
            <Typography variant="body1">
              {flashcards[currentQuestionIndex].reasoning}
            </Typography>
          </Box>
        )}
        {flashcards.length > 0 && currentQuestionIndex >= flashcards.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Typography variant="h6" component="div">
              Quiz Completed! Your score is {score}/{flashcards.length}.
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => handleDialogClose(false)}
      >
        <DialogTitle>Confirm Navigation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you would lose all of your progress?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Yes, I'm sure
          </Button>
          <Button onClick={() => handleDialogClose(false)} color="secondary" autoFocus>
            Nevermind
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Quiz;
