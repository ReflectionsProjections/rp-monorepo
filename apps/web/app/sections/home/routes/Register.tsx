import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Spinner,
  Text,
  VStack,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { Formik } from "formik";
import type { FormikProps } from "formik";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useOutletContext } from "react-router-dom";
import type { RoleObject } from "@app";
import { api, useFormAutosave } from "@app";
import { readJwtClaims } from "@api/auth";
import landingBg from "../assets/Landing/Landing.svg";
import type { RegistrationValues } from "../components/Registration/schema";
import {
  finalRegistrationSchema,
  initialValues,
  registrationSchema
} from "../components/Registration/schema";
import {
  GENDER_SELF_DESCRIBE,
  SECTIONS,
  SECTION_BODIES,
  STEP_FIELDS,
  SectionCard,
  sectionComplete
} from "../components/Registration/sections";
import SkylineProgress from "../components/Registration/SkylineProgress";
import {
  BODY_FONT,
  CYAN,
  FAINT,
  FieldError,
  MUTED,
  PAGE_GRADIENT,
  PINK,
  TEXT_COLOR,
  TITLE_FONT,
  ghostButtonStyles,
  glassCardStyles,
  gradientButtonStyles
} from "../components/Registration/ui";

/** Flip when registration closes for the year. */
const REGISTRATION_CLOSED = false;

const LAST_STEP = SECTIONS.length - 1;

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Draft saved",
  error: "Autosave failed"
};

/**
 * The draft endpoint stores the resume as a filename string (max 50 chars);
 * the file itself lives in S3.
 */
const draftPayload = (values: RegistrationValues) => ({
  ...values,
  resume: values.resume?.name.slice(0, 50) ?? ""
});

const uploadResume = async (
  url: string,
  fields: Record<string, unknown>,
  file: File
) => {
  const form = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof Blob || typeof value === "string") {
      form.append(key, value);
    } else {
      console.error(`Unexpected value type for key "${key}":`, value);
    }
  }

  form.append("file", file);

  await axios.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

/**
 * Validates against the submit schema and folds each "Other" free-text answer
 * back into its real field, so the API only ever sees final values.
 */
const processFinalRegistration = (values: RegistrationValues) => {
  const processedValues = finalRegistrationSchema.validateSync(
    { ...values, hasResume: values.resume !== null },
    { stripUnknown: true }
  );

  if (values.allergiesOther !== "") {
    processedValues.allergies = processedValues.allergies.map((item) =>
      item === "Other" ? values.allergiesOther : item
    );
  }

  if (values.dietaryOther !== "") {
    processedValues.dietaryRestrictions =
      processedValues.dietaryRestrictions.map((item) =>
        item === "Other" ? values.dietaryOther : item
      );
  }

  if (
    processedValues.educationLevel === "Other" &&
    values.educationOther !== ""
  ) {
    processedValues.educationLevel = values.educationOther;
  }

  if (values.ethnicityOther !== "") {
    processedValues.ethnicity = processedValues.ethnicity.map((item) =>
      item === "Other" ? values.ethnicityOther : item
    );
  }

  if (
    processedValues.gender === GENDER_SELF_DESCRIBE &&
    values.genderOther !== ""
  ) {
    processedValues.gender = values.genderOther;
  }

  return processedValues;
};

/** Debounced draft autosave, reported through the header's status label. */
const AutosaveDraft = ({
  onStatus
}: {
  onStatus: (status: SaveStatus) => void;
}) => {
  useFormAutosave<RegistrationValues>((values) => {
    onStatus("saving");
    api
      .post("/registration/draft", draftPayload(values))
      .then(() => onStatus("saved"))
      .catch(() => onStatus("error"));
  });

  return null;
};

const BackgroundLayers = () => (
  <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
    <Image
      src={landingBg}
      alt=""
      aria-hidden
      position="absolute"
      left="50%"
      top="50%"
      w="118%"
      h="118%"
      maxW="none"
      transform="translate(-50%, -50%)"
      objectFit="cover"
      opacity={0.85}
      filter="blur(3px)"
    />
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(120% 90% at 50% 40%, rgba(15,6,45,0.20) 0%, rgba(15,6,45,0.72) 62%, rgba(10,4,30,0.92) 100%)"
    />
    <Box
      position="absolute"
      inset={0}
      bg="linear-gradient(180deg, rgba(10,4,30,0.55) 0%, rgba(10,4,30,0) 22%, rgba(10,4,30,0) 70%, rgba(10,4,30,0.7) 100%)"
    />
  </Box>
);

const LoadingIndicator = () => (
  <Center position="absolute" inset={0} zIndex={20} bg="rgba(6,2,20,0.5)">
    <Spinner size="xl" thickness="5px" color={PINK} />
  </Center>
);

const ScreenShell = ({ children }: { children: React.ReactNode }) => (
  <Flex
    position="relative"
    zIndex={1}
    justify="center"
    px={{ base: "16px", md: "24px" }}
    pt={{ base: "8vh", md: "10vh" }}
    pb="80px"
  >
    {children}
  </Flex>
);

const ConfirmationScreen = ({ onEdit }: { onEdit: () => void }) => (
  <ScreenShell>
    <VStack w="100%" maxW="640px" textAlign="center" spacing={0}>
      <Center
        w="76px"
        h="76px"
        mb="30px"
        borderRadius="20px"
        border="1px solid"
        borderColor="rgba(92,225,230,0.5)"
        bg="rgba(92,225,230,0.12)"
        boxShadow="0 0 50px rgba(92,225,230,0.28)"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke={CYAN}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12.5l5.2 5.2L20 7" />
        </svg>
      </Center>
      <Heading
        fontFamily={TITLE_FONT}
        fontWeight="400"
        fontSize={{ base: "24px", md: "30px" }}
        lineHeight="1.3"
        mb="16px"
      >
        Thank you for registering!
      </Heading>
      <Text
        maxW="480px"
        fontSize="16px"
        lineHeight="1.7"
        color="rgba(252,242,246,0.66)"
        mb="36px"
      >
        Look out for a confirmation email from R|P, and download the app today.
      </Text>
      <HStack
        spacing="14px"
        flexDir={{ base: "column", sm: "row" }}
        justify="center"
        mb="34px"
      >
        <Link
          href="https://apps.apple.com/us/app/r-p-2025/id6744465190"
          isExternal
        >
          <Image
            src="/site/appscreen/app_store.png"
            alt="Download on the App Store"
            h="60px"
            w="auto"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
            _hover={{ transform: "scale(1.04)" }}
            transition="transform 0.25s ease"
          />
        </Link>
        <Link
          href="https://play.google.com/store/apps/details?id=com.reflectionsprojections"
          isExternal
        >
          <Image
            src="/site/appscreen/google_play.png"
            alt="Get it on Google Play"
            h="60px"
            w="auto"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
            _hover={{ transform: "scale(1.04)" }}
            transition="transform 0.25s ease"
          />
        </Link>
      </HStack>
      <Button
        onClick={onEdit}
        {...ghostButtonStyles}
        borderRadius="full"
        px="22px"
        py="12px"
        fontSize="13px"
        color="rgba(252,242,246,0.6)"
        bg="transparent"
      >
        Edit my application
      </Button>
    </VStack>
  </ScreenShell>
);

const ClosedScreen = () => (
  <ScreenShell>
    <VStack
      w="100%"
      maxW="600px"
      {...glassCardStyles}
      borderRadius="20px"
      px={{ base: "24px", md: "46px" }}
      py="48px"
      textAlign="center"
      spacing={0}
    >
      <HStack
        spacing="9px"
        px="14px"
        py="7px"
        mb="24px"
        borderRadius="full"
        border="1px solid"
        borderColor="rgba(239,83,158,0.4)"
        bg="rgba(239,83,158,0.12)"
        fontSize="11.5px"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color="#FF8FC4"
      >
        <Box w="7px" h="7px" borderRadius="full" bg={PINK} />
        <Text>Form closed</Text>
      </HStack>
      <Heading
        fontFamily={TITLE_FONT}
        fontWeight="400"
        fontSize={{ base: "22px", md: "26px" }}
        lineHeight="1.3"
        mb="14px"
      >
        Registration has closed
      </Heading>
      <Text
        fontSize="15.5px"
        lineHeight="1.7"
        color="rgba(252,242,246,0.62)"
        mb="32px"
      >
        Thanks for the interest — registration for R|P 2026 is no longer
        accepting new applications. Walk-ins may still be available at the door
        during the conference.
      </Text>
      <Flex gap="12px" justify="center" wrap="wrap">
        <Button
          as={NavLink}
          to="/#schedule"
          {...gradientButtonStyles}
          px="26px"
          py="14px"
          fontSize="13px"
        >
          See the schedule
        </Button>
        <Button
          as={NavLink}
          to="/"
          {...ghostButtonStyles}
          px="26px"
          py="14px"
          fontSize="14px"
        >
          Back to home
        </Button>
      </Flex>
    </VStack>
  </ScreenShell>
);

type WizardProps = {
  formik: FormikProps<RegistrationValues>;
  step: number;
  setStep: (step: number) => void;
  saveStatus: SaveStatus;
  onSaveAndExit: () => void;
};

const Wizard = ({
  formik,
  step,
  setStep,
  saveStatus,
  onSaveAndExit
}: WizardProps) => {
  const done = SECTIONS.map((_, index) =>
    sectionComplete(index, formik.values)
  );
  const percent = Math.round(
    (done.filter(Boolean).length / SECTIONS.length) * 100
  );

  const touchFields = (fields: (keyof RegistrationValues)[]) =>
    void formik.setTouched(
      {
        ...formik.touched,
        ...Object.fromEntries(fields.map((field) => [field, true]))
      },
      false
    );

  const advance = async () => {
    const errors = await formik.validateForm();
    const blocked = STEP_FIELDS[step].filter((field) => field in errors);
    if (blocked.length > 0) {
      touchFields(blocked);
      return;
    }
    setStep(Math.min(LAST_STEP, step + 1));
  };

  const submit = async () => {
    const errors = await formik.validateForm();
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) {
      await formik.submitForm();
      return;
    }

    touchFields(errorFields as (keyof RegistrationValues)[]);
    const firstIncomplete = STEP_FIELDS.findIndex((fields) =>
      fields.some((field) => field in errors)
    );
    if (firstIncomplete !== -1) {
      setStep(firstIncomplete);
    }
  };

  return (
    <Flex
      position="relative"
      zIndex={1}
      justify="center"
      px={{ base: "16px", md: "24px" }}
      pt="26px"
      pb="120px"
    >
      <Box w="100%" maxW="900px">
        {/* header */}
        <Flex
          align="flex-end"
          justify="space-between"
          gap="20px"
          mb="22px"
          wrap="wrap"
        >
          <Box>
            <Heading
              fontFamily={TITLE_FONT}
              fontWeight="400"
              fontSize="24px"
              lineHeight="1.3"
              mb="8px"
            >
              Registration
            </Heading>
            <Text fontSize="14px" color={MUTED}>
              Signed in as{" "}
              <Box as="span" color={TEXT_COLOR}>
                {formik.values.email}
              </Box>{" "}
              · progress saves automatically
            </Text>
          </Box>
          <Flex align="flex-end" gap="16px">
            <VStack spacing="8px" align="flex-end">
              <Text
                fontSize="12px"
                color={FAINT}
                letterSpacing="0.04em"
                minH="18px"
              >
                {SAVE_LABELS[saveStatus]}
              </Text>
              <Button
                onClick={onSaveAndExit}
                {...ghostButtonStyles}
                borderRadius="full"
                px="18px"
                py="9px"
                fontSize="13px"
              >
                Save &amp; exit
              </Button>
            </VStack>
            <VStack spacing="6px" align="flex-end">
              <Text
                fontFamily={TITLE_FONT}
                fontSize="22px"
                lineHeight="1"
                color={CYAN}
              >
                {percent}%
              </Text>
              <Text
                fontSize="11.5px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color={FAINT}
              >
                complete
              </Text>
            </VStack>
          </Flex>
        </Flex>

        <SkylineProgress done={done} percent={percent} />

        {SECTION_BODIES.map((SectionBody, index) => (
          <SectionCard
            key={SECTIONS[index].title}
            index={index}
            active={step === index}
            complete={done[index]}
            onHeaderClick={() => setStep(index)}
          >
            <SectionBody />
          </SectionCard>
        ))}

        {step < LAST_STEP && (
          <Flex align="center" justify="space-between" gap="14px" mt="22px">
            <Button
              onClick={() => setStep(Math.max(0, step - 1))}
              isDisabled={step === 0}
              {...ghostButtonStyles}
              px="26px"
              py="14px"
              fontSize="14px"
            >
              Back
            </Button>
            <Text fontSize="12.5px" color={FAINT}>
              Step {step + 1} of {SECTIONS.length}
            </Text>
            <Button
              onClick={() => void advance()}
              {...gradientButtonStyles}
              px="30px"
              py="14px"
              fontSize="12.5px"
            >
              Continue
            </Button>
          </Flex>
        )}

        {step === LAST_STEP && (
          <Box
            mt="22px"
            px={{ base: "20px", md: "28px" }}
            py="26px"
            borderRadius="16px"
            border="1px solid"
            borderColor="rgba(252,242,246,0.12)"
            bg="rgba(15,6,45,0.5)"
            backdropFilter="blur(22px)"
          >
            <Flex
              align="center"
              justify="space-between"
              gap={{ base: "18px", md: "26px" }}
              wrap="wrap"
            >
              <Box
                as="button"
                type="button"
                onClick={() =>
                  void formik.setFieldValue("over18", !formik.values.over18)
                }
                aria-pressed={formik.values.over18}
                display="flex"
                alignItems="center"
                gap="13px"
                color={TEXT_COLOR}
                fontSize="14.5px"
                textAlign="left"
                cursor="pointer"
              >
                <Box
                  position="relative"
                  w="22px"
                  h="22px"
                  flex="none"
                  borderRadius="6px"
                  border="1px solid"
                  borderColor={
                    formik.values.over18 ? CYAN : "rgba(252,242,246,0.3)"
                  }
                  bg={formik.values.over18 ? CYAN : "rgba(252,242,246,0.05)"}
                  boxShadow={
                    formik.values.over18
                      ? "0 0 14px rgba(92,225,230,0.6)"
                      : "none"
                  }
                >
                  {formik.values.over18 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0F062D"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 8" />
                    </svg>
                  )}
                </Box>
                <Text as="span">
                  I certify that I am at least 18 years old{" "}
                  <Box as="span" color={PINK}>
                    *
                  </Box>
                </Text>
              </Box>
              <Button
                onClick={() => void submit()}
                isLoading={formik.isSubmitting}
                {...gradientButtonStyles}
                borderRadius="12px"
                px="40px"
                py="16px"
                fontSize="13.5px"
                boxShadow="0 12px 34px rgba(239,83,158,0.3)"
              >
                Submit
              </Button>
            </Flex>
            <FieldError name="over18" />
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const Register = () => {
  const { displayName, email } = useOutletContext<RoleObject>();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState<RegistrationValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmation, setConfirmation] = useState(false);
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (REGISTRATION_CLOSED) {
      setIsLoading(false);
      return;
    }

    api
      .get("/registration/draft")
      .then((response) => {
        setValues({
          ...response.data,
          resume:
            response.data.resume !== ""
              ? {
                  name: response.data.resume,
                  open: async () => {
                    await api
                      .get("/s3/download")
                      .then((download) => window.open(download.data.url));
                  }
                }
              : null,
          over18: false
        });
      })
      .catch(() => {
        setValues({ ...initialValues(), name: displayName, email });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [displayName, email]);

  return (
    <Box
      h="100%"
      position="relative"
      overflow="hidden"
      bg={PAGE_GRADIENT}
      fontFamily={BODY_FONT}
      fontWeight={500}
      color={TEXT_COLOR}
    >
      <BackgroundLayers />
      {isLoading && <LoadingIndicator />}

      <Box position="relative" zIndex={1} h="100%" overflowY="auto">
        {REGISTRATION_CLOSED ? (
          <ClosedScreen />
        ) : confirmation ? (
          <ConfirmationScreen onEdit={() => setConfirmation(false)} />
        ) : (
          values && (
            <Formik
              initialValues={values}
              validationSchema={registrationSchema}
              onSubmit={(values, helpers) => {
                setIsLoading(true);
                const registration = processFinalRegistration(values);

                // An account that signed in with a magic link and has no
                // roles yet still holds a setup token, which
                // /registration/submit rejects. /registration/complete
                // accepts it, grants the USER role, clears the draft itself
                // and hands back a full access token to replace it.
                const jwt = localStorage.getItem("jwt");
                const finalise =
                  jwt !== null && readJwtClaims(jwt)?.tokenType === "setup"
                    ? api
                        .post("/registration/complete", registration)
                        .then(({ data }) => {
                          localStorage.setItem("jwt", data.token);
                        })
                    : Promise.all([
                        api.post("/registration/submit", registration),
                        api.post("/registration/draft", draftPayload(values))
                      ]);

                toast.promise(
                  finalise
                    // Sequential, not parallel: /s3/upload also rejects setup
                    // tokens, so it has to run once the account is registered
                    // and the access token above is in place.
                    .then(async () => {
                      if (!values.resume?.file) {
                        return;
                      }
                      const { data: download } = await api.get("/s3/upload");
                      await uploadResume(
                        download.url,
                        download.fields,
                        values.resume.file
                      );
                    })
                    .then(() => {
                      setConfirmation(true);
                    })
                    .catch((error: unknown) => {
                      helpers.setSubmitting(false);
                      // Rethrow so toast.promise reports the failure instead
                      // of a false "Form Submitted!".
                      throw error;
                    })
                    .finally(() => {
                      setIsLoading(false);
                    }),
                  {
                    success: { title: "Form Submitted!" },
                    loading: { title: "Submitting..." },
                    error: { title: "Submission failed" }
                  }
                );
              }}
            >
              {(formik) => (
                <>
                  <AutosaveDraft onStatus={setSaveStatus} />
                  <Wizard
                    formik={formik}
                    step={step}
                    setStep={setStep}
                    saveStatus={saveStatus}
                    onSaveAndExit={() => {
                      setSaveStatus("saving");
                      api
                        .post(
                          "/registration/draft",
                          draftPayload(formik.values)
                        )
                        .then(() => navigate("/"))
                        .catch(() => {
                          setSaveStatus("error");
                          toast({
                            title: "Couldn't save your draft",
                            status: "error"
                          });
                        });
                    }}
                  />
                </>
              )}
            </Formik>
          )
        )}
      </Box>
    </Box>
  );
};

export default Register;
