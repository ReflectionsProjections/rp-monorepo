import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { RoleObject } from "@api/types";
import api from "@api/api";
import { authRefresh, readJwtClaims } from "@api/auth";

/**
 * Guards registration the way the API's RegistrationAuthChecker does: a setup
 * token is accepted alongside a full access token, so someone who has verified
 * a magic link but has no roles yet can still finish registering.
 *
 * /auth/info rejects setup tokens, so their claims are read from the token
 * rather than fetched. Calling it would clear the JWT and reload the page.
 */
function setupAuthInfo(jwt: string | null): RoleObject | null {
  if (!jwt) {
    return null;
  }

  const claims = readJwtClaims(jwt);
  if (!claims || claims.tokenType !== "setup") {
    return null;
  }

  return {
    userId: claims.userId,
    displayName: claims.displayName ?? "",
    email: claims.email,
    roles: []
  };
}

const RequireRegistrationAuth: React.FC = () => {
  const jwt = localStorage.getItem("jwt");
  const [authInfo, setAuthInfo] = useState<RoleObject | null>(() =>
    setupAuthInfo(jwt)
  );

  useEffect(() => {
    if (!jwt) {
      authRefresh();
      return;
    }

    if (authInfo) {
      return;
    }

    api
      .get("/auth/info")
      .then((response) => {
        setAuthInfo(response.data);
      })
      .catch(() => {
        // This only happens if jwt is expired
        // middleware will handle the error
      });
  }, [authInfo, jwt]);

  if (!jwt) {
    return <p>Redirecting to login...</p>;
  }

  if (!authInfo) {
    return <p>Loading...</p>;
  }

  return <Outlet context={authInfo} />;
};

export default RequireRegistrationAuth;
