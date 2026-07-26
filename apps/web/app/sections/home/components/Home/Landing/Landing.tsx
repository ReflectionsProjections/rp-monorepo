import { Box } from "@chakra-ui/react";
import { HeroContent } from "./HeroContent";
import landingBg from "@app/sections/home/assets/Landing/Landing.svg";

export const Landing = () => {
  return (
    <Box
      position="relative"
      overflow="hidden"
      id="hero"
      minH={{ base: "100dvh", xl: "auto" }}
      aspectRatio={{ xl: "1512 / 982" }}
      display="flex"
      flexDirection="column"
      bg={{ base: "#0d0b1a", xl: "transparent" }}
      zIndex={1}
    >
      <Box
        as="img"
        src={landingBg}
        alt=""
        display={{ base: "block", xl: "none" }}
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
