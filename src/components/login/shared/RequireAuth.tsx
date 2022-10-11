import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();

  if (!auth.user) {
    return <Navigate to={"/login"} replace />;
  }

  return children;
}
