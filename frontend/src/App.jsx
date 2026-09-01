import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { ROLES } from "./utils/constants.js";

import { Dashboard as StudentDashboard } from "./pages/student/Dashboard.jsx";
import { PlacementDrives } from "./pages/student/PlacementDrives.jsx";
import { DriveDetails } from "./pages/student/DriveDetails.jsx";
import { MyApplications } from "./pages/student/MyApplications.jsx";
import { Profile as StudentProfile } from "./pages/student/Profile.jsx";

import { Dashboard as TpoDashboard } from "./pages/tpo/Dashboard.jsx";
import { Drives as TpoDrives } from "./pages/tpo/Drives.jsx";
import { CreateDrive } from "./pages/tpo/CreateDrive.jsx";
import { EditDrive } from "./pages/tpo/EditDrive.jsx";
import { DriveApplicants } from "./pages/tpo/DriveApplicants.jsx";
import { Students as TpoStudents } from "./pages/tpo/Students.jsx";

import { Dashboard as RecruiterDashboard } from "./pages/recruiter/Dashboard.jsx";
import { Drives as RecruiterDrives } from "./pages/recruiter/Drives.jsx";
import { Candidates } from "./pages/recruiter/Candidates.jsx";
import { CandidateDetails } from "./pages/recruiter/CandidateDetails.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* STUDENT */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<AppLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/drives" element={<PlacementDrives />} />
          <Route path="/student/drives/:driveId" element={<DriveDetails />} />
          <Route path="/student/applications" element={<MyApplications />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* TPO */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.TPO]} />}>
        <Route element={<AppLayout />}>
          <Route path="/tpo/dashboard" element={<TpoDashboard />} />
          <Route path="/tpo/drives" element={<TpoDrives />} />
          <Route path="/tpo/drives/create" element={<CreateDrive />} />
          <Route path="/tpo/drives/:id/edit" element={<EditDrive />} />
          <Route path="/tpo/drives/:id/applicants" element={<DriveApplicants />} />
          <Route path="/tpo/students" element={<TpoStudents />} />
        </Route>
      </Route>

      {/* RECRUITER */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.RECRUITER]} />}>
        <Route element={<AppLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/drives" element={<RecruiterDrives />} />
          <Route path="/recruiter/drives/:driveId/candidates" element={<Candidates />} />
          <Route path="/recruiter/drives/:driveId/candidates/:applicationId" element={<CandidateDetails />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}