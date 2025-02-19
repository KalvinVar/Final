/**
 * Registers a new user.
 * Input: username, password
 * Process:
 * 1. Retrieve existing users from localStorage
 * 2. Check if username already exists
 *    - If yes, throw an error: "Username is already taken"
 *    - If no, add new user with the password
 * 3. Save updated users to localStorage
 * Output: User registered
 */
export const registerUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || {}; // Step 1: Retrieve existing users

  if (users[username]) {
    throw new Error('Username is already taken'); // Step 2.1: Throw error if username is taken
  }

  users[username] = { password }; // Step 2.2: Add new user
  localStorage.setItem('users', JSON.stringify(users)); // Step 3: Save updated users to localStorage
};



/**
 * Logs in a user.
 * Input: username, password
 * Process:
 * 1. Retrieve existing users from localStorage
 * 2. Check if username exists and password matches
 *    - If yes, set authentication status and current user in localStorage
 *    - If no, throw an error: "Invalid credentials"
 * Output: User logged in
 */
export const loginUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || {}; // Step 1: Retrieve existing users

  if (users[username] && users[username].password === password) {
    localStorage.setItem('isAuthenticated', 'true'); // Step 2.1: Set authentication status
    localStorage.setItem('currentUser', username); // Step 2.2: Set current user
  } else {
    throw new Error('Invalid credentials'); // Step 2.3: Throw error if login fails
  }
};



/**
 * Logs out the current user.
 * Input: None
 * Process:
 * 1. Remove authentication status and current user from localStorage
 * Output: User logged out
 */
export const logoutUser = () => {
  localStorage.removeItem('isAuthenticated'); // Step 1: Remove authentication status
  localStorage.removeItem('currentUser'); // Step 2: Remove current user
};



/**
 * Gets the current user.
 * Input: None
 * Process:
 * 1. Retrieve current user from localStorage
 * Output: Current user
 */
export const getCurrentUser = () => localStorage.getItem('currentUser'); // Step 1: Retrieve current user



/**
 * Checks if a user is authenticated.
 * Input: None
 * Process:
 * 1. Check if isAuthenticated is set to true in localStorage
 * Output: Authentication status
 */
export const isAuthenticated = () => localStorage.getItem('isAuthenticated') === 'true'; // Step 1: Check authentication status
