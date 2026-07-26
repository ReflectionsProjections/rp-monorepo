import type { FAQItem } from "@app/sections/home/constants/faq-questions";
import { parseRichText } from "@app/sections/home/utils/textParser";
import { Box, Image, Text } from "@chakra-ui/react";

type FAQQuestionProps = {
  index: number;
  faqItem: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
};

export const FAQQuestion = ({
  index,
  faqItem: { question, answer },
  isOpen,
  onToggle
}: FAQQuestionProps) => {
  const answerId = `faq-answer-${index}`;

  return (
    <Box w="100%">
      <Box
        as="button"
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        minH={{
          base: "88px",
          md: "108px",
          lg: "clamp(86px, 8.7vw, 132px)"
        }}
        gap={4}
        px={{ base: 5, md: 8, lg: "clamp(30px, 3.1vw, 47px)" }}
        py={{ base: 5, md: 7, lg: "clamp(24px, 2.5vw, 38px)" }}
        color="white"
        textAlign="left"
        bg="rgba(49, 37, 55, 0.66)"
        borderRadius="13px"
        boxShadow="0 8px 0 rgba(0, 0, 0, 0.82)"
        cursor="pointer"
        transition="background 180ms ease, transform 180ms ease"
        _hover={{ bg: "rgba(66, 49, 73, 0.74)" }}
        _focusVisible={{
          outline: "3px solid #e952bc",
          outlineOffset: "4px"
        }}
      >
        <Text
          fontFamily="Ethnocentric, ProRacing, sans-serif"
          fontSize={{
            base: "clamp(0.7rem, 3.25vw, 0.92rem)",
            md: "1rem",
            xl: "clamp(1rem, 1.18vw, 1.12rem)"
          }}
          lineHeight={1.3}
        >
          {question}
        </Text>

        <Image
          src="/site/faq/faq-arrow.svg"
          alt=""
          aria-hidden
          flexShrink={0}
          w={{ base: "32px", md: "42px", xl: "55px" }}
          h={{ base: "32px", md: "42px", xl: "55px" }}
          transform={isOpen ? "rotate(90deg)" : "rotate(180deg)"}
          transition="transform 220ms ease"
        />
      </Box>

      <Box
        display="grid"
        gridTemplateRows={isOpen ? "1fr" : "0fr"}
        opacity={isOpen ? 1 : 0}
        transition={
          isOpen
            ? "grid-template-rows 700ms cubic-bezier(0.4, 0, 0.2, 1), opacity 420ms ease-in-out 160ms"
            : "grid-template-rows 240ms cubic-bezier(0.4, 0, 1, 1), opacity 160ms ease-in"
        }
        aria-hidden={!isOpen}
      >
        <Box minH={0} overflow="hidden">
          <Box
            id={answerId}
            role="region"
            aria-label={`${question} answer`}
            mt="8px"
            px={{ base: 5, md: 8, xl: "47px" }}
            py={{ base: 5, md: 7, xl: 8 }}
            color="#fcf2f6"
            bg="rgba(49, 37, 55, 0.86)"
            borderRadius="13px"
            boxShadow="0 8px 0 rgba(0, 0, 0, 0.6)"
          >
            <Box
              fontFamily="'Share Tech Mono', Magistral, monospace"
              fontSize={{ base: "sm", md: "lg" }}
              lineHeight={1.65}
            >
              {parseRichText(answer)}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
