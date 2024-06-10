export const registerUser = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || {}; // Get existing users from localStorage
  
    if (users[username]) {
      throw new Error('Username is already taken'); // Step 3.4: Throw error if username is taken
    }
  
    users[username] = { password }; // Step 3.2: Add new user
    localStorage.setItem('users', JSON.stringify(users)); // Step 3.2: Save updated users to localStorage
  };
  
  export const loginUser = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || {}; // Get existing users from localStorage
  
    if (users[username] && users[username].password === password) {
      localStorage.setItem('isAuthenticated', 'true'); // Step 3.4.1: Set authentication status in localStorage
      localStorage.setItem('currentUser', username); // Step 3.4.2: Set current user in localStorage
    } else {
      throw new Error('Invalid credentials'); // Step 3.5: Throw error if login fails
    }
  };
  
  export const logoutUser = () => {
    localStorage.removeItem('isAuthenticated'); // Remove authentication status from localStorage
    localStorage.removeItem('currentUser'); // Remove current user from localStorage
  };
  
  export const getCurrentUser = () => localStorage.getItem('currentUser'); // Get current user from localStorage
  export const isAuthenticated = () => localStorage.getItem('isAuthenticated') === 'true'; // Check if user is authenticated
  