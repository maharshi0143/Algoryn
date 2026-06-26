import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { AuthLayout, RootLayout, OnboardingLayout } from "../layouts";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Loading from "../components/common/Loading";
import ErrorBoundary from "../components/common/ErrorBoundary";

const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Welcome = lazy(() => import("../pages/Welcome"));
const Intro = lazy(() => import("../pages/Intro"));
const Connect = lazy(() => import("../pages/Connect"));
const Import = lazy(() => import("../pages/Import"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.landing} element={<Landing />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<Login />} />
            <Route path={ROUTES.register} element={<Register />} />
          </Route>

          {/* Onboarding */}
          <Route
            element={
              <ProtectedRoute>
                <OnboardingLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.welcome} element={<Welcome />} />
            <Route path={ROUTES.intro} element={<Intro />} />
            <Route path={ROUTES.connect} element={<Connect />} />
            <Route path={ROUTES.import} element={<Import />} />
          </Route>

          {/* Protected App */}
          <Route
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.dashboard} element={<Dashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
