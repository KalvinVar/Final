import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../app.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box, TextField, Button, Typography, AppBar, Toolbar, Paper, LinearProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getCurrentUser, isAuthenticated, logoutUser } from '../auth';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MatchingQuestion from './MatchingQuestion'; // Adjust the import path as necessary
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable'; // install if needed: npm install @dnd-kit/sortable
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import PerformanceBreakdown from './PerformanceBreakdown';
import confetti from 'canvas-confetti';
import useAudioService from '../services/AudioService';

// Helper function to check if two arrays are equal
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // Check each element
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

const Quiz = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState(['Events', 'People', 'Procedures', 'Quality', 'Random']);
  const [category, setCategory] = useState('Random');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [unsortedOptions, setUnsortedOptions] = useState([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [incompleteAnswer, setIncompleteAnswer] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [bestAttemptCount, setBestAttemptCount] = useState(null);
  const [prevBestRaw, setPrevBestRaw] = useState(null);
  const [prevBestAttempt, setPrevBestAttempt] = useState(null);
  const [prevBestRawBeforeUpdate, setPrevBestRawBeforeUpdate] = useState(null);
  const [prevBestAttemptBeforeUpdate, setPrevBestAttemptBeforeUpdate] = useState(null);
  const [confirmAction, setConfirmAction] = useState(''); // new state
  const [categoryData, setCategoryData] = useState({
    Events: [],
    People: [],
    Procedures: [], 
    Quality: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showHighScoreMessage, setShowHighScoreMessage] = useState(false); // new state
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const username = getCurrentUser();
  const open = Boolean(anchorEl);

  const topicColors = {
    Events: '#1976d2',     // blue
    People: '#388e3c',     // green
    Procedures: '#f57c00', // orange
    Quality: '#7b1fa2'     // purple
  };

  // Use the audio service
  const { 
    audioElements, 
    playDragStartSound, 
    playDragEndSound, 
    playOptionSelectSound, 
    playButtonClickSound, 
    playHighScoreSound, 
    playCompletionSound 
  } = useAudioService();

  // Fetch data from API
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryData = async (categoryName) => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://mindflipkalvin.mooo.com/${categoryName.toLowerCase()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${categoryName} data`);
        }
        const data = await response.json();
        return data.message || [];
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    };

    const loadAllCategoryData = async () => {
      const events = await fetchCategoryData('Events');
      const people = await fetchCategoryData('People');
      const procedures = await fetchCategoryData('Procedures');
      const quality = await fetchCategoryData('Quality');
      
      setCategoryData({
        Events: events,
        People: people,
        Procedures: procedures,
        Quality: quality
      });
    };

    loadAllCategoryData();
    return () => {
      isMounted = false;
    };
  }, []);

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
    if (flashcards.length > 0 && currentQuestionIndex >= flashcards.length) {
      const currentPercentage = Math.round((score / flashcards.length) * 100);
      const currentAttemptCount = flashcards.length;
      let storedBest = localStorage.getItem(`bestScore_${username}`);
      storedBest = storedBest ? Number(storedBest) : 0;
      let storedAttemptCount = localStorage.getItem(`bestAttemptCount_${username}`);
      storedAttemptCount = storedAttemptCount ? Number(storedAttemptCount) : 0;
      
      // Update stored best if current percentage is higher or if equal but with more questions attempted.
      if (currentPercentage > storedBest || (currentPercentage === storedBest && currentAttemptCount > storedAttemptCount)) {
        localStorage.setItem(`bestScore_${username}`, currentPercentage);
        localStorage.setItem(`bestAttemptCount_${username}`, currentAttemptCount);
        storedBest = currentPercentage;
        storedAttemptCount = currentAttemptCount;
      }
      setBestScore(storedBest);
      setBestAttemptCount(storedAttemptCount);
    }
  }, [flashcards, currentQuestionIndex, score, username]);

  useEffect(() => {
    if (flashcards.length > 0 && currentQuestionIndex >= flashcards.length) {
      const currentRaw = score; // current number of correct answers
      const currentAttempt = flashcards.length;
      let storedBestRaw = localStorage.getItem(`bestRawScore_${username}`);
      storedBestRaw = storedBestRaw ? Number(storedBestRaw) : 0;
      let storedAttempt = localStorage.getItem(`bestAttemptCountRaw_${username}`);
      storedAttempt = storedAttempt ? Number(storedAttempt) : 0;
      
      // Save previous best values before any potential update.
      setPrevBestRawBeforeUpdate(storedBestRaw);
      setPrevBestAttemptBeforeUpdate(storedAttempt);
      
      // Update stored best if current raw score is higher.
      if (currentRaw > storedBestRaw) {
        localStorage.setItem(`bestRawScore_${username}`, currentRaw);
        localStorage.setItem(`bestAttemptCountRaw_${username}`, currentAttempt);
        storedBestRaw = currentRaw;
        storedAttempt = currentAttempt;
      }
      
      // Set current best values (this will show current test value if improved)
      setPrevBestRaw(storedBestRaw);
      setPrevBestAttempt(storedAttempt);
    }
  }, [flashcards, currentQuestionIndex, score, username]);

  const submitScore = async () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('currentUser');
    
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    
    try {
      // Calculate percentage score
      const finalScore = Math.round((score / flashcards.length) * 100);
      
      console.log('Submitting score:', {
        score: finalScore, 
        correct_answers: score, 
        attempts: flashcards.length
      });
      
      // Submit to server with correct category
      const response = await fetch('https://mindflipkalvin.mooo.com/submit-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          score: finalScore,
          category: category || 'Overall', // Use the current quiz category
          attempts: flashcards.length,
          correct_answers: score
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      
      const data = await response.json();
      console.log('Score submission response:', data);
      
      // Check if it's a new high score
      if (data.isHighScore) {
        console.log('New high score detected! Triggering confetti and sound!');
        // Trigger confetti if it's a new high score
        triggerTestConfetti();
        
        // Play the high score sound
        playHighScoreSound();
        
        // Add the high score message to the DOM
        setShowHighScoreMessage(true);
        
        // Optionally hide the message after some time
        setTimeout(() => {
          setShowHighScoreMessage(false);
        }, 6000);
      } else {
        console.log('Not a new high score. Playing completion sounds.');
        // Play the regular completion sound
        playCompletionSound();
      }
      
    } catch (err) {
      console.error('Error submitting score:', err);
    }
  };

  // Then use this function in your quiz completion handler:
  useEffect(() => {
    if (flashcards.length > 0 && currentQuestionIndex >= flashcards.length) {
      // Set quizCompleted to true when the quiz is finished
      setQuizCompleted(true);
      
      const finalScore = Math.round((score / flashcards.length) * 100);
      
      // Submit score to MySQL backend
      submitScore();
      
      // Also keep the localStorage as fallback
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        let storedBest = localStorage.getItem(`bestScore_${currentUser}`);
        storedBest = storedBest ? Number(storedBest) : 0;
        
        if (finalScore > storedBest) {
          localStorage.setItem(`bestScore_${currentUser}`, finalScore);
        }
      }
    } else {
      // Reset quizCompleted when a new quiz starts or when navigating questions
      setQuizCompleted(false);
    }
  }, [flashcards, currentQuestionIndex, score]);

  const htmldecoder = (string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = string;
    return textArea.value;
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playButtonClickSound(); // Play sound first
  
    // Reset state for a fresh quiz
    setScore(0);
    setUserAnswers({});
    setSelectedAnswers([]);
    setShowReasoning(false);
    setIsCorrect(null);
    setHasSubmitted(false);
    setIncompleteAnswer(false);
  
    let selectedQuestions = [];
    
    if (category === 'Random') {
      // Combine all questions from categories that have data
      let allQuestions = [];
      
      if (categoryData.Events && categoryData.Events.length > 0) {
        allQuestions = [...allQuestions, ...categoryData.Events.map((q) => ({ ...q, category: 'Events' }))];
      }
      
      if (categoryData.People && categoryData.People.length > 0) {
        allQuestions = [...allQuestions, ...categoryData.People.map((q) => ({ ...q, category: 'People' }))];
      }
      
      if (categoryData.Procedures && categoryData.Procedures.length > 0) {
        allQuestions = [...allQuestions, ...categoryData.Procedures.map((q) => ({ ...q, category: 'Procedures' }))];
      }
      
      if (categoryData.Quality && categoryData.Quality.length > 0) {
        allQuestions = [...allQuestions, ...categoryData.Quality.map((q) => ({ ...q, category: 'Quality' }))];
      }
      
      // Check if we have any questions at all
      if (allQuestions.length === 0) {
        setError("No questions available. Please try again or select a specific category.");
        return;
      }
      
      selectedQuestions = allQuestions;
    } else {
      // Use the data from the selected category
      if (!categoryData[category] || categoryData[category].length === 0) {
        setError(`No questions available for ${category}. Please try another category.`);
        return;
      }
      selectedQuestions = categoryData[category].map((q) => ({ ...q, category }));
    }
  
    // Shuffle and slice the array
    selectedQuestions = shuffleArray(selectedQuestions)
      .slice(0, amount)
      .map((qItem) => {
        try {
          // Parse incorrectAnswers if it's a string
          const incorrectAnswers = qItem.incorrect_answers 
            ? (typeof qItem.incorrect_answers === 'string' 
                ? JSON.parse(qItem.incorrect_answers) 
                : qItem.incorrect_answers)
            : [];
          
          // Parse correct_answers for multiple-answer questions (if available)
          let correctAnswers = [];
          if (qItem.type === 'multiple-answer') {
            // For multiple-answer questions, check if correct_answers exists (array) or use correct_answer if available
            if (qItem.correct_answers && Array.isArray(qItem.correct_answers)) {
              correctAnswers = qItem.correct_answers.map(htmldecoder);
            } else if (qItem.correct_answers && typeof qItem.correct_answers === 'string') {
              try {
                correctAnswers = JSON.parse(qItem.correct_answers).map(htmldecoder);
              } catch (e) {
                console.error('Error parsing correct_answers JSON:', e);
              }
            } else if (qItem.correct_answer) {
              // If correct_answer exists but is null, set empty array
              correctAnswers = qItem.correct_answer ? [htmldecoder(qItem.correct_answer)] : [];
            }
          } else {
            // For single-answer questions
            correctAnswers = qItem.correct_answer ? [htmldecoder(qItem.correct_answer)] : [];
          }
          
          // Handle options differently based on question type
          let options = [];
          if (qItem.type !== 'sorting' && qItem.type !== 'matching') {
            options = [...incorrectAnswers.map(htmldecoder), ...correctAnswers];
          }
          
          // Parse correct_order and answers if they're strings
          let correctOrder = [];
          if (qItem.correct_order) {
            correctOrder = typeof qItem.correct_order === 'string'
              ? JSON.parse(qItem.correct_order)
              : qItem.correct_order;
          }
          
          let answers = [];
          if (qItem.answers) {
            answers = typeof qItem.answers === 'string'
              ? JSON.parse(qItem.answers)
              : qItem.answers;
          }
          
          // For sorting questions, ensure we have answers property
          if (qItem.type === 'sorting' && (!answers || answers.length === 0)) {
            // If answers is missing but we have correct_order, use that
            answers = correctOrder.length > 0 ? [...correctOrder] : [];
          }
          
          // Handle pairs for matching questions if they exist
          let pairs = qItem.pairs || [];
          if (typeof pairs === 'string') {
            pairs = JSON.parse(pairs);
          }
          
          if (qItem.type === 'multiple-answer') {
            // For multiple-answer questions, we need both correct and incorrect options
            try {
              // Get correct answers - first check correct_answers array, then check answers field
              let correctAnswers = [];
              if (qItem.correct_answers && Array.isArray(qItem.correct_answers)) {
                correctAnswers = qItem.correct_answers.map(htmldecoder);
              } else if (qItem.answers && typeof qItem.answers === 'string') {
                // If answers field contains the correct answers as a JSON string
                try {
                  correctAnswers = JSON.parse(qItem.answers);
                } catch (e) {
                  console.error('Error parsing answers JSON:', e);
                }
              } else if (qItem.answers && Array.isArray(qItem.answers)) {
                correctAnswers = qItem.answers;
              }
              
              // Combine all options and shuffle them
              const allOptions = [...incorrectAnswers.map(o => htmldecoder(o)), ...correctAnswers.map(htmldecoder)];
              
              return {
                id: qItem.id,
                question: htmldecoder(qItem.question),
                ans: correctAnswers.map(htmldecoder), // Store correct answers for checking
                option: shuffleArray(allOptions), // All options, shuffled
                reasoning: qItem.reasoning || '',
                image_link: qItem.image_link || null,
                correct_order: [],
                answers: [],
                type: 'multiple-answer',
                pairs: [],
                category: qItem.category || category
              };
            } catch (error) {
              console.error("Error processing multiple-answer question:", qItem.id, error);
              return null;
            }
          }
          
          if (qItem.type === 'matching') {
            // For matching questions, check for pairs in both the pairs field and answers field
            let pairs = qItem.pairs || [];
            
            // If pairs is empty, try to get from answers field
            if ((!pairs || pairs.length === 0) && qItem.answers) {
              try {
                // Parse answers if it's a string
                if (typeof qItem.answers === 'string') {
                  const parsedAnswers = JSON.parse(qItem.answers);
                  // Check if parsed answers has the expected format for pairs
                  if (Array.isArray(parsedAnswers) && 
                      parsedAnswers.length > 0 && 
                      parsedAnswers[0].term && 
                      parsedAnswers[0].definition) {
                    pairs = parsedAnswers;
                  }
                } else if (Array.isArray(qItem.answers) && 
                          qItem.answers.length > 0 && 
                          qItem.answers[0].term && 
                          qItem.answers[0].definition) {
                  pairs = qItem.answers;
                }
              } catch (e) {
                console.error('Error parsing answers as pairs:', e);
              }
            }
            
            if (typeof pairs === 'string') {
              pairs = JSON.parse(pairs);
            }
            
            return {
              id: qItem.id,
              question: htmldecoder(qItem.question),
              ans: [], // No single correct answer for matching
              option: [], // No options for matching
              reasoning: qItem.reasoning || '',
              image_link: qItem.image_link || null,
              correct_order: [],
              answers: [],
              type: 'matching',
              pairs: pairs, // Use the pairs we determined
              category: qItem.category || category
            };
          }
          
          return {
            id: qItem.id,
            question: htmldecoder(qItem.question),
            ans: correctAnswers,
            option: qItem.type !== 'sorting' && qItem.type !== 'matching' ? shuffleArray(options) : [],
            reasoning: qItem.reasoning || '',
            image_link: qItem.image_link || null,
            correct_order: correctOrder,
            answers: answers,
            type: qItem.type || 'multiple-choice',
            pairs: pairs,
            category: qItem.category
          };
        } catch (error) {
          console.error("Error processing question:", qItem.id, error);
          return null; // Skip problematic questions
        }
      })
      .filter(Boolean); // Remove any null entries (from parsing errors)
    
    // Check if we have enough valid questions
    if (selectedQuestions.length === 0) {
      setError("No valid questions could be processed. Please try a different category.");
      return;
    }
    
    setFlashcards(selectedQuestions);
    setCurrentQuestionIndex(0);
    setError(null); // Clear any previous errors
  
    // Initialize the unsortedOptions and selectedAnswers based on the first question's type
    if (selectedQuestions[0]) {
      if (selectedQuestions[0].type === 'sorting') {
        // For sorting questions, use the answers array as the unsorted options
        if (selectedQuestions[0].answers && selectedQuestions[0].answers.length > 0) {
          setUnsortedOptions(shuffleArray([...selectedQuestions[0].answers]));
          setSelectedAnswers([]);
        } else if (selectedQuestions[0].correct_order && selectedQuestions[0].correct_order.length > 0) {
          // Fallback to correct_order if answers is not available
          setUnsortedOptions(shuffleArray([...selectedQuestions[0].correct_order]));
          setSelectedAnswers([]);
        } else {
          setUnsortedOptions([]);
          setSelectedAnswers([]);
        }
      } else {
        setUnsortedOptions([]);
        setSelectedAnswers([]);
      }
    }
  };
  
  const handleNextQuestion = () => {
    playButtonClickSound(); // Play sound first
    if (currentQuestionIndex + 1 < flashcards.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswers([]);
      
      // Set unsortedOptions based on the next question's type
      const nextQuestion = flashcards[nextIndex];
      if (nextQuestion.type === 'sorting') {
        if (nextQuestion.answers && nextQuestion.answers.length > 0) {
          setUnsortedOptions(shuffleArray([...nextQuestion.answers]));
        } else if (nextQuestion.correct_order && nextQuestion.correct_order.length > 0) {
          setUnsortedOptions(shuffleArray([...nextQuestion.correct_order]));
        } else {
          setUnsortedOptions([]);
        }
      } else {
        setUnsortedOptions([]);
      }
      
      setShowReasoning(false);
      setIsCorrect(null);
      setHasSubmitted(false);
      setIncompleteAnswer(false);
    } else {
      // On final question, increment index to show the final screen (with the gauge)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    playButtonClickSound(); // Play sound first
    const currentQuestion = flashcards[currentQuestionIndex];
    const correctAnswers = Array.isArray(currentQuestion.ans) ? currentQuestion.ans : [];
    const correctOrder = currentQuestion.correct_order || [];
    const pairs = currentQuestion.pairs || [];

    // Check if the answer is incomplete for sorting questions
    if (correctOrder.length > 0 && selectedAnswers.length !== correctOrder.length) {
      setIncompleteAnswer(true);
      return;
    }

    if (selectedAnswers.length > 0 && !hasSubmitted) {
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedAnswers }));
      let isAnswerCorrect = false;

      if (currentQuestion.type === 'sorting' && correctOrder.length > 0) {
        isAnswerCorrect = arraysEqual(selectedAnswers, correctOrder);
      } else if (currentQuestion.type === 'matching' && pairs.length > 0) {
        // First check if all required matches are present
        if (selectedAnswers.length !== pairs.length) {
          isAnswerCorrect = false;
        } else {
          // Check if all selected pairs match the expected pairs
          isAnswerCorrect = pairs.every(expectedPair => 
            selectedAnswers.some(selectedPair => 
              selectedPair.term === expectedPair.term && 
              selectedPair.definition === expectedPair.definition
            )
          );
        }
      } else if (currentQuestion.type === 'multiple-answer') {
        // For multiple-answer questions, check if all selected answers are correct
        // and all correct answers are selected (no extras, no missing)
        isAnswerCorrect = 
          correctAnswers.length === selectedAnswers.length && 
          correctAnswers.every(answer => selectedAnswers.includes(answer)) &&
          selectedAnswers.every(answer => correctAnswers.includes(answer));
      } else {
        // For standard multiple-choice questions
        isAnswerCorrect = correctAnswers.includes(selectedAnswers[0]);
      }

      if (isAnswerCorrect) {
        setScore(score + 1);
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
      setShowReasoning(true);
      setHasSubmitted(true);
      setIncompleteAnswer(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (hasSubmitted) return; // Prevent changing answers after submission
    
    const currentQuestion = flashcards[currentQuestionIndex];
    
    // Play the option select sound
    playOptionSelectSound();
    
    // For multiple-choice questions (single answer)
    if (currentQuestion.type !== 'multiple-answer') {
      setSelectedAnswers([option]);
      return;
    }
    
    // For multiple-answer questions (multiple selections allowed)
    setSelectedAnswers(prev => {
      if (prev.includes(option)) {
        // If already selected, remove it
        return prev.filter(item => item !== option);
      } else {
        // If not selected, add it
        return [...prev, option];
      }
    });
  };

  const handleLogout = () => {
    playButtonClickSound(); // Play sound first
    if (currentQuestionIndex >= flashcards.length) {
      logoutUser();
      navigate('/login');
    } else {
      setConfirmAction('logout');
      setOpenDialog(true);
    }
  };

  const handleFlashcardsClick = () => {
    playButtonClickSound(); // Play sound first
    if (currentQuestionIndex >= flashcards.length) {
      navigate('/app');
    } else {
      setConfirmAction('flashcards');
      setOpenDialog(true);
    }
  };

  const handleDialogClose = (confirm) => {
    playButtonClickSound(); // Play sound first
    setOpenDialog(false);
    if (confirm) {
      if (confirmAction === 'logout') {
        logoutUser();
        navigate('/login');
      } else if (confirmAction === 'flashcards') {
        navigate('/app');
      }
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!isAuthenticated()) {
    return null;
  }

  const progress = (currentQuestionIndex / flashcards.length) * 100;

  const DraggableItem = ({ item, containerId, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: item,
      data: { container: containerId, item },
      disabled, // disable dragging when true
    });

    // Create modified listeners that play sounds safely
    const enhancedListeners = {
      ...listeners,
      onMouseDown: (e) => {
        if (!disabled) {
          playDragStartSound(); // Play sound when drag starts
          // Only call the original handler if it exists
          if (listeners.onMouseDown && typeof listeners.onMouseDown === 'function') {
            listeners.onMouseDown(e);
          }
        }
      },
      onTouchStart: (e) => {
        if (!disabled) {
          playDragStartSound(); // Play sound when drag starts (for touch devices)
          // Only call the original handler if it exists
          if (listeners.onTouchStart && typeof listeners.onTouchStart === 'function') {
            listeners.onTouchStart(e);
          }
        }
      }
    };

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
      cursor: disabled ? 'default' : 'grab',
      marginBottom: '10px',
    };

    return (
      <div ref={setNodeRef} style={style} {...(disabled ? {} : { ...enhancedListeners, ...attributes })}>
        <Button variant="contained" sx={{ backgroundColor: '#1976d2', color: 'white', width: '100%' }}>
          {item}
        </Button>
      </div>
    );
  };

  const DroppableArea = ({ items, setItems, droppableId, otherItems, setOtherItems, disabled }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: droppableId,
    });

    return (
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          border: `2px dashed ${isOver ? "#0a74da" : "#1976d2"}`,
          padding: '10px',
          minHeight: '100px',
        }}
      >
        <Typography variant="h6" component="div" sx={{ marginBottom: '10px' }}>
          {droppableId === 'unsortedOptions' ? 'Unsorted Options' : 'Sorted Answers'}
        </Typography>
        {items.map((item) => (
          <DraggableItem key={item} item={item} containerId={droppableId} disabled={disabled} />
        ))}
      </div>
    );
  };

  const handleDragEnd = (event) => {
    // Play the reverse sound at the end of drag
    playDragEndSound();
    
    if (hasSubmitted) return; // prevent changes after submission

    const { active, over } = event;
    if (!over) return;

    const sourceId = active.data.current.container;
    const targetId = over.id;
    const draggedItem = active.id;

    // If dragging inside the same container, and it is the selectedAnswers container, reorder items.
    if (sourceId === targetId) {
      if (sourceId === 'selectedAnswers') {
        const oldIndex = selectedAnswers.indexOf(draggedItem);
        // over.data.current.index can be set in the DroppableArea if needed;
        // Here we assume that over element has a data-index attribute
        const newIndex = over.data?.current?.index ?? 0;
        setSelectedAnswers((items) => arrayMove(items, oldIndex, newIndex));
      }
      return;
    }
    
    // Moving from unsortedOptions to selectedAnswers
    if (sourceId === 'unsortedOptions' && targetId === 'selectedAnswers') {
      if (selectedAnswers.includes(draggedItem)) return;
      setUnsortedOptions((prev) => prev.filter((item) => item !== draggedItem));
      setSelectedAnswers((prev) => [...prev, draggedItem]);
    }
    // Moving from selectedAnswers to unsortedOptions
    else if (sourceId === 'selectedAnswers' && targetId === 'unsortedOptions') {
      if (unsortedOptions.includes(draggedItem)) return;
      setSelectedAnswers((prev) => prev.filter((item) => item !== draggedItem));
      setUnsortedOptions((prev) => [...prev, draggedItem]);
    }
  };

  // Inside your Quiz component, add this function to trigger confetti:
  const triggerTestConfetti = () => {
    // Bottom Left corner popper (45 degrees)
    const popperBottomLeft = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.95, x: 0.05 }, // Very bottom left corner
        angle: 45, // 45 degrees angle (upward and to the right)
        gravity: 1,
        startVelocity: 55,
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
                '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
      });
    };
    
    // Bottom Right corner popper (135 degrees)
    const popperBottomRight = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.95, x: 0.95 }, // Very bottom right corner
        angle: 135, // 135 degrees angle (upward and to the left)
        gravity: 1,
        startVelocity: 55,
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
                '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
      });
    };

    // Middle Left popper (45 degrees)
    const popperMiddleLeft = () => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5, x: 0.0 }, // Middle left edge
        angle: 45, // 45 degrees angle (upward and to the right)
        gravity: 1,
        startVelocity: 45, // Slightly lower velocity for middle poppers
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
                '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
      });
    };
    
    // Middle Right popper (135 degrees)
    const popperMiddleRight = () => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5, x: 1.0 }, // Middle right edge
        angle: 135, // 135 degrees angle (upward and to the left)
        gravity: 1,
        startVelocity: 45, // Slightly lower velocity for middle poppers
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
                '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
      });
    };

    // First wave - bottom poppers
    popperBottomLeft();
    setTimeout(popperBottomRight, 100);
    
    // Second wave - middle poppers after short delay
    setTimeout(() => {
      popperMiddleLeft();
      setTimeout(popperMiddleRight, 100);
    }, 200);
    
    // Optional: third wave after a longer delay for sustained celebration
    setTimeout(() => {
      popperBottomLeft();
      setTimeout(popperBottomRight, 100);
    }, 700);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DndProvider backend={HTML5Backend}>
        <div className="app-container" style={{ overflowX: 'hidden', overflowY: 'auto', minHeight: '100vh' }}>
          {/* AppBar section... */}
          
          <AppBar position="static" sx={{ borderRadius: '10px', marginBottom: '20px' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
                Welcome, {username}
              </Typography>
              
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center',
                  display: { xs: 'none', sm: 'block' } 
                }}
              >
                Total Correct Answers: {score}
              </Typography>

              {/* Desktop buttons */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: '10px' 
              }}>
                <Button
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#1976d2', 
                    color: 'white',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                  onClick={handleFlashcardsClick}
                >
                  Flashcards
                </Button>
                
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={() => {
                    playButtonClickSound();
                    navigate('/leaderboard');
                  }}
                  sx={{ 
                    backgroundColor: '#4caf50', 
                    '&:hover': { backgroundColor: '#388e3c' } 
                  }}
                >
                  Leaderboard
                </Button>

                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#dc004e', 
                    color: 'white',
                    '&:hover': { backgroundColor: '#c51162' } 
                  }} 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>

              {/* Mobile menu */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    playButtonClickSound();
                    handleFlashcardsClick();
                    handleMenuClose();
                  }}>
                    Flashcards
                  </MenuItem>
                  <MenuItem onClick={() => {
                    playButtonClickSound();
                    navigate('/leaderboard');
                    handleMenuClose();
                  }}>
                    Leaderboard
                  </MenuItem>
                  <MenuItem onClick={() => {
                    playButtonClickSound();
                    handleLogout();
                    handleMenuClose();
                  }}>
                    Logout
                  </MenuItem>
                </Menu>
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
                sx={{ backgroundColor: '#1976d2', color: 'white', height: '56px' }}
              >
                Generate Quiz
              </Button>
            </div>
          </form>
          
          <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
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

                {flashcards[currentQuestionIndex].image_link && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <img 
                      src={flashcards[currentQuestionIndex].image_link} 
                      alt="Question related" 
                      style={{ maxWidth: '100%' }} 
                    />
                  </Box>
                )}

                {flashcards[currentQuestionIndex].type === 'matching' ? (
                  <MatchingQuestion
                    pairs={flashcards[currentQuestionIndex].pairs}
                    onMatchingChange={setSelectedAnswers}
                    isSubmitted={hasSubmitted}
                  />
                ) : flashcards[currentQuestionIndex].type === 'sorting' ? (
                  <Box sx={{ display: 'flex', gap: '20px' }}>
                    <DroppableArea 
                      items={unsortedOptions} 
                      setItems={setUnsortedOptions} 
                      droppableId="unsortedOptions" 
                      otherItems={selectedAnswers} 
                      setOtherItems={setSelectedAnswers}
                      disabled={hasSubmitted}
                    />
                    <DroppableArea 
                      items={selectedAnswers} 
                      setItems={setSelectedAnswers} 
                      droppableId="selectedAnswers" 
                      otherItems={unsortedOptions} 
                      setOtherItems={setUnsortedOptions}
                      disabled={hasSubmitted}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {flashcards[currentQuestionIndex].option.map((option, index) => (
                      <Button
                        key={index}
                        variant="contained"
                        sx={{
                          backgroundColor: selectedAnswers.includes(option) ? '#1976d2' : '#e0e0e0',
                          color: selectedAnswers.includes(option) ? 'white' : 'black'
                        }}
                        onClick={() => {
                          handleAnswerSelect(option);
                          playOptionSelectSound();
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ backgroundColor: '#1976d2', color: 'white' }} 
                    disabled={hasSubmitted}
                  >
                    Submit Answer
                  </Button>
                  {showReasoning && (
                    <Button 
                      variant="contained" 
                      sx={{ backgroundColor: '#dc004e', color: 'white' }} 
                      onClick={handleNextQuestion}
                    >
                      Next
                    </Button>
                  )}
                </Box>

                {incompleteAnswer && (
                  <Typography variant="body1" sx={{ color: 'red', marginTop: '10px' }}>
                    Your answer is incomplete. Please transfer all correct items to the sorted box.
                  </Typography>
                )}
              </form>
            )}

            {showReasoning && flashcards[currentQuestionIndex] && (
              <Box sx={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect!'}
                </Typography>
                <Typography variant="body1">
                  {flashcards[currentQuestionIndex].reasoning || ''}
                </Typography>
              </Box>
            )}

            {flashcards.length > 0 && currentQuestionIndex === flashcards.length && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                <Typography variant="h6">
                  Quiz Completed! Your score is {score}/{flashcards.length}.
                </Typography>
                
                {/* Add a special message for high scores */}
                {showHighScoreMessage && (
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#f50057', 
                      fontWeight: 'bold',
                      animation: 'pulse 1.5s infinite',
                      mt: 2,
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' },
                      }
                    }}
                  >
                    🏆 NEW HIGH SCORE! 🏆
                  </Typography>
                )}
                
                <Gauge
                  value={Math.round((score / flashcards.length) * 100)}
                  startAngle={-110}
                  endAngle={110}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 40,
                      transform: 'translate(0px, 0px)',
                    },
                  }}
                  style={{ width: '200px', height: '200px' }}
                  text={({ value }) => `${value}%`}
                />
                {/* Use the new PerformanceBreakdown component which now includes the overall performance message */}
                <PerformanceBreakdown
                  flashcards={flashcards}
                  userAnswers={userAnswers}
                  topicColors={topicColors}
                  category={category}
                  score={score}
                  bestScore={bestScore}
                  bestAttemptCount={bestAttemptCount}
                  prevBestRawBeforeUpdate={prevBestRawBeforeUpdate}
                  prevBestAttemptBeforeUpdate={prevBestAttemptBeforeUpdate}
                />
                
                {/* Add the View Leaderboard button here instead */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    playButtonClickSound(); // Add sound effect
                    navigate('/leaderboard');
                  }}
                  sx={{ mt: 2 }}
                >
                  View Leaderboard
                </Button>
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
              <Button 
                onClick={() => {
                  playButtonClickSound(); // Add sound effect
                  handleDialogClose(true);
                }} 
                sx={{ backgroundColor: '#1976d2', color: 'white' }}
              >
                Yes, I'm sure
              </Button>
              <Button 
                onClick={() => {
                  playButtonClickSound(); // Add sound effect
                  handleDialogClose(false);
                }} 
                sx={{ backgroundColor: '#dc004e', color: 'white' }} 
                autoFocus
              >
                Nevermind
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        {audioElements}
      </DndProvider>
    </DndContext>
  );
};

export default Quiz;
