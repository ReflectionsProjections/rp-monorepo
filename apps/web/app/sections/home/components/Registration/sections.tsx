import { Box, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useFormikContext } from "formik";
import {
  educationLevels,
  employmentOpportunities,
  graduationDates,
  majors,
  minors,
  schools
} from "@app";
import type { RegistrationValues } from "./schema";
import {
  ComboBox,
  FileDrop,
  FlagCard,
  LinksInput,
  OtherInput,
  PillGroup
} from "./controls";
import {
  CYAN,
  FieldError,
  FieldLabel,
  MUTED,
  TEXT_COLOR,
  TITLE_FONT,
  WizardInput,
  glassCardStyles
} from "./ui";

export const GENDER_SELF_DESCRIBE = "Prefer to self-describe";

const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Non-binary",
  "Prefer not to say",
  GENDER_SELF_DESCRIBE
];

const ETHNICITY_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino/a/x",
  "Middle Eastern or North African",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Prefer not to answer",
  "Other"
];

const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Eggs",
  "Soy",
  "Shellfish",
  "Fish",
  "Sesame",
  "Other"
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescetarian",
  "Gluten-Free",
  "Kosher",
  "Halal",
  "Dairy-Free",
  "No Beef",
  "Other"
];

const HEAR_OPTIONS = [
  "Word of mouth",
  "In-class marketing",
  "On campus events",
  "Instagram",
  "Email",
  "Linkedin",
  "Flyers",
  "Discord",
  "Other"
];

const TAG_OPTIONS = [
  "Career Readiness",
  "AI",
  "Research",
  "Interactive Events",
  "HCI",
  "Ethics",
  "Art/Media",
  "Autonomous Vehicles",
  "Networking",
  "Company Talk",
  "Cybersecurity"
];

const EDUCATION_OPTIONS = [...educationLevels, "Other"];

export type SectionMeta = {
  title: string;
  subtitle: string;
  towerLabel: string;
  towerHeight: number;
};

export const SECTIONS: SectionMeta[] = [
  {
    title: "About you",
    subtitle: "Name, contact and demographics",
    towerLabel: "About",
    towerHeight: 26
  },
  {
    title: "Food & access",
    subtitle: "Allergies and dietary restrictions",
    towerLabel: "Food",
    towerHeight: 34
  },
  {
    title: "Education",
    subtitle: "School, degree, majors and graduation",
    towerLabel: "School",
    towerHeight: 42
  },
  {
    title: "Interests",
    subtitle: "Events, competitions and how you found us",
    towerLabel: "Interests",
    towerHeight: 30
  },
  {
    title: "Career",
    subtitle: "Opportunities, resume and personal links",
    towerLabel: "Career",
    towerHeight: 38
  }
];

/**
 * Which Formik fields each step must pass before Continue advances. Optional
 * questions are omitted; personalLinks is listed so a malformed URL blocks the
 * final step.
 */
export const STEP_FIELDS: (keyof RegistrationValues)[][] = [
  ["name", "gender"],
  [],
  ["school", "educationLevel", "majors", "graduationYear"],
  ["howDidYouHear", "tags"],
  ["personalLinks"]
];

/** Drives the skyline towers and the "% complete" readout. */
export const sectionComplete = (
  index: number,
  values: RegistrationValues
): boolean => {
  switch (index) {
    case 0:
      return values.name !== "" && values.gender !== "";
    case 1:
      return (
        values.allergies.length > 0 || values.dietaryRestrictions.length > 0
      );
    case 2:
      return (
        values.school !== "" &&
        values.educationLevel !== "" &&
        values.majors.length > 0 &&
        values.graduationYear !== ""
      );
    case 3:
      return values.howDidYouHear.length > 0 && values.tags.length > 0;
    case 4:
      return values.opportunities.length > 0 || values.resume !== null;
    default:
      return false;
  }
};

type SectionCardProps = {
  index: number;
  active: boolean;
  complete: boolean;
  onHeaderClick: () => void;
  children: React.ReactNode;
};

export const SectionCard = ({
  index,
  active,
  complete,
  onHeaderClick,
  children
}: SectionCardProps) => {
  const meta = SECTIONS[index];

  return (
    <Box {...glassCardStyles} overflow="hidden" mb="14px">
      <Flex
        as="button"
        type="button"
        onClick={onHeaderClick}
        aria-expanded={active}
        align="center"
        gap={{ base: "12px", md: "16px" }}
        w="100%"
        px={{ base: "16px", md: "24px" }}
        py="20px"
        textAlign="left"
        color={TEXT_COLOR}
        cursor="pointer"
      >
        <Flex
          w="36px"
          h="36px"
          flex="none"
          borderRadius="9px"
          border="1px solid"
          borderColor={
            active ? "rgba(239,83,158,0.6)" : "rgba(252,242,246,0.2)"
          }
          align="center"
          justify="center"
          fontFamily={TITLE_FONT}
          fontSize="11px"
        >
          {String(index + 1).padStart(2, "0")}
        </Flex>
        <VStack flex={1} align="flex-start" spacing="5px">
          <Text fontFamily={TITLE_FONT} fontSize="14px" letterSpacing="0.02em">
            {meta.title}
          </Text>
          <Text fontSize="13px" color="rgba(252,242,246,0.5)">
            {meta.subtitle}
          </Text>
        </VStack>
        {complete && (
          <Box
            flex="none"
            fontSize="10.5px"
            letterSpacing="0.1em"
            color={CYAN}
            border="1px solid"
            borderColor="rgba(92,225,230,0.4)"
            borderRadius="full"
            px="11px"
            py="5px"
          >
            COMPLETE
          </Box>
        )}
      </Flex>
      {active && (
        <VStack
          align="stretch"
          spacing="28px"
          px={{ base: "16px", md: "24px" }}
          pt="6px"
          pb="30px"
          borderTop="1px solid"
          borderColor="rgba(252,242,246,0.09)"
        >
          {children}
        </VStack>
      )}
    </Box>
  );
};

export const AboutSection = () => {
  const { values, setFieldValue } = useFormikContext<RegistrationValues>();

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
        <Box>
          <FieldLabel isRequired>Name</FieldLabel>
          <WizardInput
            value={values.name}
            maxLength={50}
            placeholder="Preferred Name"
            onChange={(event) => void setFieldValue("name", event.target.value)}
          />
          <FieldError name="name" />
        </Box>
        <Box>
          <FieldLabel isRequired>Email</FieldLabel>
          <Box position="relative">
            <WizardInput
              value={values.email}
              isReadOnly
              pr="96px"
              borderColor="rgba(252,242,246,0.1)"
              bg="rgba(15,6,45,0.3)"
              color="rgba(252,242,246,0.72)"
              cursor="not-allowed"
              _focusVisible={{}}
            />
            <Box
              position="absolute"
              right="12px"
              top="50%"
              transform="translateY(-50%)"
              fontSize="10.5px"
              letterSpacing="0.08em"
              color={CYAN}
              border="1px solid"
              borderColor="rgba(92,225,230,0.35)"
              borderRadius="full"
              px="10px"
              py="4px"
            >
              VERIFIED
            </Box>
          </Box>
        </Box>
      </SimpleGrid>

      <Box>
        <FieldLabel isRequired>Gender</FieldLabel>
        <PillGroup
          options={GENDER_OPTIONS}
          value={values.gender}
          onChange={(next) => void setFieldValue("gender", next)}
        />
        <OtherInput
          visible={values.gender === GENDER_SELF_DESCRIBE}
          value={values.genderOther}
          onChange={(next) => void setFieldValue("genderOther", next)}
        />
        <FieldError name="gender" />
      </Box>

      <Box>
        <FieldLabel>Race and/or Ethnicity</FieldLabel>
        <PillGroup
          multi
          options={ETHNICITY_OPTIONS}
          value={values.ethnicity}
          onChange={(next) => void setFieldValue("ethnicity", next)}
        />
        <OtherInput
          visible={values.ethnicity.includes("Other")}
          value={values.ethnicityOther}
          onChange={(next) => void setFieldValue("ethnicityOther", next)}
        />
      </Box>
    </>
  );
};

export const FoodSection = () => {
  const { values, setFieldValue } = useFormikContext<RegistrationValues>();

  return (
    <>
      <Box>
        <FieldLabel>Allergies</FieldLabel>
        <PillGroup
          multi
          options={ALLERGY_OPTIONS}
          value={values.allergies}
          onChange={(next) => void setFieldValue("allergies", next)}
        />
        <OtherInput
          visible={values.allergies.includes("Other")}
          value={values.allergiesOther}
          onChange={(next) => void setFieldValue("allergiesOther", next)}
        />
      </Box>
      <Box>
        <FieldLabel>Dietary Restrictions</FieldLabel>
        <PillGroup
          multi
          options={DIETARY_OPTIONS}
          value={values.dietaryRestrictions}
          onChange={(next) => void setFieldValue("dietaryRestrictions", next)}
        />
        <OtherInput
          visible={values.dietaryRestrictions.includes("Other")}
          value={values.dietaryOther}
          onChange={(next) => void setFieldValue("dietaryOther", next)}
        />
      </Box>
    </>
  );
};

export const EducationSection = () => {
  const { values, setFieldValue } = useFormikContext<RegistrationValues>();

  return (
    <>
      <Box>
        <FieldLabel isRequired>What school do you attend?</FieldLabel>
        <ComboBox
          placeholder="Search for the school you attend"
          options={schools}
          selected={values.school === "" ? [] : [values.school]}
          maxSelections={1}
          onChange={(next) => void setFieldValue("school", next[0] ?? "")}
        />
        <FieldError name="school" />
      </Box>

      <Box>
        <FieldLabel isRequired>
          Highest level of education (pursuing or completed)
        </FieldLabel>
        <PillGroup
          options={EDUCATION_OPTIONS}
          value={values.educationLevel}
          onChange={(next) => void setFieldValue("educationLevel", next)}
        />
        <OtherInput
          visible={values.educationLevel === "Other"}
          value={values.educationOther}
          onChange={(next) => void setFieldValue("educationOther", next)}
        />
        <FieldError name="educationLevel" />
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
        <Box>
          <FieldLabel isRequired>Major(s)</FieldLabel>
          <ComboBox
            placeholder="Search majors — up to 5"
            options={majors}
            selected={values.majors}
            maxSelections={5}
            onChange={(next) => void setFieldValue("majors", next)}
          />
          <FieldError name="majors" />
        </Box>
        <Box>
          <FieldLabel>Minor(s)</FieldLabel>
          <ComboBox
            placeholder="Search minors — up to 5"
            options={minors}
            selected={values.minors}
            maxSelections={5}
            onChange={(next) => void setFieldValue("minors", next)}
          />
        </Box>
      </SimpleGrid>

      <Box>
        <FieldLabel isRequired>When do you intend to graduate?</FieldLabel>
        <PillGroup
          options={graduationDates}
          value={values.graduationYear}
          onChange={(next) => void setFieldValue("graduationYear", next)}
        />
        <FieldError name="graduationYear" />
      </Box>
    </>
  );
};

export const InterestsSection = () => {
  const { values, setFieldValue } = useFormikContext<RegistrationValues>();

  return (
    <>
      <Box>
        <FieldLabel isRequired>How did you hear about us?</FieldLabel>
        <PillGroup
          multi
          options={HEAR_OPTIONS}
          value={values.howDidYouHear}
          onChange={(next) => void setFieldValue("howDidYouHear", next)}
        />
        <FieldError name="howDidYouHear" />
      </Box>
      <Box>
        <FieldLabel isRequired>
          What kinds of events are you interested in?
        </FieldLabel>
        <PillGroup
          multi
          options={TAG_OPTIONS}
          value={values.tags}
          onChange={(next) => void setFieldValue("tags", next)}
        />
        <FieldError name="tags" />
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">
        <FlagCard
          title="PuzzleBang"
          description="Are you interested in participating in PuzzleBang?"
          active={values.isInterestedPuzzleBang}
          onToggle={() =>
            void setFieldValue(
              "isInterestedPuzzleBang",
              !values.isInterestedPuzzleBang
            )
          }
        />
        <FlagCard
          title="MechMania"
          description="Are you interested in participating in MechMania?"
          active={values.isInterestedMechMania}
          onToggle={() =>
            void setFieldValue(
              "isInterestedMechMania",
              !values.isInterestedMechMania
            )
          }
        />
      </SimpleGrid>
    </>
  );
};

export const CareerSection = () => {
  const { values, setFieldValue, errors, touched } =
    useFormikContext<RegistrationValues>();

  return (
    <>
      <Box>
        <FieldLabel>What opportunities are you open to?</FieldLabel>
        <PillGroup
          multi
          options={employmentOpportunities}
          value={values.opportunities}
          onChange={(next) => void setFieldValue("opportunities", next)}
        />
      </Box>

      <Box>
        <FieldLabel>Resume</FieldLabel>
        <FileDrop
          value={values.resume}
          onChange={(next) => void setFieldValue("resume", next)}
        />
        <Text fontSize="12.5px" lineHeight="1.6" color={MUTED} mt="11px">
          Your resume will be shared with our corporate sponsors. You may return
          to this page at any time to update it.
        </Text>
      </Box>

      <Box>
        <FieldLabel>Personal Links</FieldLabel>
        <LinksInput
          value={values.personalLinks}
          onChange={(next) => void setFieldValue("personalLinks", next)}
          error={touched.personalLinks ? errors.personalLinks : undefined}
        />
      </Box>
    </>
  );
};

export const SECTION_BODIES = [
  AboutSection,
  FoodSection,
  EducationSection,
  InterestsSection,
  CareerSection
];
