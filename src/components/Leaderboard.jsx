import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAudioService from '../services/AudioService';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Get current user from localStorage
  const currentUser = localStorage.getItem('currentUser');
  
  // Categories matching your quiz categories
  const categories = ['Overall', 'Events', 'People', 'Procedures', 'Quality'];
  
  const { playOptionSelectSound, playButtonClickSound } = useAudioService();
  
  useEffect(() => {
    fetchLeaderboardData();
  }, [tabValue]);
  
  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current category from the selected tab
      const category = categories[tabValue];
      
      // Fetch from your MySQL backend with category parameter
      const response = await fetch(`https://mindflipkalvin.mooo.com/leaderboard?category=${category}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data (Status: ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data && data.leaderboard) {
        // Transform the data to match your component's expectations
        const transformedData = data.leaderboard.map(item => ({
          username: item.username,
          score: item.top_score,
          attempts: item.attempts || 0,
          rawScore: item.raw_score || 0
        }));
        
        setLeaderboardData(transformedData);
      } else {
        setLeaderboardData([]);
      }
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data. Please try again later.");
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    playOptionSelectSound(); // Play sound when changing tabs
    setTabValue(newValue);
  };
  
  return (
    <Paper elevation={3} sx={{ padding: '20px', maxWidth: '800px', margin: '20px auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button 
          variant="outlined" 
          onClick={() => {
            playButtonClickSound(); // Play sound when clicking back button
            navigate('/quiz');
          }}
        >
          Back to Quiz
        </Button>
        <Typography variant="h4" align="center" sx={{ flexGrow: 1 }}>
          Quiz Leaderboard
        </Typography>
      </Box>
      
      {/* Centered tabs implementation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'auto', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
        >
          {categories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box>
          <Typography color="error" align="center" gutterBottom>
            {error}
          </Typography>
        </Box>
      ) : null}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Questions Attempted</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Correct Answers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.length > 0 ? (
              leaderboardData.map((user, index) => (
                <TableRow 
                  key={user.username}
                  sx={{ 
                    backgroundColor: user.username === currentUser ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                    '&:nth-of-type(odd)': { backgroundColor: user.username === currentUser ? 'rgba(25, 118, 210, 0.1)' : '#fafafa' }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {user.username}
                    {user.username === currentUser && " (You)"}
                  </TableCell>
                  <TableCell align="right">{user.score}</TableCell>
                  <TableCell align="right">{user.attempts || '-'}</TableCell>
                  <TableCell align="right">{user.rawScore || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No scores available yet! Complete a quiz to be the first on the leaderboard.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Leaderboard;