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
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MatchingQuestion from './MatchingQuestion'; // Adjust the import path as necessary
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable'; // install if needed: npm install @dnd-kit/sortable

const Quiz = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState(['Events', 'People', 'Procedures', 'Quality']);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(12);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [unsortedOptions, setUnsortedOptions] = useState([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [incompleteAnswer, setIncompleteAnswer] = useState(false);
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
        const correctAnswers = Array.isArray(qItem.correct_answers) ? qItem.correct_answers.map(htmldecoder) : [htmldecoder(qItem.correct_answer)];
        const incorrectAnswers = qItem.incorrect_answers ? qItem.incorrect_answers.map(o => htmldecoder(o)) : [];
        const options = [...incorrectAnswers, ...correctAnswers];
        return {
          id: qItem.id,
          question: htmldecoder(qItem.question),
          ans: correctAnswers,
          option: options.sort(() => Math.random() - 0.5), // Shuffle options
          reasoning: qItem.reasoning || '',
          image_link: qItem.image_link || null,
          correct_order: qItem.correct_order || [],
          answers: qItem.answers || [], // Ensure answers property is populated
          type: qItem.type || 'multiple-choice', // Add type property
          pairs: qItem.pairs || [] // Add pairs property for matching questions
        };
      });
    setFlashcards(selectedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswers([]);
    setUnsortedOptions(shuffleArray(selectedQuestions[0].answers)); // Initialize unsortedOptions with the shuffled answers of the first question
    setShowReasoning(false);
    setIsCorrect(null);
    setHasSubmitted(false);
    setIncompleteAnswer(false);
  };

  const handleAnswerSelect = (option) => {
    if (hasSubmitted) return;

    const currentQuestion = flashcards[currentQuestionIndex];
    const isMultipleChoice = currentQuestion.ans.length > 1;
    const isRanking = currentQuestion.correct_order.length > 0;

    if (isMultipleChoice || isRanking) {
      setSelectedAnswers((prevSelected) => {
        if (prevSelected.includes(option)) {
          return prevSelected.filter((answer) => answer !== option);
        } else {
          return [...prevSelected, option];
        }
      });
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const currentQuestion = flashcards[currentQuestionIndex];
    const correctAnswers = currentQuestion.ans;
    const correctOrder = currentQuestion.correct_order;
    const pairs = currentQuestion.pairs;

    // Check if the answer is incomplete
    if (correctOrder.length > 0 && selectedAnswers.length !== correctOrder.length) {
      setIncompleteAnswer(true);
      return;
    }

    if (selectedAnswers.length > 0 && !hasSubmitted) {
      setUserAnswers([...userAnswers, selectedAnswers]);
      let isAnswerCorrect;

      if (correctOrder.length > 0) {
        isAnswerCorrect = JSON.stringify(selectedAnswers) === JSON.stringify(correctOrder);
      } else if (pairs.length > 0) {
        isAnswerCorrect = pairs.every(pair => selectedAnswers.some(answer => answer.term === pair.term && answer.definition === pair.definition));
      } else {
        isAnswerCorrect = correctAnswers.every((answer) => selectedAnswers.includes(answer)) && selectedAnswers.length === correctAnswers.length;
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

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswers([]);
    setUnsortedOptions(shuffleArray(flashcards[currentQuestionIndex + 1].answers)); // Initialize unsortedOptions with the shuffled answers of the next question
    setShowReasoning(false);
    setIsCorrect(null);
    setHasSubmitted(false);
    setIncompleteAnswer(false);
  };

  const handleLogout = () => {
    if (currentQuestionIndex >= flashcards.length) {
      logoutUser();
      navigate('/login');
    } else {
      setOpenDialog(true);
    }
  };

  const handleFlashcardsClick = () => {
    if (currentQuestionIndex >= flashcards.length) {
      navigate('/app');
    } else {
      setOpenDialog(true);
    }
  };

  const handleDialogClose = (confirm) => {
    setOpenDialog(false);
    if (confirm) {
      logoutUser();
      navigate('/login');
    }
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

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
      cursor: disabled ? 'default' : 'grab',
      marginBottom: '10px',
    };

    return (
      <div ref={setNodeRef} style={style} {...(disabled ? {} : { ...listeners, ...attributes })}>
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
      setUnsortedOptions((prev) => prev.filter((item) => item !== draggedItem));
      setSelectedAnswers((prev) => [...prev, draggedItem]);
    }
    // Moving from selectedAnswers to unsortedOptions
    else if (sourceId === 'selectedAnswers' && targetId === 'unsortedOptions') {
      setSelectedAnswers((prev) => prev.filter((item) => item !== draggedItem));
      setUnsortedOptions((prev) => [...prev, draggedItem]);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DndProvider backend={HTML5Backend}>
        <div
          className="app-container"
          style={{ overflowX: 'hidden', overflowY: 'hidden', height: '100vh' }}
        >
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
                  sx={{ backgroundColor: '#1976d2', color: 'white' }} // Hardcoded color
                  onClick={handleFlashcardsClick}
                >
                  Flashcards
                </Button>
                <Button variant="contained" sx={{ backgroundColor: '#dc004e', color: 'white' }} onClick={handleLogout}>
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
              <Button type="submit" variant="contained" sx={{ backgroundColor: '#1976d2', color: 'white', height: '56px' }}>
                Generate Quiz
              </Button>
            </div>
          </form>

          <Paper
            elevation={3}
            sx={{
              padding: '20px',
              backgroundColor: 'white',
              overflow: 'hidden', // prevent both horizontal and vertical overflow
              position: 'relative', // contain absolutely positioned elements
              maxWidth: '100%', // ensure it doesn't exceed its container
              boxSizing: 'border-box',
            }}
          >
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
                    <img src={flashcards[currentQuestionIndex].image_link} alt="Question related" style={{ maxWidth: '100%' }} />
                  </Box>
                )}
                {flashcards[currentQuestionIndex].type === 'matching' ? (
                  <MatchingQuestion
                    pairs={flashcards[currentQuestionIndex].pairs}
                    onMatchingChange={setSelectedAnswers}
                    isSubmitted={hasSubmitted}  // pass submission state
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
                        sx={{ backgroundColor: selectedAnswers.includes(option) ? '#1976d2' : '#e0e0e0', color: selectedAnswers.includes(option) ? 'white' : 'black' }}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <Button type="submit" variant="contained" sx={{ backgroundColor: '#1976d2', color: 'white' }} disabled={hasSubmitted}>
                    Submit Answer
                  </Button>
                  {showReasoning && (
                    <Button variant="contained" sx={{ backgroundColor: '#dc004e', color: 'white' }} onClick={handleNextQuestion}>
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
              <Button onClick={() => handleDialogClose(true)} sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                Yes, I'm sure
              </Button>
              <Button onClick={() => handleDialogClose(false)} sx={{ backgroundColor: '#dc004e', color: 'white' }} autoFocus>
                Nevermind
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </DndProvider>
    </DndContext>
  );
};

export default Quiz;
