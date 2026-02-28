import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DashboardLayout } from "./components/aurora";
import LoginPage from "./components/aurora/LoginPage";

function AppRoutes(): JSX.Element {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
