import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import School from "./pages/School";
import Hostel from "./pages/Hostel";
import Navbar from "./components/Navbar";
import Admission from "./pages/Admission";
import Booking from "./pages/Booking";
import AdminAdmissions from "./pages/admin/AdminAdmissions";
import AdminBookings from "./pages/admin/AdminBookings";
import AIFeeReminder from "./pages/admin/AIFeeReminder";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { AdminRoute} from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import MyBookings from './pages/MyBookings';
import MyApplications from './pages/MyApplications';




function App() {
  return (
    <Router>
      <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/school" element={<School />} />
        <Route path="/hostel" element={<Hostel />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin/admissions" element={<AdminRoute><AdminAdmissions /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
        <Route path="/admin/ai-fee" element={<AIFeeReminder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/my-bookings" element={
  <ProtectedRoute allowedCategories={['hostel']}>
    <MyBookings />
  </ProtectedRoute>
} />
<Route path="/my-applications" element={
  <ProtectedRoute allowedCategories={['school']}>
    <MyApplications />
  </ProtectedRoute>
} />
        {/* Unauthorized Page */}
            <Route path="/unauthorized" element={
              <div className="unauthorized">
                <h1>401 Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />


      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
