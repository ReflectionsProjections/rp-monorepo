import { Box, Button, Input, Link, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { api } from "@app";
import { readJwtClaims, takeMagicLinkReturnTo } from "@api/auth";
import {
  AuthCard,
  BODY_FONT,
  TEXT_COLOR
} from "@app/sections/home/components/Auth/AuthCard";

const emailSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Please enter an email address.")
});

const codeSchema = yup.object({
  code: yup
    .string()
    .matches(/^\d{6}$/, "The code is the 6 digits from the email.")
    .required("Please enter the 6-digit code from the email.")
});

const inputStyles = {
  bg: "rgba(0,0,0,0.25)",
  border: "1px solid",
  borderColor: "rgba(252,242,246,0.2)",
  borderRadius: "full",
  color: TEXT_COLOR,
  fontFamily: BODY_FONT,
  fontWeight: 500,
  textAlign: "center" as const,
  _placeholder: { color: "rgba(252,242,246,0.4)" },
  _hover: { borderColor: "rgba(252,242,246,0.35)" },
  _focusVisible: {
    borderColor: "rgba(192,38,211,0.85)",
    boxShadow: "0 0 0 1px rgba(192,38,211,0.85)"
  }
};

export function Login() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    return <LinkSent email={sentTo} onBack={() => setSentTo(null)} />;
  }

  return <EmailForm onSent={setSentTo} />;
}

function EmailForm({ onSent }: { onSent: (email: string) => void }) {
  const [submitError, setSubmitError] = useState("");

  return (
    <AuthCard title="Sign in or register">
      <Text
        fontFamily={BODY_FONT}
        fontWeight={500}
        color={TEXT_COLOR}
        opacity={0.8}
      >
        Enter your email and we&rsquo;ll send you a link. No password needed
        &mdash; the same link works whether you already have an account or
        you&rsquo;re new here.
      </Text>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={emailSchema}
        onSubmit={({ email }, { setSubmitting }) => {
          setSubmitError("");
          api
            .post("/auth/magic-links", {
              email,
              client: "web",
              intent: "login"
            })
            .then(() => onSent(email))
            .catch((err) => {
              if (axios.isAxiosError(err) && err.response?.status === 429) {
                setSubmitError(
                  "Too many requests. Please wait a few minutes and try again."
                );
              } else {
                setSubmitError("Something went wrong. Please try again.");
              }
            })
            .finally(() => setSubmitting(false));
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting
        }) => {
          const message = (touched.email ? errors.email : "") || submitError;

          return (
            <Form style={{ width: "100%" }}>
              <VStack spacing={4} w="100%">
                <Input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  {...inputStyles}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  w="100%"
                  borderRadius="full"
                  fontFamily={BODY_FONT}
                  fontWeight={500}
                  color="#FFFFFF"
                  bg="rgba(192,38,211,0.85)"
                  _hover={{ bg: "rgba(192,38,211,1)" }}
                  _active={{ bg: "rgba(160,30,180,1)" }}
                >
                  Send me a link
                </Button>

                {message && (
                  <Text
                    fontFamily={BODY_FONT}
                    fontWeight={500}
                    fontSize="sm"
                    color="#FFB4D1"
                    role="alert"
                  >
                    {message}
                  </Text>
                )}
              </VStack>
            </Form>
          );
        }}
      </Formik>
    </AuthCard>
  );
}

function LinkSent({ email, onBack }: { email: string; onBack: () => void }) {
  const [submitError, setSubmitError] = useState("");

  return (
    <AuthCard title="Check your email">
      <Text
        fontFamily={BODY_FONT}
        fontWeight={500}
        color={TEXT_COLOR}
        opacity={0.85}
      >
        We sent a link and a 6-digit code to{" "}
        <Box as="span" color="#FFFFFF">
          {email}
        </Box>
        . Open the link, or enter the code below &mdash; both expire in about 10
        minutes.
      </Text>

      <Formik
        initialValues={{ code: "" }}
        validationSchema={codeSchema}
        onSubmit={({ code }, { setSubmitting }) => {
          setSubmitError("");
          api
            .post("/auth/magic-links/verify-code", {
              email,
              code,
              client: "web"
            })
            .then((response) => {
              const jwt = response.data.token;
              localStorage.setItem("jwt", jwt);

              const claims = readJwtClaims(jwt);
              // A roleless account can only register, wherever it was headed.
              const next =
                claims?.tokenType === "setup"
                  ? "/register"
                  : (takeMagicLinkReturnTo() ?? "/");
              // A full load rather than a client-side navigation, so the
              // route guards re-read the JWT that was just stored.
              window.location.replace(next);
            })
            .catch((err) => {
              setSubmitting(false);
              if (axios.isAxiosError(err) && err.response?.status === 429) {
                setSubmitError(
                  "Too many attempts. Please wait a few minutes and try again."
                );
              } else {
                setSubmitError(
                  "That code is incorrect, expired, or already used. Check the newest email or request a new one."
                );
              }
            });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting
        }) => {
          const message = (touched.code ? errors.code : "") || submitError;

          return (
            <Form style={{ width: "100%" }}>
              <VStack spacing={4} w="100%">
                <Input
                  type="text"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  letterSpacing="0.4em"
                  value={values.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  {...inputStyles}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  w="100%"
                  borderRadius="full"
                  fontFamily={BODY_FONT}
                  fontWeight={500}
                  color="#FFFFFF"
                  bg="rgba(192,38,211,0.85)"
                  _hover={{ bg: "rgba(192,38,211,1)" }}
                  _active={{ bg: "rgba(160,30,180,1)" }}
                >
                  Sign in with code
                </Button>

                {message && (
                  <Text
                    fontFamily={BODY_FONT}
                    fontWeight={500}
                    fontSize="sm"
                    color="#FFB4D1"
                    role="alert"
                  >
                    {message}
                  </Text>
                )}
              </VStack>
            </Form>
          );
        }}
      </Formik>

      <Link
        as="button"
        type="button"
        onClick={onBack}
        fontFamily={BODY_FONT}
        fontWeight={500}
        color={TEXT_COLOR}
        textDecoration="underline"
        textUnderlineOffset="4px"
        _hover={{ opacity: 0.75 }}
      >
        Use a different email
      </Link>
    </AuthCard>
  );
}
