import { shuffleArray } from './arrayHelpers';

/**
 * Fetches quiz data for a specific category
 * @param {string} category - The category to fetch
 * @param {function} setIsLoading - Function to update loading state
 * @param {function} setError - Function to update error state
 * @returns {Array} - The fetched data or empty array on error
 */
export const fetchCategoryData = async (category, setIsLoading, setError) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`https://mindflipkalvin.mooo.com/questions?category=${category}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} questions`);
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error fetching ${category} questions:`, err);
    setError(`Failed to load ${category} questions. Please try again later.`);
    return [];
  } finally {
    setIsLoading(false);
  }
};

/**
 * Processes questions to prepare them for the quiz
 * @param {Array} questions - Raw questions data
 * @param {number} amount - Number of questions to include
 * @returns {Array} - Processed questions
 */
export const processQuestions = (questions, amount) => {
  if (!questions || questions.length === 0) {
    return [];
  }
  
  // Shuffle and limit to requested amount
  const shuffled = shuffleArray([...questions]).slice(0, amount);
  
  // Process each question based on type
  return shuffled.map(question => {
    const processedQuestion = { ...question };
    
    // For multiple choice and true/false questions, shuffle options
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      processedQuestion.option = shuffleArray([...question.option]);
    }
    
    // For sorting questions, shuffle options
    if (question.type === 'sorting') {
      processedQuestion.option = shuffleArray([...question.option]);
    }
    
    // For matching questions, keep as is
    
    return processedQuestion;
  });
};

/**
 * Checks if an answer is correct based on question type
 * @param {Object} question - The question object
 * @param {any} userAnswer - The user's answer
 * @returns {boolean} - Whether the answer is correct
 */
export const checkAnswer = (question, userAnswer) => {
  if (!question) return false;
  
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer === question.answer;
      
    case 'true-false':
      return userAnswer === question.answer;
      
    case 'multiple-answer':
      if (!Array.isArray(userAnswer) || !Array.isArray(question.answer)) return false;
      return userAnswer.length === question.answer.length && 
             question.answer.every(a => userAnswer.includes(a));
      
    case 'sorting':
      if (!Array.isArray(userAnswer) || !Array.isArray(question.answer)) return false;
      return JSON.stringify(userAnswer) === JSON.stringify(question.answer);
      
    case 'matching':
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      const expectedPairs = question.pairs;
      
      // Check if all topic-description pairs match
      return Object.entries(userAnswer).every(([topic, descriptions]) => {
        const expectedDescription = expectedPairs.find(pair => pair.topic === topic)?.description;
        return descriptions[0] === expectedDescription;
      });
      
    default:
      return false;
  }
};