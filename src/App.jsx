import React, { useState, useEffect } from 'react'; // Import React and necessary hooks
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import FlashcardList from './components/FlashcardList'; // Import FlashcardList component
import axios from 'axios'; // Import axios for API calls
import './app.css'; // Import CSS file
import InputLabel from '@mui/material/InputLabel'; // Import Material-UI components
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, AppBar, Toolbar } from '@mui/material';
import { getCurrentUser, isAuthenticated, logoutUser } from './auth'; // Correct import path

const App = () => {
  // State variables
  const [flashcards, setFlashcards] = useState([]); // State for flashcards
  const [categories, setCategories] = useState([]); // State for categories
  const [category, setCategory] = useState(''); // State for selected category
  const [amount, setAmount] = useState(12); // State for number of questions
  const [score, setScore] = useState(0); // State for score
  const [correctAnswers, setCorrectAnswers] = useState(''); // State for correct answers input
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const username = getCurrentUser(); // Get current user from localStorage

  // useEffect to run on component mount
  useEffect(() => {
    // Step 1.1.1: Fetch categories from API
    axios.get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories); // Step 1.1.1: Set categories state
      });

    // Step 1.1.2: Check if user is authenticated
    if (isAuthenticated() && username) {
      const userScore = localStorage.getItem(`score_${username}`); // Step 1.1.3: Get user's score from localStorage
      if (userScore) {
        setScore(Number(userScore)); // Step 1.1.3: Set score state
      }
    } else {
      navigate('/login'); // Step 1.1.4: Redirect to login if not authenticated
    }
  }, [navigate, username]); // Dependencies for useEffect

  // Function to decode HTML entities
  function htmldecoder(string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = string;
    return textArea.value;
  }

  // Handle form submission for generating flashcards
  function handleSubmit(e) {
    e.preventDefault(); // Step 2.3.1: Prevent default form submission behavior
    // Step 2.3.2: Fetch flashcards from API
    axios.get('https://opentdb.com/api.php', {
      params: {
        amount: amount, // Step 2.3.3: Number of questions
        category: category // Step 2.3.3: Selected category
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
        })); // Step 2.3.4: Set flashcards state
        console.log(results.data);
      });
  }

  // Handle form submission for submitting score
  function handleScoreSubmit(e) {
    e.preventDefault(); // Step 2.5.1: Prevent default form submission behavior
    const newScore = score + Number(correctAnswers); // Step 2.5.2: Calculate new score
    setScore(newScore); // Step 2.5.3: Set score state
    setCorrectAnswers(''); // Step 2.5.4: Clear correct answers input
    localStorage.setItem(`score_${username}`, newScore); // Step 2.5.5: Save new score to localStorage
  }

  // Handle score reset
  function handleScoreReset() {
    setScore(0); // Step 2.7.1: Reset score state
    localStorage.removeItem(`score_${username}`); // Step 2.7.2: Remove user's score from localStorage
  }

  // Handle logout
  function handleLogout() {
    logoutUser(); // Step 1.2.3: Call logoutUser function
    navigate('/login'); // Step 1.2.3: Redirect to login
  }

  // If not authenticated, return null or a loading spinner
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="app-container">
      <AppBar position="static" sx={{ borderRadius: '10px', marginBottom: '20px' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Welcome, {username} {/* Step 1.2.1: Display username */}
          </Typography>
          <Typography variant="h6" component="div" sx={{ marginLeft: '20px' }}>
            Total Correct Answers: {score} {/* Step 1.2.2: Display total correct answers */}
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ marginLeft: '20px' }}>
            Logout {/* Step 1.2.3: Logout button */}
          </Button>
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
              onChange={(e) => setCategory(e.target.value)} // Step 2.1: User selects category
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
              onChange={(e) => setAmount(e.target.value)} // Step 2.2: User sets number of questions
              InputProps={{ inputProps: { min: 1 } }}
            />
          </FormControl>
        </Box>
        <div className="form-group" style={{ marginTop: '20px', width: '100%' }}>
          <Button type="submit" variant="contained" color="primary" className="generatebtn" sx={{ height: '56px' }}>
            Generate {/* Step 2.3: User generates flashcards */}
          </Button>
        </div>
      </form>

      <div className="app">
        <FlashcardList flashcards={flashcards} /> {/* Step 2.4: Display flashcards */}
      </div>

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
    </div>
  );
};

export default App;

/**
 * Main App Flow:
 * 1. Authentication and Initialization:
 *    1.1. On component mount:
 *         1.1.1. Fetch categories from the trivia API.
 *              axios.get('https://opentdb.com/api_category.php')
 *                .then(res => {
 *                  setCategories(res.data.trivia_categories);
 *                });
 *         1.1.2. Check if the user is authenticated.
 *              const auth = localStorage.getItem('isAuthenticated');
 *              const currentUser = localStorage.getItem('currentUser');
 *         1.1.3. If authenticated, set the user's username and score.
 *              setIsAuthenticated(true);
 *              setUsername(currentUser);
 *              const userScore = localStorage.getItem(`score_${currentUser}`);
 *              if (userScore) {
 *                setScore(Number(userScore));
 *              }
 *         1.1.4. If not authenticated, navigate to the login page.
 *              navigate('/login');
 *    1.2. Render the header:
 *         1.2.1. Display username.
 *              <Typography variant="h6" component="div">
 *                Welcome, {username}
 *              </Typography>
 *         1.2.2. Display total correct answers.
 *              <Typography variant="h6" component="div" sx={{ marginLeft: '20px' }}>
 *                Total Correct Answers: {score}
 *              </Typography>
 *         1.2.3. Logout button.
 *              <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ marginLeft: '20px' }}>
 *                Logout
 *              </Button>
 * 2. Main Actions:
 *    2.1. User selects a category.
 *         <Select
 *           labelId="category-label"
 *           id="category"
 *           value={category}
 *           onChange={(e) => setCategory(e.target.value)}
 *           label="Category"
 *         >
 *           {categories.map(category => (
 *             <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>
 *           ))}
 *         </Select>
 *    2.2. User sets the number of questions.
 *         <TextField
 *           id="amount"
 *           label="Number of Questions"
 *           type="number"
 *           value={amount}
 *           onChange={(e) => setAmount(e.target.value)}
 *           InputProps={{ inputProps: { min: 1 } }}
 *         />
 *    2.3. User generates flashcards.
 *         <Button type="submit" variant="contained" color="primary" className="generatebtn" sx={{ height: '56px' }}>
 *           Generate
 *         </Button>
 *         handleSubmit(e) {
 *           e.preventDefault();
 *           axios.get('https://opentdb.com/api.php', {
 *             params: {
 *               amount: amount,
 *               category: category
 *             }
 *           })
 *             .then(results => {
 *               setFlashcards(results.data.results.map((qItem, index) => {
 *                 const a = htmldecoder(qItem.correct_answer);
 *                 const q = [...qItem.incorrect_answers.map(o => htmldecoder(o)), a];
 *                 return {
 *                   id: `${index}-${Date.now()}`,
 *                   question: htmldecoder(qItem.question),
 *                   ans: a,
 *                   option: q.sort(() => Math.random() - 0.5)
 *                 };
 *               }));
 *               console.log(results.data);
 *             });
 *         }
 *    2.4. Flashcards are displayed.
 *         <FlashcardList flashcards={flashcards} />
 *    2.5. User submits the count of correct answers.
 *         <Button type="submit" variant="contained" color="primary" className="scorebtn" sx={{ flex: 1, height: '56px' }}>
 *           Submit
 *         </Button>
 *         handleScoreSubmit(e) {
 *           e.preventDefault();
 *           const newScore = score + Number(correctAnswers);
 *           setScore(newScore);
 *           setCorrectAnswers('');
 *           localStorage.setItem(`score_${username}`, newScore);
 *         }
 *    2.6. User inputs the correct answers count.
 *         <TextField
 *           id="correct"
 *           label="How many questions you answered correctly?"
 *           type="number"
 *           value={correctAnswers}
 *           onChange={(e) => setCorrectAnswers(e.target.value)}
 *           InputProps={{ inputProps: { min: 0 } }}
 *           fullWidth
 *           sx={{ height: '56px' }}
 *         />
 *    2.7. User resets the correct answers count.
 *         <Button type="button" variant="contained" color="secondary" onClick={handleScoreReset} className="resetbtn" sx={{ flex: 1, height: '56px' }}>
 *           Reset
 *         </Button>
 *         handleScoreReset() {
 *           setScore(0);
 *           localStorage.removeItem(`score_${username}`);
 *         }
 */
