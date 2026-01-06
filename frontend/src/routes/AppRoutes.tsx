import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Home from "../pages/Home";
import LandingPage from "../pages/LandingPage";
import ProblemListPage from "../features/problems/pages/ProblemPage";
import EditorPage from "../features/editor/pages/EditorPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import SubmissionsPage from "../pages/SubmissionsPage";
import PvP from "../pages/PvP";
import PvPLobby from "../pages/PvPLobby";
import PvPSession from "../pages/PvPSession";
import MySessions from "../pages/MySessions";
import PublicSessions from "../pages/PublicSessions";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />
        }
      />
      <Route path="/problems" element={<ProblemListPage />} />
      <Route path="/problems/:slug" element={<EditorPage />} />
      <Route path="/users/:username" element={<ProfilePage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pvp"
        element={
          <ProtectedRoute>
            <PvP />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pvp/lobby/:code"
        element={
          <ProtectedRoute>
            <PvPLobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pvp/session/:id"
        element={
          <ProtectedRoute>
            <PvPSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pvp/my-sessions"
        element={
          <ProtectedRoute>
            <MySessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pvp/public"
        element={
          <ProtectedRoute>
            <PublicSessions />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
