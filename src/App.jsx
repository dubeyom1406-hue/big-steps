import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdmissionForm from './pages/AdmissionForm'
import AllStudents from './pages/AllStudents'
import FeeAnalytics from './pages/FeeAnalytics'
import AdminSubjects from './pages/AdminSubjects'
import AdminMaterials from './pages/AdminMaterials'

import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Admin Routes with persistent Sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admission" element={<AdmissionForm />} />
          <Route path="/all-students" element={<AllStudents />} />
          <Route path="/subjects" element={<AdminSubjects />} />
          <Route path="/materials" element={<AdminMaterials />} />
          <Route path="/analytics" element={<FeeAnalytics />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App
