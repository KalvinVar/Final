import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './components/Quiz';
import Leaderboard from './components/Leaderboard'; // Add this import

const Root = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <Navigate to="/app" /> : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<App />} />
        <Route path="/quiz" element={<Quiz />} /> {/* Add this route */}
        <Route path="/leaderboard" element={<Leaderboard />} /> {/* Add this route */}
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
