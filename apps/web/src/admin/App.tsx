import "./App.css";

document.title = "R|P Admin";
import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "../customTheme";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Attendance from "./routes/Attendance";
import routes from "./routes";
import { AuthCallback, googleAuth } from "@rp/shared";
import Main from "./routes/Main";
import { useEffect } from "react";

function RefreshHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    googleAuth(false, redirect ?? undefined);
  }, []);

  return <p>Redirecting to login...</p>;
}

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/refresh" element={<RefreshHandler />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route element={<Main />}>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
