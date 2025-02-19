import React, { useState } from "react"; // Step 1.1: Import necessary hooks from React
import { useNavigate } from "react-router-dom"; // Step 1.2: Import navigation hooks from react-router-dom
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material"; // Step 1.3: Import components from Material-UI
import { loginUser } from "../auth"; // Step 1.4: Import loginUser function from auth module

// Login Component
const Login = () => {
  // State hooks for username, password, and error messages
  const [username, setUsername] = useState(""); // Step 2.1: Initialize state for username
  const [password, setPassword] = useState(""); // Step 2.2: Initialize state for password
  const [error, setError] = useState(""); // Step 2.3: Initialize state for error messages
  const navigate = useNavigate(); // Step 2.4: Initialize useNavigate for navigation

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Step 3.1: Prevent default form submission behavior
    try {
      if (!username || !password) {
        setError('Username and password are required'); // Step 3.1.1: Set error message if inputs are empty
        return;
      }
      await loginUser(username, password); // Step 3.2: Call loginUser function
      navigate("/app"); // Step 3.3: Navigate to the main app page upon success
    } catch (err) {
      setError(err.message); // Step 3.4: Set error message if login fails
    }
  };

  // Navigate to the register page
  const handleRegisterClick = () => {
    navigate('/register'); // Step 4.1: Navigate to the register page
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
      <Paper sx={{ padding: "2rem", maxWidth: "400px" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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
    </Box>
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
 *    2.4. (Optional) User can navigate to the register page.
 * 3. handleSubmit is called, which:
 *    3.1. Prevents the default form submission.
 *         e.preventDefault();
 *    3.2. Calls loginUser function.
 *         loginUser(username, password);
 *    3.3. If successful, navigates to the main app page.
 *         navigate('/app');
 *    3.4. If the login fails, an error message is shown.
 *         setError(err.message);
 * 4. handleRegisterClick is called, which:
 *    4.1. Navigates to the register page.
 *         navigate('/register');
 */
