import { Link, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@app";
import { readJwtClaims, takeMagicLinkReturnTo } from "@api/auth";
import {
  AuthCard,
  BODY_FONT,
  TEXT_COLOR
} from "@app/sections/home/components/Auth/AuthCard";

type VerifyState = "verifying" | "success" | "error";

const MISSING_TOKEN_MESSAGE =
  "This link is missing its token. Please request a new one.";

function tokenFromQuery() {
  return new URLSearchParams(window.location.search).get("token");
}

type MagicLinkCallbackProps = {
  /**
   * Where a fully registered account lands. An account that still has no roles
   * is sent to registration regardless, since that is all a setup token allows.
   */
  destination: string;
};

export function MagicLinkCallback({ destination }: MagicLinkCallbackProps) {
  const [token] = useState(tokenFromQuery);
  const [state, setState] = useState<VerifyState>(
    token ? "verifying" : "error"
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : MISSING_TOKEN_MESSAGE
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    api
      .post("/auth/magic-links/verify", { token, client: "web" })
      .then((response) => {
        const jwt = response.data.token;
        localStorage.setItem("jwt", jwt);
        setState("success");

        const claims = readJwtClaims(jwt);
        // A roleless account can only register, wherever it was headed.
        const next =
          claims?.tokenType === "setup"
            ? "/register"
            : (takeMagicLinkReturnTo() ?? destination);

        // A full load rather than a client-side navigation, so the route
        // guards re-read the JWT that was just stored.
        setTimeout(() => {
          window.location.href = next;
        }, 800);
      })
      .catch((err) => {
        setState("error");
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          setErrorMessage(
            "Too many attempts. Please wait a few minutes and try again."
          );
        } else {
          setErrorMessage(
            "This link is invalid, expired, or already used. Please request a new one."
          );
        }
      });
  }, [token, destination]);

  return (
    <AuthCard title={state === "error" ? "Sign in failed" : "Signing you in"}>
      {state === "verifying" && (
        <>
          <Spinner size="lg" color="#FCF2F6" thickness="3px" speed="0.8s" />
          <Text fontFamily={BODY_FONT} color={TEXT_COLOR} opacity={0.85}>
            Verifying your link…
          </Text>
        </>
      )}

      {state === "success" && (
        <Text fontFamily={BODY_FONT} color={TEXT_COLOR} opacity={0.85}>
          You&rsquo;re in. Taking you there now…
        </Text>
      )}

      {state === "error" && (
        <>
          <Text fontFamily={BODY_FONT} color={TEXT_COLOR} opacity={0.85}>
            {errorMessage}
          </Text>
          <Link
            href="/login"
            fontFamily={BODY_FONT}
            color="#FCF2F6"
            textDecoration="underline"
            textUnderlineOffset="4px"
            _hover={{ opacity: 0.75 }}
          >
            Request a new link
          </Link>
        </>
      )}
    </AuthCard>
  );
}
