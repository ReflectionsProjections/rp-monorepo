import type { FAQItem } from "@app/sections/home/constants/faq-questions";
import { parseRichText } from "@app/sections/home/utils/textParser";
import { Box, Collapse, Image, Text } from "@chakra-ui/react";

type FAQQuestionProps = {
  faqItem: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
};

export const FAQQuestion = ({
  faqItem: { question, answer },
  isOpen,
  onToggle
}: FAQQuestionProps) => (
  <Box w="100%">
    <Box
      as="button"
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      minH={{ base: "96px", md: "132px" }}
      gap={4}
      px={{ base: 5, md: "47px" }}
      py={{ base: 5, md: "38px" }}
      color="white"
      textAlign="left"
      bg="#312537"
      borderRadius="13px"
      boxShadow="0 8px 0 rgba(0, 0, 0, 0.82)"
      cursor="pointer"
      transition="background 180ms ease, transform 180ms ease"
      _hover={{ bg: "#3b2d42" }}
      _focusVisible={{
        outline: "3px solid #e952bc",
        outlineOffset: "4px"
      }}
    >
      <Text
        fontFamily="Ethnocentric, ProRacing, sans-serif"
        fontSize={{ base: "clamp(0.72rem, 3.3vw, 0.95rem)", md: "1.59vw" }}
        lineHeight={1.3}
      >
        {question}
      </Text>

      <Image
        src="/site/faq/faq-arrow.svg"
        alt=""
        aria-hidden
        flexShrink={0}
        w={{ base: "34px", md: "55px" }}
        h={{ base: "34px", md: "55px" }}
        transform={isOpen ? "rotate(90deg)" : "rotate(180deg)"}
        transition="transform 220ms ease"
      />
    </Box>

    <Collapse in={isOpen} animateOpacity unmountOnExit>
      <Box
        mt="8px"
        px={{ base: 5, md: "47px" }}
        py={{ base: 5, md: 7 }}
        color="#fcf2f6"
        bg="rgba(49, 37, 55, 0.96)"
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
    </Collapse>
  </Box>
);
