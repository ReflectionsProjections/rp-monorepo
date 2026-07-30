import { Box, Button, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { api } from "@app";

type VerifyState = "confirming" | "verifying" | "success" | "error";

const MISSING_TOKEN_MESSAGE =
  "No verification token found. Please request a new login link.";

function tokenFromQuery() {
  const token = new URLSearchParams(window.location.search).get("token");
  // Strip the single-use token from the address bar immediately: otherwise it
  // lingers in browser history, can leak to other origins via the Referer
  // header, and re-submits (and fails) if the user navigates back here.
  window.history.replaceState({}, "", window.location.pathname);
  return token;
}

export function MagicLinkCallback() {
  const [token] = useState(tokenFromQuery);
  const [state, setState] = useState<VerifyState>(
    token ? "confirming" : "error"
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : MISSING_TOKEN_MESSAGE
  );
  const verified = useRef(false);

  const handleConfirm = () => {
    // Guards against double-submission (e.g. a fast double click); the token
    // itself is only ever posted once per confirm.
    if (!token || verified.current) {
      return;
    }
    verified.current = true;
    setState("verifying");

    api
      .post("/auth/magic-links/verify", { token, client: "web" })
      .then((response) => {
        localStorage.setItem("jwt", response.data.token);
        setState("success");
      })
      .catch((err) => {
        setState("error");
        verified.current = false;
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          setErrorMessage(
            "Too many verification attempts. Please wait a few minutes and try again."
          );
        } else {
          setErrorMessage(
            "This link is invalid, expired, or already used. Please request a new login link."
          );
        }
      });
  };

  useEffect(() => {
    if (state !== "success") {
      return;
    }

    // Short delay so the user sees the success message before redirect.
    const redirectTimer = setTimeout(() => {
      window.location.replace("/sponsor/resume-book");
    }, 800);

    return () => clearTimeout(redirectTimer);
  }, [state]);

  return (
    <Box minHeight="100vh" bg="#0d0d0d">
      <Center height="80vh">
        <VStack spacing={6}>
          {state === "confirming" && (
            <VStack spacing={4}>
              <Text
                color="white"
                fontSize="xl"
                fontFamily="Nunito"
                textAlign="center"
                maxW="400px"
              >
                Click below to finish signing in.
              </Text>
              <Button colorScheme="blue" onClick={handleConfirm}>
                Confirm sign-in
              </Button>
            </VStack>
          )}
          {state === "verifying" && (
            <>
              <Spinner size="xl" color="blue.400" thickness="4px" />
              <Text color="white" fontSize="xl" fontFamily="Nunito">
                Verifying your login…
              </Text>
            </>
          )}
          {state === "success" && (
            <>
              <Text color="green.400" fontSize="3xl">
                ✓
              </Text>
              <Text color="white" fontSize="xl" fontFamily="Nunito">
                Login successful! Redirecting to Resume Book…
              </Text>
            </>
          )}
          {state === "error" && (
            <VStack spacing={4}>
              <Text color="red.400" fontSize="3xl">
                ✗
              </Text>
              <Text
                color="white"
                fontSize="xl"
                fontFamily="Nunito"
                textAlign="center"
                maxW="400px"
              >
                {errorMessage}
              </Text>
              <Text
                as="a"
                href="/sponsor/login"
                color="blue.400"
                fontSize="md"
                fontFamily="Nunito"
                _hover={{ textDecoration: "underline" }}
              >
                Return to Login
              </Text>
            </VStack>
          )}
        </VStack>
      </Center>
    </Box>
  );
}
