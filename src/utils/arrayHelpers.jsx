/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - A new shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Checks if two arrays contain the same elements regardless of order
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {boolean} - Whether the arrays are equal
 */
export const arraysEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  
  return sortedA.every((val, idx) => val === sortedB[idx]);
};

/**
 * Removes duplicates from an array
 * @param {Array} array - The array with potential duplicates
 * @returns {Array} - A new array with unique values
 */
export const uniqueArray = (array) => {
  return [...new Set(array)];
};