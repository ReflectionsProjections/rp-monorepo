import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Input,
  Center,
  VStack,
  useMediaQuery,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { api } from "@app";
import type { FormikHelpers } from "formik";
import { Form, Formik } from "formik";
import * as yup from "yup";

type EmailSubmitHandler = (
  values: {
    email: string;
  },
  formikHelpers: FormikHelpers<{
    email: string;
  }>
) => void | Promise<void>;

export function Login() {
  const [isSmall] = useMediaQuery("(max-width: 600px)");
  const [isXSmall] = useMediaQuery("(max-width: 400px)");

  return (
    <Box minHeight={"800px"}>
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        height="50%"
        zIndex="1"
        backgroundImage="/sponsor/pink_grid_horizontal.svg"
        backgroundSize="cover"
      />

      <Flex
        height="77vh"
        mt="2vh"
        mb="5vh"
        pb="15vh"
        flexDirection={"column"}
        textAlign="center"
        textColor={"white"}
      >
        <Center mt="15vh">
          <Box p="4">
            <HStack justifyContent="center" spacing="8px" textAlign={"center"}>
              <Text
                fontSize={isXSmall ? "20" : isSmall ? "28" : "43"}
                fontFamily={"Roboto Slab"}
                fontWeight={"700"}
                letterSpacing={"0.08em"}
              >
                {" "}
                reflections{" "}
              </Text>
              <Text
                fontSize={isXSmall ? "52" : isSmall ? "60" : "76"}
                fontFamily={"Roboto Slab"}
                fontWeight={"300"}
                letterSpacing={"0.08em"}
                mt="-10px"
              >
                {" "}
                |
              </Text>
              <Text
                fontSize={isXSmall ? "20" : isSmall ? "28" : "43"}
                fontFamily={"Roboto Slab"}
                fontWeight={"700"}
                letterSpacing={"0.08em"}
              >
                {" "}
                projections{" "}
              </Text>
            </HStack>
            <HStack justifyContent="center" spacing="8px" textAlign={"center"}>
              <Text
                fontSize={isXSmall ? "20" : isSmall ? "28" : "43"}
                fontFamily={"Nunito"}
                fontWeight={"500"}
                letterSpacing={"0.08em"}
              >
                {" "}
                Resume Book{" "}
              </Text>
            </HStack>
          </Box>
        </Center>
        <Box mt="5vh" zIndex="2" display="flex" justifyContent="center">
          <LoginForm />
        </Box>
      </Flex>
    </Box>
  );
}

function LoginForm() {
  const toast = useToast();
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const submitEmail: EmailSubmitHandler = ({ email }, { setSubmitting }) => {
    toast.promise(
      api
        .post("/auth/magic-links", {
          email,
          client: "web",
          intent: "resume-book"
        })
        .then(() => setEmailSent(email))
        .finally(() => setSubmitting(false)),
      {
        success: { title: "Please check your email for the login link" },
        error: { title: "Something went wrong. Please try again." },
        loading: { title: "Loading..." }
      }
    );
  };

  return emailSent ? (
    <MagicLinkSentPage email={emailSent} onBack={() => setEmailSent(null)} />
  ) : (
    <EmailPage onSubmit={submitEmail} />
  );
}

function EmailPage({ onSubmit }: { onSubmit: EmailSubmitHandler }) {
  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={yup.object({
        email: yup
          .string()
          .email("Please enter a valid email address.")
          .required("Please enter an email address.")
      })}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
      }) => (
        <Form onSubmit={handleSubmit}>
          <Text fontSize="24" fontFamily={"Nunito"} fontWeight={"400"}>
            Enter your Email
          </Text>
          <Input
            type="email"
            name="email"
            placeholder="name@example.com"
            width="250px"
            mt="20px"
            textColor="white"
            _placeholder={{ color: "gray.400" }}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Button
            bg="blue.500"
            color="white"
            borderRadius="5px"
            zIndex="3"
            m={4}
            mb={5}
            _hover={{ bg: "blue.600" }}
            type="submit"
            isLoading={isSubmitting}
          >
            Submit
          </Button>
          {errors.email && touched.email && (
            <Box
              mt={2}
              p={2}
              bg="red.500"
              color="white"
              borderRadius="md"
              maxWidth="250px"
              mx="auto"
            >
              {errors.email}
            </Box>
          )}
        </Form>
      )}
    </Formik>
  );
}

function MagicLinkSentPage({
  email,
  onBack
}: {
  email: string;
  onBack: () => void;
}) {
  const [submitError, setSubmitError] = useState("");

  return (
    <VStack spacing={6} maxW="400px" px={4}>
      <Text fontSize="24" fontFamily="Nunito" fontWeight="400">
        Check your email
      </Text>
      <Text fontSize="16" fontFamily="Nunito" fontWeight="300" opacity={0.8}>
        We sent a magic link and a 6-digit code to your email address. Click the
        link, or enter the code below to log in to the Resume Book.
      </Text>
      <Formik
        initialValues={{ code: "" }}
        validationSchema={yup.object({
          code: yup
            .string()
            .matches(/^\d{6}$/, "The code is the 6 digits from the email.")
            .required("Please enter the 6-digit code from the email.")
        })}
        onSubmit={({ code }, { setSubmitting }) => {
          setSubmitError("");
          api
            .post("/auth/magic-links/verify-code", {
              email,
              code,
              client: "web"
            })
            .then((response) => {
              localStorage.setItem("jwt", response.data.token);
              window.location.replace("/sponsor/resume-book");
            })
            .catch(() => {
              setSubmitting(false);
              setSubmitError(
                "That code is incorrect, expired, or already used. Check the newest email or request a new one."
              );
            });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting
        }) => (
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              width="250px"
              textColor="white"
              textAlign="center"
              letterSpacing="0.4em"
              _placeholder={{ color: "gray.400" }}
              value={values.code}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Button
              bg="blue.500"
              color="white"
              borderRadius="5px"
              zIndex="3"
              m={4}
              mb={2}
              _hover={{ bg: "blue.600" }}
              type="submit"
              isLoading={isSubmitting}
            >
              Log in with code
            </Button>
            {((touched.code && errors.code) || submitError) && (
              <Box
                mt={2}
                p={2}
                bg="red.500"
                color="white"
                borderRadius="md"
                maxWidth="250px"
                mx="auto"
              >
                {(touched.code ? errors.code : "") || submitError}
              </Box>
            )}
          </Form>
        )}
      </Formik>
      <Text fontSize="14" fontFamily="Nunito" fontWeight="300" opacity={0.6}>
        The link and code will expire in approximately 10 minutes.
      </Text>
      <Button
        variant="ghost"
        color="white"
        fontFamily="Nunito"
        _hover={{ bg: "whiteAlpha.200" }}
        onClick={onBack}
      >
        ← Use a different email
      </Button>
    </VStack>
  );
}
