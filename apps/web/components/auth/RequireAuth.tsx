import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import type { Role, RoleObject } from "@api/types";
import api from "@api/api";
import { authRefresh, magicLinkSignIn, readJwtClaims } from "@api/auth";

type RequireAuthProps = {
  requiredRoles?: Role[];
  /**
   * Send a signed-out visitor to the magic-link page rather than to Google.
   * Off by default, so staff-facing sections keep signing in with Google.
   */
  withMagicLink?: boolean;
};

const RequireAuth: React.FC<RequireAuthProps> = ({
  requiredRoles = [],
  withMagicLink = false
}) => {
  const [authInfo, setAuthInfo] = useState<RoleObject | null>(null);
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (!jwt) {
      if (withMagicLink) {
        magicLinkSignIn();
      } else {
        authRefresh();
      }
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
          // Any other failure (network error, 5xx, unexpected 4xx) needs to send
          // the user back into sign-in rather than leaving the guard on
          // "Loading..." forever; an expired/invalid jwt is handled by the
          // middleware before it gets here, so this only catches the rest.
          if (withMagicLink) {
            magicLinkSignIn();
          } else {
            authRefresh();
          }
        });
    }
  }, [authInfo, jwt, requiredRoles, withMagicLink]);

  if (!jwt) {
    return <p>Redirecting to login...</p>;
  }

  if (!authInfo) {
    return <p>Loading...</p>;
  }

  return <Outlet context={authInfo} />;
};

export default RequireAuth;
