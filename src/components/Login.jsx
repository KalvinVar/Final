import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState("");       // State for error messages
  const navigate = useNavigate();

  // Function to handle form submission using the API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch("https://mindflipkalvin.mooo.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }
      
      // Set authentication flag AND username
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", username);
      
      // Store the user ID from the response
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }
      
      // Clear any errors
      setError("");
      
      // Force a redirect to the app page
      console.log("Login successful, redirecting to /app");
      setTimeout(() => {
        navigate("/app", { replace: true });
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  // Navigate to the register page
  const handleRegisterClick = () => {
    navigate("/register");
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
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Button variant="outlined" color="secondary" fullWidth onClick={handleRegisterClick}>
            Don't have an account? Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
