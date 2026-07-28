import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@app";

type VerifyState = "verifying" | "success" | "error";

const MISSING_TOKEN_MESSAGE =
  "No verification token found. Please request a new login link.";

function tokenFromQuery() {
  return new URLSearchParams(window.location.search).get("token");
}

export function MagicLinkCallback() {
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
        localStorage.setItem("jwt", response.data.token);
        setState("success");
        // Short delay so the user sees the success message before redirect
        setTimeout(() => {
          window.location.href = "/sponsor/resume-book";
        }, 800);
      })
      .catch((err) => {
        setState("error");
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
  }, [token]);

  return (
    <Box minHeight="100vh" bg="#0d0d0d">
      <Center height="80vh">
        <VStack spacing={6}>
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
