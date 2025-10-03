import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import Navigation from './components/Navigation'
import WeddingPage from './components/Wedding/WeddingPage'
import About from './components/About'
import './App.css'
import SpotAI from './components/SpotAI'
import LoginPage from './components/Auth/LoginPage'
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import { RequireAuth } from "./components/Auth/RequireAuth";
import LayoutWithNav from './components/LayoutWithNav'
import SpendingPage from './components/Spending/SpendingPage'



function AppRoutes() {
  const { canAccess } = useAuth();               
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LoginPage />} />

      {/* Protected routes (require login + nav) */}
      <Route
        element={
          <RequireAuth>
            <LayoutWithNav />
          </RequireAuth>
        }
      >
        {/* Feature-gated routes */}
        <Route
          path="/wedding"
          element={canAccess("wedding") ? <WeddingPage /> : <Navigate to="/about" replace />}
        />
        <Route
          path="/spotai"
          element={canAccess("spotai") ? <SpotAI /> : <Navigate to="/about" replace />}
        />

        {/* Always accessible */}
        <Route path="/spending" element={<SpendingPage />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}