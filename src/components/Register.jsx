import React, { useState } from 'react'; // Import React and necessary hooks
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { TextField, Button, Box, Typography, Paper } from '@mui/material'; // Import Material-UI components

const Register = () => {
  // State for form inputs
  const [username, setUsername] = useState(''); // State to store the username input
  const [password, setPassword] = useState(''); // State to store the password input

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Step 3.1: Prevent the default form submission behavior

    // Step 3.2: Retrieve existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Step 3.3: Create a new user object
    const newUser = { username, password };

    // Step 3.4: Add the new user to the users array
    users.push(newUser);

    // Step 3.5: Save the updated users array to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Step 3.6: Navigate to the login page after successful registration
    navigate('/login');
  };

  return (
    <Paper sx={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Register
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
          Register {/* Step 2.3: User presses the submit button */}
        </Button>
      </form>
    </Paper>
  );
};

export default Register;

/**
 * Registration Flow:
 * 1. User navigates to the registration page.
 * 2. User fills out the registration form:
 *    2.1. User inputs the username.
 *    2.2. User inputs the password.
 *    2.3. User presses the submit button.
 * 3. handleSubmit is called, which:
 *    3.1. Prevents the default form submission.
 *    3.2. Retrieves existing users from localStorage.
 *    3.3. Creates a new user object and adds it to the users array.
 *    3.4. Adds the new user to the users array.
 *    3.5. Saves the updated users array back to localStorage.
 *    3.6. Navigates to the login page.
 */
