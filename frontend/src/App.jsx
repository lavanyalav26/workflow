import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import AllRequests from './pages/AllRequests';
import CreateRequest from './pages/CreateRequest';
import RequestDetail from './pages/RequestDetail';
import './App.css';

// Component to handle root redirect
const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing and Login routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Navigate to="/login/user" />} />
            <Route path="/login/user" element={<Login />} />
            <Route path="/login/manager" element={<Login />} />
            <Route path="/login/admin" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
            <Route path="/all-requests" element={<PrivateRoute roles={['Manager', 'Admin']}><AllRequests /></PrivateRoute>} />
            {/* Only Users can create requests */}
            <Route path="/create-request" element={<PrivateRoute roles={['User']}><CreateRequest /></PrivateRoute>} />
            <Route path="/requests/:id" element={<PrivateRoute><RequestDetail /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
