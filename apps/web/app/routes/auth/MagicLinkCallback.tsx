import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "@rp/shared";

type VerifyState = "verifying" | "success" | "error";

export function MagicLinkCallback() {
  const [state, setState] = useState<VerifyState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setState("error");
      setErrorMessage("No verification token found. Please request a new login link.");
      return;
    }

    api
      .post("/auth/sponsor/verify", { token })
      .then((response) => {
        localStorage.setItem("jwt", response.data.token);
        setState("success");
        // Short delay so the user sees the success message before redirect
        setTimeout(() => {
          window.location.href = "/resume-book";
        }, 800);
      })
      .catch((err) => {
        setState("error");
        const errorType = err?.response?.data?.error;
        if (errorType === "ExpiredCode") {
          setErrorMessage("This link has expired. Please request a new login link.");
        } else {
          setErrorMessage("Invalid or already-used link. Please request a new login link.");
        }
      });
  }, []);

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
              <Text color="white" fontSize="xl" fontFamily="Nunito" textAlign="center" maxW="400px">
                {errorMessage}
              </Text>
              <Text
                as="a"
                href="/login"
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
