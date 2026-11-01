import { FullPageLoader } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router";

/**
 * The authenticated home: the opportunity feed is the main screen for
 * students, the posting workspace for recruiters, and anyone without a role
 * picks one first.
 */
export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  if (user?.role === "recruiter") return <Navigate to="/postings" replace />;
  if (user?.role === "student") return <Navigate to="/feed" replace />;
  return <Navigate to="/role" replace />;
}
