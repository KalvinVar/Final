import React, { useState } from 'react'; // Step 1.1: Import necessary hooks from React
import { useNavigate } from 'react-router-dom'; // Step 1.2: Import navigation hooks from react-router-dom
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material'; // Step 1.3: Import components from Material-UI
import { registerUser } from '../auth'; // Step 1.4: Import registerUser function from auth module

const Register = () => {
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

      registerUser(username, password); // Step 3.2: Call registerUser function
      navigate('/login'); // Step 3.3: Navigate to the login page after successful registration
    } catch (err) {
      setError(err.message); // Step 3.4: Set error message if registration fails
    }
  };

  // Navigate to the login page
  const handleLoginClick = () => {
    navigate('/login'); // Step 4.1: Navigate to the login page
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F1261646.jpg&f=1&nofb=1&ipt=aca31ee0336b63a2e01d9f2c5b921794f28d18b4388a1db4f499a369c3f1d445&ipo=images')",
        backgroundSize: "cover",
      }}
    >
      <Paper sx={{ padding: '2rem', maxWidth: '400px' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
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
            Register {/* Step 2.3: User presses the submit button */}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Button variant="outlined" color="secondary" fullWidth onClick={handleLoginClick}>
            Already have an account? Login {/* Step 4.2: User presses the login button */}
          </Button>
        </Box>
      </Paper>
    </Box>
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
 *    2.4. (Optional) User can navigate to the login page.
 * 3. handleSubmit is called, which:
 *    3.1. Prevents the default form submission.
 *         e.preventDefault();
 *    3.2. Calls registerUser function.
 *         registerUser(username, password);
 *    3.3. If successful, navigates to the login page.
 *         navigate('/login');
 *    3.4. If the registration fails, an error message is shown.
 *         setError(err.message);
 * 4. handleLoginClick is called, which:
 *    4.1. Navigates to the login page.
 *         navigate('/login');
 */
