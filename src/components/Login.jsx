import React, { useState } from 'react'; // Import React and necessary hooks
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link for navigation
import { TextField, Button, Box, Typography, Paper } from '@mui/material'; // Import Material-UI components

const Login = () => {
  // State for form inputs
  const [username, setUsername] = useState(''); // State to store the username input
  const [password, setPassword] = useState(''); // State to store the password input

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Step 3.1: Prevent the default form submission behavior

    // Step 3.2: Retrieve existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Step 3.3: Find the user in the users array
    const user = users.find(user => user.username === username && user.password === password);

    // Step 3.4: Check if user exists and password matches
    if (user) {
      localStorage.setItem('isAuthenticated', 'true'); // Step 3.4.1: Set authentication status in localStorage
      localStorage.setItem('currentUser', username); // Step 3.4.2: Set current user in localStorage
      navigate('/app'); // Step 3.4.3: Navigate to the main app
    } else {
      alert('Invalid username or password'); // Step 3.5: Show error if login fails
    }
  };

  return (
    <Paper sx={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Step 2.1: User inputs the username
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Step 2.2: User inputs the password
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login {/* Step 2.3: User presses the submit button */}
        </Button>
      </form>
      <Box mt={2} textAlign="center">
        <Link to="/register">Don't have an account? Register</Link> {/* Step 2.4: Link to registration page */}
      </Box>
    </Paper>
  );
};

export default Login;

/**
 * Login Flow:
 * 1. User navigates to the login page.
 * 2. User fills out the login form:
 *    2.1. User inputs the username.
 *    2.2. User inputs the password.
 *    2.3. User presses the submit button.
 *    2.4. (Optional) User can navigate to the registration page.
 * 3. handleSubmit is called, which:
 *    3.1. Prevents the default form submission.
 *    3.2. Retrieves existing users from localStorage.
 *    3.3. Finds the user in the users array.
 *    3.4. If the user exists and the password matches:
 *         3.4.1. Sets authentication status in localStorage.
 *         3.4.2. Sets current user in localStorage.
 *         3.4.3. Navigates to the main app.
 *    3.5. If the login fails, an error message is shown.
 */
