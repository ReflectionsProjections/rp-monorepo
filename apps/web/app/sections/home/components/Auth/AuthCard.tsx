import { Box, Heading, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export const TITLE_FONT = "'Geist Pixel', sans-serif";
export const BODY_FONT = "Inter, sans-serif";
export const TEXT_COLOR = "#FCF2F6";
export const GLOW = "drop-shadow(0 0 6px rgba(192,38,211,0.55))";

type AuthCardProps = {
  title: string;
  children: ReactNode;
};

/**
 * The glass pill the rest of the 2026 site uses, sized for a single auth step.
 */
export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <Box
      minH="100dvh"
      bg="#100e0e"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={16}
    >
      <VStack
        w="100%"
        maxW="440px"
        spacing={6}
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(252,242,246,0.15)"
        bg="rgba(125,28,86,0.25)"
        backdropFilter="blur(24px)"
        boxShadow="xl"
        textAlign="center"
      >
        <Heading
          as="h1"
          fontFamily={TITLE_FONT}
          fontWeight="400"
          fontSize={{ base: "md", md: "lg" }}
          color="#FFFFFF"
          textTransform="uppercase"
          lineHeight="1.4"
          sx={{ filter: GLOW }}
        >
          {title}
        </Heading>
        {children}
      </VStack>
    </Box>
  );
}
