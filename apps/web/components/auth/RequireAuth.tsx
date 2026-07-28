import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import type { Role, RoleObject } from "@api/types";
import api from "@api/api";
import { authRefresh, readJwtClaims } from "@api/auth";

type RequireAuthProps = {
  requiredRoles?: Role[];
};

const RequireAuth: React.FC<RequireAuthProps> = ({ requiredRoles = [] }) => {
  const [authInfo, setAuthInfo] = useState<RoleObject | null>(null);
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (!jwt) {
      authRefresh();
      return;
    }

    if (!authInfo) {
      api
        .get("/auth/info")
        .then((response) => {
          const roles = response.data.roles;

          const missingRole = requiredRoles.find(
            (role) => !roles.includes(role)
          );
          if (missingRole) {
            window.location.href = "/unauthorized";
          } else {
            setAuthInfo(response.data);
          }
        })
        .catch(() => {
          // A setup token is refused here by design: the account exists but has
          // no roles yet, so registration is the only place it can go. Without
          // this the page would sit on "Loading..." forever.
          if (readJwtClaims(jwt)?.tokenType === "setup") {
            window.location.href = "/register";
            return;
          }
          // Otherwise the jwt is expired and the middleware handles the error
        });
    }
  }, [authInfo, jwt, requiredRoles]);

  if (!jwt) {
    return <p>Redirecting to login...</p>;
  }

  if (!authInfo) {
    return <p>Loading...</p>;
  }

  return <Outlet context={authInfo} />;
};

export default RequireAuth;
