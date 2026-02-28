import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DashboardLayout } from "./components/aurora";
import LoginPage from "./components/aurora/LoginPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
