import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Home } from "./components/home/Home";
import { Login } from "./components/login/Login";
import { RequireAuth } from "./components/login/shared/RequireAuth";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
        </Routes>
        <Outlet />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
