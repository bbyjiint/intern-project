import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import RoleSelection from './pages/RoleSelection'
import InternDashboard from './pages/InternDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerProfileSetup from './pages/EmployerProfileSetup'
import CandidateFullProfile from './pages/CandidateFullProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/intern/dashboard" element={<InternDashboard />} />
        <Route path="/employer/profile-setup" element={<EmployerProfileSetup />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/candidate/:name" element={<CandidateFullProfile />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App


