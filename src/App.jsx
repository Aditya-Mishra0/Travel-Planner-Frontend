import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import SignUp from './features/auth/Register';
import TripDashboard from './features/trips/TripDashboard';
import TripPage from './features/trips/TripPage';

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));

  const handleAuthSuccess = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      <div className="bg-slate-50 min-h-screen font-sans">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!userId ? <Login onLoginSuccess={handleAuthSuccess} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/signup" 
            element={!userId ? <SignUp onSignUpSuccess={handleAuthSuccess} /> : <Navigate to="/dashboard" />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={userId ? <TripDashboard userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/trip/:tripId" 
            element={userId ? <TripPage userId={userId} /> : <Navigate to="/login" />} 
          />

          {/* Redirect to dashboard or login by default */}
          <Route path="*" element={<Navigate to={userId ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;