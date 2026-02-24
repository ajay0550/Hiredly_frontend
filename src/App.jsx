import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Jobs from "./pages/Jobs";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Applicant Route */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="applicant">
              <Jobs />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Route */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;