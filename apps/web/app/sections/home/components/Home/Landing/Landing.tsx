import { Box } from "@chakra-ui/react";
import { HeroContent } from "./HeroContent";

export const Landing = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      id="hero"
      h={{ base: "auto", md: "75svh" }}
      display="flex"
      flexDirection="column"
      bg="transparent"
      zIndex={1}
    >
      <HeroContent />
    </Box>
  );
};

export default Landing;
