import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DirectorTasksPage from "./pages/DirectorTasksPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import TeacherCoursesPage from "./pages/TeacherCoursesPage.jsx";
import CourseManageDetailsPage from "./pages/CourseManageDetailsPage.jsx";
import MySubmissionsPage from "./pages/MySubmissionsPage.jsx";
import GradeSubmissionsPage from "./pages/GradeSubmissionsPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />

        <Route
          path="/manage-courses"
          element={
            <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
              <TeacherCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-courses/:id"
          element={
            <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
              <CourseManageDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/grade-submissions"
          element={
            <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
              <GradeSubmissionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <MySubmissionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/director-tasks"
          element={
            <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
              <DirectorTasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}