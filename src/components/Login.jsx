import React, { useState } from 'react'; // Step 1.1: Import necessary hooks from React
import { useNavigate } from 'react-router-dom'; // Step 1.2: Import navigation hooks from react-router-dom
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material'; // Step 1.3: Import components from Material-UI
import { loginUser } from '../auth'; // Step 1.4: Import loginUser function from auth module

const Login = () => {
  const [username, setUsername] = useState(''); // Step 2.1: Initialize state for username
  const [password, setPassword] = useState(''); // Step 2.2: Initialize state for password
  const [error, setError] = useState(''); // Step 2.3: Initialize state for error messages
  const navigate = useNavigate(); // Step 2.4: Initialize useNavigate for navigation

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Step 3.1: Prevent the default form submission behavior

    try {
      if (!username || !password) {
        setError('Username and password are required'); // Step 3.1.1: Set error message if inputs are empty
        return;
      }

      loginUser(username, password); // Step 3.2: Call loginUser function
      navigate('/app'); // Step 3.3: Navigate to the main app page
    } catch (err) {
      setError(err.message); // Step 3.4: Set error message if login fails
    }
  };

  // Navigate to the registration page
  const handleRegisterClick = () => {
    navigate('/register'); // Step 4.1: Navigate to the registration page
  };

  return (
    <Paper sx={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error">{error}</Alert>} {/* Step 3.4: Display error message */}
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
        <Button variant="outlined" color="secondary" fullWidth onClick={handleRegisterClick}>
          Don't have an account? Register {/* Step 4.2: User presses the register button */}
        </Button>
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
 *         e.preventDefault();
 *    3.2. Calls loginUser function.
 *         loginUser(username, password);
 *    3.3. If successful, navigates to the main app.
 *         navigate('/app');
 *    3.4. If the login fails, an error message is shown.
 *         setError(err.message);
 * 4. handleRegisterClick is called, which:
 *    4.1. Navigates to the registration page.
 *         navigate('/register');
 */
