import { useEffect, useState } from "react";
import { Box, Link, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
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

function describe(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    const status = error.response?.status;
    const reason = error.response?.data?.error ?? error.message;
    return status === undefined ? reason : `${status} ${reason}`;
  }
  return "Unknown error";
}

const RequireRegistrationAuth: React.FC = () => {
  const jwt = localStorage.getItem("jwt");
  const [authInfo, setAuthInfo] = useState<RoleObject | null>(() =>
    setupAuthInfo(jwt)
  );
  const [failure, setFailure] = useState<string | null>(null);

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
      .catch((error: unknown) => {
        // Swallowing this strands the page on "Loading..." forever, so say what
        // went wrong and offer a way out instead.
        setFailure(describe(error));
      });
  }, [authInfo, jwt]);

  if (!jwt) {
    return <p>Redirecting to login...</p>;
  }

  if (failure) {
    return (
      <Box minH="60vh" display="grid" placeItems="center" px={6}>
        <VStack spacing={4} textAlign="center">
          <Text color="#FCF2F6" fontSize="lg">
            We couldn&rsquo;t confirm your sign-in.
          </Text>
          <Text color="#FFB4D1" fontSize="sm" fontFamily="monospace">
            {failure}
          </Text>
          <Link
            href="/login"
            color="#FCF2F6"
            textDecoration="underline"
            textUnderlineOffset="4px"
            onClick={() => localStorage.removeItem("jwt")}
          >
            Sign in again
          </Link>
        </VStack>
      </Box>
    );
  }

  if (!authInfo) {
    return <p>Loading...</p>;
  }

  return <Outlet context={authInfo} />;
};

export default RequireRegistrationAuth;
