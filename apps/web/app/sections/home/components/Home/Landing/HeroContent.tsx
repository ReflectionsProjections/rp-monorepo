import { Box, HStack, Image, Link, VStack, useBreakpointValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import registerBtnSrc from "@app/sections/home/assets/Landing/RegisterButton.svg";

const MotionBox = motion(Box);

const GLOW = "drop-shadow(0 0 14px rgba(192,38,211,0.75)) drop-shadow(0 0 32px rgba(120,40,200,0.45))";

const PIPE_DELAY    = 0.2;
const WORDS_DELAY   = 0.85;
const GLOW_DELAY    = WORDS_DELAY + 0.75;
const BADGES_DELAY  = 1.6;
const REGISTER_DELAY = 1.9;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: "easeOut" },
});

const titleFont = {
  fontFamily: "Ethnocentric, ProRacing, sans-serif",
  fontWeight: "400" as const,
  color: "#FFFFFF",
  lineHeight: "1" as const,
  textTransform: "uppercase" as const,
};

export const HeroContent = () => {
  const xOffset     = useBreakpointValue({ base: 20, sm: 40, md: 60 }) ?? 60;
  const wordSpacing = useBreakpointValue({ base: 1, sm: 2, md: 3 });
  const fontSize    = useBreakpointValue({ base: "lg", sm: "2xl", md: "3xl", lg: "4xl", xl: "5xl" });

  return (
    <VStack
      position="relative"
      zIndex={2}
      flex={1}
      justify="center"
      align="center"
      spacing={{ base: 6, md: 8 }}
      minH="100dvh"
      px={4}
      pb={16}
    >
      {/* Title */}
      <HStack spacing={wordSpacing} justify="center" align="center">
        {/* REFLECTIONS — slides from left */}
        <MotionBox
          initial={{ opacity: 0, x: -xOffset, filter: "drop-shadow(0 0 0px transparent)" }}
          animate={{ opacity: 1, x: 0, filter: GLOW }}
          transition={{
            delay: WORDS_DELAY,
            duration: 0.7,
            ease: "easeOut",
            filter: { delay: GLOW_DELAY, duration: 0.8, ease: "easeOut" },
          }}
        >
          <Box {...titleFont} fontSize={fontSize} as="span">Reflections</Box>
        </MotionBox>

        {/* Pipe — grows first */}
        <MotionBox
          initial={{ opacity: 0, y: 20, scaleY: 0, filter: "drop-shadow(0 0 0px transparent)" }}
          animate={{ opacity: 1, y: 0, scaleY: 1, filter: GLOW }}
          transition={{
            delay: PIPE_DELAY,
            duration: 0.5,
            ease: "easeOut",
            filter: { delay: GLOW_DELAY, duration: 0.8, ease: "easeOut" },
          }}
          style={{ transformOrigin: "center" }}
        >
          <Box {...titleFont} fontSize={fontSize} as="span">|</Box>
        </MotionBox>

        {/* PROJECTIONS — slides from right */}
        <MotionBox
          initial={{ opacity: 0, x: xOffset, filter: "drop-shadow(0 0 0px transparent)" }}
          animate={{ opacity: 1, x: 0, filter: GLOW }}
          transition={{
            delay: WORDS_DELAY,
            duration: 0.7,
            ease: "easeOut",
            filter: { delay: GLOW_DELAY, duration: 0.8, ease: "easeOut" },
          }}
        >
          <Box {...titleFont} fontSize={fontSize} as="span">Projections</Box>
        </MotionBox>
      </HStack>

      {/* App store badges */}
      <MotionBox {...fadeUp(BADGES_DELAY)} mt={{ base: 3, md: 5 }}>
        <HStack
          spacing={6}
          flexDir={{ base: "column", sm: "row" }}
          align="center"
          justify="center"
        >
          <Link
            href="https://apps.apple.com/us/app/r-p-2025/id6744465190"
            isExternal
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.3s ease"
          >
            <Image
              src="/site/appscreen/app_store.png"
              alt="Download on the App Store"
              h={{ base: "50px", md: "60px" }}
              w="auto"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              _hover={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))" }}
            />
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.reflectionsprojections&utm_source=na_Med"
            isExternal
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.3s ease"
          >
            <Image
              src="/site/appscreen/google_play.png"
              alt="Get it on Google Play"
              h={{ base: "50px", md: "60px" }}
              w="auto"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              _hover={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))" }}
            />
          </Link>
        </HStack>
      </MotionBox>

      {/* Register Now */}
      <MotionBox {...fadeUp(REGISTER_DELAY)}>
        <Link
          as={NavLink}
          to="/register"
          display="block"
          _hover={{ transform: "scale(1.03)", textDecoration: "none" }}
          transition="all 0.25s ease"
        >
          <Box
            as="img"
            src={registerBtnSrc}
            alt="Register Now"
            h={{ base: "58px", md: "74px" }}
            w="auto"
            maxW={{ base: "300px", sm: "400px", md: "500px" }}
          />
        </Link>
      </MotionBox>
    </VStack>
  );
};

export default HeroContent;
