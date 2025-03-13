import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, Alert, List, ListItem, ListItemText } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password)
    });
  }, [password]);

  const validatePassword = (password) => {
    return passwordCriteria.length && 
           passwordCriteria.uppercase && 
           passwordCriteria.lowercase && 
           passwordCriteria.digit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (!validatePassword(password)) {
      setError('Please meet all password requirements');
      return;
    }

    try {
      const response = await fetch('https://mindflipkalvin.mooo.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const ValidationIndicator = ({ isValid }) => (
    <Box 
      component="span" 
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: isValid ? '#4caf50' : '#f44336',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        marginRight: '8px'
      }}
    >
      {isValid ? '✓' : '✗'}
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F1261646.jpg&f=1&nofb=1&ipt=aca31ee0336b63a2e01d9f2c5b921794f28d18b4388a1db4f499a369c3f1d445&ipo=images')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Paper sx={{ padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Register
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
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
              required
              error={password.length > 0 && !validatePassword(password)}
              helperText={password.length > 0 && !validatePassword(password) ? "Password doesn't meet requirements" : ""}
            />
          </Box>
          
          {password.length > 0 && (
            <Box mb={2} sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Password Requirements:
              </Typography>
              <List dense disablePadding>
                <ListItem dense disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                  <ValidationIndicator isValid={passwordCriteria.length} />
                  <ListItemText primary="At least 8 characters" />
                </ListItem>
                <ListItem dense disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                  <ValidationIndicator isValid={passwordCriteria.uppercase} />
                  <ListItemText primary="At least one uppercase letter (A-Z)" />
                </ListItem>
                <ListItem dense disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                  <ValidationIndicator isValid={passwordCriteria.lowercase} />
                  <ListItemText primary="At least one lowercase letter (a-z)" />
                </ListItem>
                <ListItem dense disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
                  <ValidationIndicator isValid={passwordCriteria.digit} />
                  <ListItemText primary="At least one number (0-9)" />
                </ListItem>
              </List>
            </Box>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={!username || !validatePassword(password)}
            sx={{ 
              py: 1.2,
              fontWeight: 'bold',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Register
          </Button>
        </form>
        
        <Box mt={2} textAlign="center">
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            onClick={handleLoginClick}
            sx={{ py: 1 }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;