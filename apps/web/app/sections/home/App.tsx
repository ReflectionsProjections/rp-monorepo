import "./index.css";
import { Box, ChakraProvider, VStack } from "@chakra-ui/react";
import { customTheme } from "@app/theme";
import { RequireAuth } from "@app";
import RequireRegistrationAuth from "@components/auth/RequireRegistrationAuth";
import ErrorBoundary from "@components/ErrorBoundary";
import { useMemo } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import { Login } from "./routes/Login";
import { MagicLinkCallback } from "./routes/MagicLinkCallback";
import { Profile } from "./routes/Profile";
import Register from "./routes/Register";
import Resume from "./routes/Resume";
import Speakers from "./routes/Speakers/Speakers";
import AppScreen from "./routes/AppScreen";
import NotFound from "./routes/NotFound";

document.title = "R|P 2026";

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <ErrorBoundary>
        <Routes>
          <Route element={<Main />}>
            <Route path="/" element={<Home />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/app" element={<AppScreen />} />
            <Route element={<RequireRegistrationAuth />}>
              <Route key="/register" path="/register" element={<Register />} />
            </Route>
          </Route>
          <Route element={<RequireAuth />}>
            <Route key="/resume" path="/resume" element={<Resume />} />
            <Route key="/profile" path="/profile" element={<Profile />} />
          </Route>
          <Route path="/login" element={<Login />} />
          {/* Callback paths are fixed by the API's MAGIC_LINK_*_CALLBACK config */}
          <Route
            path="/auth/login"
            element={<MagicLinkCallback destination="/" />}
          />
          <Route
            path="/auth/registration"
            element={<MagicLinkCallback destination="/register" />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

const FLUSH_ROUTES = ["/register"];

function Main() {
  const { pathname } = useLocation();

  const isFlush = useMemo(() => FLUSH_ROUTES.includes(pathname), [pathname]);

  return (
    <VStack
      id="home-scroll-container"
      w="100%"
      h="100dvh"
      position="relative"
      zIndex={9}
      gap={0}
      backgroundColor="#100e0e"
      overflowY={isFlush ? undefined : "scroll"}
      sx={{
        scrollbarWidth: "thin",
        scrollbarColor: "#888 transparent",
        scrollbarGutter: "stable",
        "&::-webkit-scrollbar": {
          width: "8px"
        },
        "&::-webkit-scrollbar-track": {
          background: "none"
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "8px"
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555"
        }
      }}
    >
      <Navbar isFlush={isFlush} />
      <Box
        w="100%"
        h="100%"
        position="relative"
        overflowY={isFlush ? "hidden" : undefined}
      >
        <Outlet />
      </Box>
    </VStack>
  );
}

export default App;
