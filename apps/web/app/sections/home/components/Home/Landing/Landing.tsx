import { Box } from "@chakra-ui/react";
import { HeroContent } from "./HeroContent";
import landingBg from "@app/sections/home/assets/Landing/Landing.svg";

export const Landing = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      id="hero"
      minH="100dvh"
      display="flex"
      flexDirection="column"
      bg="#0d0b1a"
    >
      <Box
        as="img"
        src={landingBg}
        alt=""
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
        objectFit="cover"
        objectPosition="center bottom"
        pointerEvents="none"
        aria-hidden="true"
      />
      <HeroContent />
    </Box>
  );
};

export default Landing;
