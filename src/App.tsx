import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
// import Navigation from './components/Navigation'
import WeddingPage from './components/Wedding/WeddingPage'
import About from './components/AboutMe/About'
import './App.css'
import SpotAI from './components/SpotAI'
// import LoginPage from './components/Auth/LoginPage'
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import { RequireAuth } from "./components/Auth/RequireAuth";
import LayoutWithNav from './components/LayoutWithNav'
import SpendingPage from './components/Spending/SpendingPage'
import Reader from './components/Reader/Reader'
import QtTest from './components/QtTest'
import QtHobbyCount from './components/QtHobbyCount'

function AppRoutes() {
  const { canAccess } = useAuth();               
  return (
    <Routes>
      {/* Use LayoutWithNav as the top-level layout so the background video is shown on public pages like About */}
      <Route element={<LayoutWithNav />}>
        {/* About as the root (index) page */}
        <Route index element={<About />} />

        {/* Always accessible pages inside the layout */}
        <Route path="spending" element={<SpendingPage />} />
        
        {/*<Route
          path="moneybalance"
          element={<Navigate to="/Qt/MoneyBalance.html" replace />}
        />*/}
        
        <Route
          path="moneybalance"
          element={<QtTest/>}
        />
        <Route path="hobbycount" element={<QtHobbyCount />} />
        {/* Protected routes: require auth, then feature gating */}
        <Route
          element={<RequireAuth><Outlet /></RequireAuth>}
        >
          <Route
            path="wedding"
            element={canAccess("wedding") ? <WeddingPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="spotai"
            element={canAccess("spotai") ? <SpotAI /> : <Navigate to="/" replace />}
          />
          <Route
            path="reader"
            element={canAccess("reader") ? <Reader /> : <Navigate to="/" replace />}
          />
        </Route>
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