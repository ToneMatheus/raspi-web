import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import WeddingPage from './components/Wedding/WeddingPage'
import About from './components/About'
import './App.css'
import SpotAI from './components/SpotAI'


function App() {
  
  return (
   
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<WeddingPage />} />
            <Route path="/spotai" element={<SpotAI />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
  
  )
}

export default App
