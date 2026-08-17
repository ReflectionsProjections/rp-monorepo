import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@chakra-ui/react";
import Navbar from "@app/sections/admin/components/Navbar";
import type { Role } from "@app";
import { api } from "@app";
import Unauthorized from "@app/sections/admin/components/Unauthorized";
import Login from "@app/sections/admin/components/Login";
import {
  ColorThemeProvider,
  useColorTheme
} from "@app/sections/admin/contexts/ColorThemeContext";

export type MainContext = {
  displayName: string;
  roles: Role[];
  authorized: boolean;
};

const MainContent = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentProfile } = useColorTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("jwt")) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/info")
      .then((response) => {
        setDisplayName(response.data.displayName ?? "");
        setRoles(response.data.roles);
        setLoading(false);
      })
      .catch((error: unknown) => {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        if (status === 401 || status === 403) {
          // The session is invalid or expired; drop it so the login screen
          // shows instead of hanging on a blurred page.
          localStorage.removeItem("jwt");
        }
        setLoading(false);
      });
  }, []);

  // The section as a whole admits STAFF or ADMIN; individual pages gate on
  // finer roles via the Navbar and their own checks. Both redirects below key
  // off this one predicate so they can never disagree and bounce a user back
  // and forth between /admin and /admin/unauthorized.
  const hasAdminSectionAccess =
    roles.includes("STAFF") || roles.includes("ADMIN");

  useEffect(() => {
    if (loading || !localStorage.getItem("jwt")) {
      return;
    }

    if (hasAdminSectionAccess && location.pathname === "/admin/unauthorized") {
      void navigate("/admin", { replace: true });
      return;
    }

    if (!hasAdminSectionAccess && location.pathname !== "/admin/unauthorized") {
      void navigate("/admin/unauthorized", { replace: true });
    }
  }, [loading, hasAdminSectionAccess, location.pathname, navigate]);

  const authenticated = !!localStorage.getItem("jwt");
  const authorized = !loading && hasAdminSectionAccess;

  const context = {
    displayName,
    roles,
    authorized
  } satisfies MainContext;

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDir={{ base: "column", md: "row" }}
      bgGradient={currentProfile.gradient}
    >
      <Navbar roles={roles} loading={loading} displayName={displayName} />
      <Box
        mt={{ base: "100px", md: "0" }}
        ml={{ base: "0", md: "max(12vw, 300px)" }}
        px={{ base: 2, md: 8 }}
        py={8}
        w="100%"
        filter={!authorized ? "blur(16px)" : "none"}
        pointerEvents={!authorized ? "none" : "auto"}
        transition="filter 0.5s"
        overflow={!authorized ? "hidden" : "auto"}
        maxH={
          !authorized ? { base: "calc(100vh - 100px)", md: "100vh" } : undefined
        }
      >
        <Outlet context={context} />
      </Box>
      {!loading && (!authenticated || !authorized) && (
        <Box
          position="fixed"
          top={{ base: "100px", md: "0" }}
          left={{ base: "0", md: "max(12vw, 300px)" }}
          w={{ base: "100%", md: "calc(100% - max(12vw, 300px))" }}
          h={{ base: "calc(100% - 100px)", md: "100%" }}
          zIndex={10}
        >
          {authenticated ? !authorized && <Unauthorized /> : <Login />}
        </Box>
      )}
    </Box>
  );
};

const Main = () => {
  return (
    <ColorThemeProvider>
      <MainContent />
    </ColorThemeProvider>
  );
};

export default Main;
