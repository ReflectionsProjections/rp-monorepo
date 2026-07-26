import { Box, Heading, Image, Text } from "@chakra-ui/react";

const ABOUT_COPY = [
  "Reflections | Projections is the Midwest's largest student-run technology conference. Every fall, we bring students, creators, researchers, and industry leaders together at the University of Illinois Urbana-Champaign.",
  "Join us September 16–19 for four days of inspiring speakers, technical talks, a career fair, workshops, free food, merch, and the ideas shaping what comes next."
];

export const Description = () => {
  return (
    <Box
      as="section"
      id="description"
      aria-labelledby="about-heading"
      position="relative"
      w="100%"
      minH={{ base: "900px", sm: "980px", xl: "auto" }}
      mt={{ xl: "calc(-14.88vw + 10vh)" }}
      aspectRatio={{ xl: "1512 / 1250" }}
      overflow="hidden"
      color="white"
      bg={{ base: "#100b1f", xl: "transparent" }}
      zIndex={2}
    >
      <Box
        position="absolute"
        insetX={0}
        top={{ base: 0, xl: "-36%" }}
        zIndex={0}
        w="100%"
        h={{ base: "36%", xl: "72%" }}
        overflow="hidden"
      >
        <Image
          src="/site/about/about-skyline-transparent.png"
          alt=""
          aria-hidden
          display="block"
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center top"
        />
      </Box>

      <Image
        src="/site/about/about-left-tower.jpg"
        alt=""
        aria-hidden
        display={{ base: "none", xl: "block" }}
        position="absolute"
        left={0}
        top="36%"
        zIndex={1}
        w="15.55%"
        h="21.3%"
      />

      <Image
        src="/site/about/about-right-tower.jpg"
        alt=""
        aria-hidden
        display={{ base: "none", xl: "block" }}
        position="absolute"
        right={0}
        top="36%"
        zIndex={1}
        w="12.1%"
        h="21.3%"
      />

      <Box
        aria-hidden
        position="absolute"
        left={{ base: "4%", xl: "15.55%" }}
        top={{ base: "30%", xl: "36%" }}
        zIndex={2}
        w={{ base: "92%", xl: "72.35%" }}
        h={{ base: "53%", xl: "46%" }}
        bg="linear-gradient(105deg, #3c237c 0%, #310f78 45%, #34107c 100%)"
        borderLeft="clamp(4px, 0.5vw, 8px) solid #373792"
        borderRight="clamp(4px, 0.5vw, 8px) solid #f325c2"
      >
        <Box
          position="absolute"
          left={{ base: "-1.2rem", xl: "-4.8%" }}
          top={{ base: "1.2rem", xl: "2%" }}
          w={{ base: "3.2rem", xl: "8.5%" }}
          h={{ base: "0.85rem", xl: "3.7%" }}
          bg="#936ae9"
          borderRadius="2px"
        />
        <Box
          position="absolute"
          right={{ base: "-1.2rem", xl: "-3.2%" }}
          top={{ base: "1.2rem", xl: "2%" }}
          w={{ base: "3.2rem", xl: "8.5%" }}
          h={{ base: "0.85rem", xl: "3.7%" }}
          bg="#936ae9"
          borderRadius="2px"
        />
      </Box>

      <Image
        src="/site/about/about-foreground.png"
        alt=""
        aria-hidden
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        w="100%"
        h={{ base: "39%", xl: "51.9%" }}
        objectFit="cover"
        objectPosition="center top"
        clipPath="inset(45% 0 0)"
        pointerEvents="none"
      />

      <Box
        position="absolute"
        left={{ base: "4%", xl: "15.55%" }}
        top={{ base: "30%", xl: "36%" }}
        zIndex={4}
        w={{ base: "92%", xl: "72.35%" }}
        h={{ base: "53%", xl: "46%" }}
        px={{ base: 6, sm: 10, xl: "5.5%" }}
        pt={{ base: 8, xl: "2.8%" }}
        pb={{ base: 12, xl: "4%" }}
      >
        <Heading
          id="about-heading"
          fontFamily="Ethnocentric"
          fontWeight={400}
          fontSize={{ base: "clamp(1.7rem, 7.5vw, 2.7rem)", xl: "4vw" }}
          lineHeight={1.05}
          textAlign="center"
          whiteSpace={{ xl: "nowrap" }}
          mb={{ base: 8, xl: "6%" }}
        >
          Welcome to R|P!
        </Heading>

        {ABOUT_COPY.map((paragraph) => (
          <Text
            key={paragraph}
            maxW="930px"
            mx="auto"
            mb={{ base: 5, xl: "2.5%" }}
            fontFamily="'Share Tech Mono', 'Magistral', monospace"
            fontSize={{
              base: "clamp(0.95rem, 4vw, 1.15rem)",
              xl: "1.55vw"
            }}
            lineHeight={{ base: 1.55, xl: 1.45 }}
          >
            {paragraph}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default Description;
