import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import WeddingPage from './components/Wedding/WeddingPage'
import About from './components/About'
import './App.css'
import SpotAI from './components/SpotAI'
import LoginPage from './components/Auth/LoginPage'
import { AuthProvider } from "./components/Auth/AuthContext";
import { RequireAuth } from "./components/Auth/RequireAuth";
import LayoutWithNav from './components/LayoutWithNav'


function App() {
  
  return (
   
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public: no navbar */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected: navbar only shows when logged in */}
          <Route
            element={
              <RequireAuth>
                <LayoutWithNav />
              </RequireAuth>
            }
          >
            <Route path="/wedding" element={<WeddingPage />} />
            <Route path="/spotai" element={<SpotAI />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  
  )
}

export default App
