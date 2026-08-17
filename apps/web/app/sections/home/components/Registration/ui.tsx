import { Box, Input, Text } from "@chakra-ui/react";
import type { BoxProps, ButtonProps, InputProps } from "@chakra-ui/react";
import { getIn, useFormikContext } from "formik";
import {
  BODY_FONT,
  TEXT_COLOR,
  TITLE_FONT
} from "@app/sections/home/components/Auth/AuthCard";

export { BODY_FONT, TEXT_COLOR, TITLE_FONT };

export const PINK = "#EF539E";
export const CYAN = "#5CE1E6";
export const MUTED = "rgba(252,242,246,0.55)";
export const FAINT = "rgba(252,242,246,0.42)";

export const PAGE_GRADIENT =
  "linear-gradient(180deg,#0F062D 0%,#24114C 58%,#170A36 100%)";

export const glassCardStyles: BoxProps = {
  border: "1px solid",
  borderColor: "rgba(252,242,246,0.12)",
  borderRadius: "16px",
  bg: "rgba(125,28,86,0.17)",
  backdropFilter: "blur(22px)"
};

export const inputStyles: InputProps = {
  w: "100%",
  px: "16px",
  py: "14px",
  h: "auto",
  borderRadius: "11px",
  border: "1px solid",
  borderColor: "rgba(252,242,246,0.16)",
  bg: "rgba(15,6,45,0.5)",
  color: TEXT_COLOR,
  // 16px on touch screens so iOS Safari doesn't zoom the field on focus
  fontSize: { base: "16px", md: "15px" },
  _placeholder: { color: "rgba(252,242,246,0.32)" },
  _hover: { borderColor: "rgba(252,242,246,0.3)" },
  _focusVisible: {
    borderColor: PINK,
    boxShadow: "0 0 0 3px rgba(239,83,158,0.18)"
  }
};

export const WizardInput = (props: InputProps) => (
  <Input {...inputStyles} {...props} />
);

export const gradientButtonStyles: ButtonProps = {
  h: "auto",
  borderRadius: "11px",
  border: "1px solid",
  borderColor: "rgba(239,83,158,0.5)",
  bgGradient: "linear(90deg, #7D1C56 0%, #EF539E 100%)",
  color: "#FFFFFF",
  fontFamily: TITLE_FONT,
  fontWeight: "400",
  letterSpacing: "0.04em",
  boxShadow: "0 10px 30px rgba(239,83,158,0.28)",
  _hover: { boxShadow: "0 14px 40px rgba(239,83,158,0.45)" },
  _active: { boxShadow: "0 6px 20px rgba(239,83,158,0.35)" }
};

export const ghostButtonStyles: ButtonProps = {
  h: "auto",
  borderRadius: "11px",
  border: "1px solid",
  borderColor: "rgba(252,242,246,0.2)",
  bg: "rgba(252,242,246,0.05)",
  color: TEXT_COLOR,
  fontWeight: "400",
  _hover: {
    bg: "rgba(252,242,246,0.12)",
    borderColor: "rgba(252,242,246,0.4)"
  },
  _active: { bg: "rgba(252,242,246,0.16)" }
};

type FieldLabelProps = {
  children: React.ReactNode;
  isRequired?: boolean;
};

export const FieldLabel = ({ children, isRequired }: FieldLabelProps) => (
  <Text
    fontSize="12px"
    letterSpacing="0.09em"
    textTransform="uppercase"
    color={MUTED}
    mb="10px"
  >
    {children}
    {isRequired && (
      <Box as="span" color={PINK} ml={1}>
        *
      </Box>
    )}
  </Text>
);

/**
 * Inline validation message for a Formik field, shown once it's been touched.
 * Array fields (majors…) can hold nested error objects, so any non-string
 * error falls back to a generic message. personalLinks renders its own
 * per-slot errors inside LinksInput instead.
 */
export const FieldError = ({ name }: { name: string }) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const error: unknown = getIn(errors, name);
  if (!getIn(touched, name) || !error) {
    return null;
  }

  const message =
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? (error.find((item) => typeof item === "string") ??
          "Please check this field")
        : "Please check this field";

  return (
    <Text fontSize="12.5px" color="#FFB4D1" mt="8px" role="alert">
      {message}
    </Text>
  );
};
