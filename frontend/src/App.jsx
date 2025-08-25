import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Callback from './pages/Callback'
import SortResult from './pages/SortResult'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/sort-result" element={<SortResult />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
