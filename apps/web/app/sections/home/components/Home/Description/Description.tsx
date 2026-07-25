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
      minH={{ base: "900px", sm: "980px", md: "auto" }}
      aspectRatio={{ md: "1512 / 1476" }}
      overflow="hidden"
      color="white"
      bg={{ base: "#100b1f", md: "transparent" }}
      zIndex={2}
    >
      <Box
        position="absolute"
        insetX={0}
        top={{ base: 0, md: "-30.5%" }}
        zIndex={0}
        w="100%"
        h={{ base: "36%", md: "61%" }}
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
        display={{ base: "none", md: "block" }}
        position="absolute"
        left={0}
        top="30.5%"
        zIndex={1}
        w="15.55%"
        h="18%"
      />

      <Image
        src="/site/about/about-right-tower.jpg"
        alt=""
        aria-hidden
        display={{ base: "none", md: "block" }}
        position="absolute"
        right={0}
        top="30.5%"
        zIndex={1}
        w="12.1%"
        h="18%"
      />

      <Box
        aria-hidden
        position="absolute"
        left={{ base: "4%", md: "15.55%" }}
        top={{ base: "30%", md: "30.5%" }}
        zIndex={2}
        w={{ base: "92%", md: "72.35%" }}
        h={{ base: "53%", md: "41%" }}
        bg="linear-gradient(105deg, #3c237c 0%, #310f78 45%, #34107c 100%)"
        borderLeft="clamp(4px, 0.5vw, 8px) solid #373792"
        borderRight="clamp(4px, 0.5vw, 8px) solid #f325c2"
      >
        <Box
          position="absolute"
          left={{ base: "-1.2rem", md: "-4.8%" }}
          top={{ base: "1.2rem", md: "2%" }}
          w={{ base: "3.2rem", md: "8.5%" }}
          h={{ base: "0.85rem", md: "3.7%" }}
          bg="#936ae9"
          borderRadius="2px"
        />
        <Box
          position="absolute"
          right={{ base: "-1.2rem", md: "-3.2%" }}
          top={{ base: "1.2rem", md: "2%" }}
          w={{ base: "3.2rem", md: "8.5%" }}
          h={{ base: "0.85rem", md: "3.7%" }}
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
        h={{ base: "39%", md: "44%" }}
        objectFit="cover"
        objectPosition="center top"
        clipPath="inset(45% 0 0)"
        pointerEvents="none"
      />

      <Box
        position="absolute"
        left={{ base: "4%", md: "15.55%" }}
        top={{ base: "30%", md: "30.5%" }}
        zIndex={4}
        w={{ base: "92%", md: "72.35%" }}
        h={{ base: "53%", md: "41%" }}
        px={{ base: 6, sm: 10, md: "5.5%" }}
        pt={{ base: 8, md: "2.8%" }}
        pb={{ base: 12, md: "4%" }}
      >
        <Heading
          id="about-heading"
          fontFamily="Ethnocentric"
          fontWeight={400}
          fontSize={{ base: "clamp(1.7rem, 7.5vw, 2.7rem)", md: "4vw" }}
          lineHeight={1.05}
          textAlign="center"
          whiteSpace={{ md: "nowrap" }}
          mb={{ base: 8, md: "6%" }}
        >
          Welcome to R|P!
        </Heading>

        {ABOUT_COPY.map((paragraph) => (
          <Text
            key={paragraph}
            maxW="930px"
            mx="auto"
            mb={{ base: 5, md: "2.5%" }}
            fontFamily="'Share Tech Mono', 'Magistral', monospace"
            fontSize={{
              base: "clamp(0.95rem, 4vw, 1.15rem)",
              md: "1.55vw"
            }}
            lineHeight={{ base: 1.55, md: 1.45 }}
          >
            {paragraph}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default Description;
