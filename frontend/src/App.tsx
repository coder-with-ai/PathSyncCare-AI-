import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientProfilePage from './pages/PatientProfile';
import PatientsPage from './pages/PatientsPage';
import HumanReviewQueue from './pages/HumanReviewQueue';
import PipelineLogs from './pages/PipelineLogs';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientProfilePage />} />
          <Route path="/review" element={<HumanReviewQueue />} />
          <Route path="/pipeline" element={<PipelineLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
