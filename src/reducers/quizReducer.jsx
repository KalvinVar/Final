export const initialState = {
  flashcards: [],
  categories: ['Events', 'People', 'Procedures', 'Quality', 'Random'],
  category: 'Random',
  amount: 12,
  score: 0,
  currentQuestionIndex: 0,
  userAnswers: {},
  selectedAnswers: [],
  unsortedOptions: [],
  showReasoning: false,
  isCorrect: null,
  hasSubmitted: false,
  incompleteAnswer: false,
  quizCompleted: false,
  showHighScoreMessage: false
};

export function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_FLASHCARDS':
      return { ...state, flashcards: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'INCREMENT_SCORE':
      return { ...state, score: state.score + 1 };
    case 'SET_CURRENT_QUESTION_INDEX':
      return { ...state, currentQuestionIndex: action.payload };
    case 'NEXT_QUESTION':
      return { 
        ...state, 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswers: [],
        showReasoning: false,
        isCorrect: null,
        hasSubmitted: false,
        incompleteAnswer: false
      };
    case 'SET_USER_ANSWERS':
      return { 
        ...state, 
        userAnswers: { 
          ...state.userAnswers, 
          [action.payload.questionId]: action.payload.answers 
        } 
      };
    case 'SET_SELECTED_ANSWERS':
      return { ...state, selectedAnswers: action.payload };
    case 'SET_UNSORTED_OPTIONS':
      return { ...state, unsortedOptions: action.payload };
    case 'SET_SHOW_REASONING':
      return { ...state, showReasoning: action.payload };
    case 'SET_IS_CORRECT':
      return { ...state, isCorrect: action.payload };
    case 'SET_HAS_SUBMITTED':
      return { ...state, hasSubmitted: action.payload };
    case 'SET_INCOMPLETE_ANSWER':
      return { ...state, incompleteAnswer: action.payload };
    case 'SET_QUIZ_COMPLETED':
      return { ...state, quizCompleted: action.payload };
    case 'SET_HIGH_SCORE_MESSAGE':
      return { ...state, showHighScoreMessage: action.payload };
    case 'RESET_QUIZ':
      return { 
        ...initialState,
        categories: state.categories,
        category: state.category,
        amount: state.amount
      };
    default:
      return state;
  }
}