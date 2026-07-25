import { Box, Heading, Image, Text } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MotionBox = motion(Box);

const ABOUT_COPY = [
  "Reflections | Projections is the Midwest's largest student-run technology conference. Every fall, we bring students, creators, researchers, and industry leaders together at the University of Illinois Urbana-Champaign.",
  "Join us September 16–19 for four days of inspiring speakers, technical talks, a career fair, workshops, free food, merch, and the ideas shaping what comes next."
];

export const Description = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  return (
    <Box
      as="section"
      id="description"
      ref={sectionRef}
      aria-labelledby="about-heading"
      position="relative"
      w="100%"
      minH={{ base: "900px", sm: "980px", md: "auto" }}
      aspectRatio={{ md: "1512 / 1926" }}
      overflow="hidden"
      color="white"
      bg={{ base: "#100b1f", md: "transparent" }}
      zIndex={2}
    >
      <Image
        src="/site/about/about-skyline.jpg"
        alt=""
        aria-hidden
        display={{ base: "block", md: "none" }}
        position="absolute"
        insetX={0}
        top={0}
        zIndex={0}
        w="100%"
        h="36%"
        objectFit="cover"
        objectPosition="center top"
      />

      <Image
        src="/site/about/about-left-tower.jpg"
        alt=""
        aria-hidden
        display="none"
        position="absolute"
        left={0}
        top="46.7%"
        zIndex={1}
        w="15.55%"
        h="13.85%"
      />

      <Image
        src="/site/about/about-right-tower.jpg"
        alt=""
        aria-hidden
        display="none"
        position="absolute"
        right={0}
        top="46.7%"
        zIndex={1}
        w="12.1%"
        h="13.85%"
      />

      <Box
        aria-hidden
        position="absolute"
        left={{ base: "4%", md: "15.55%" }}
        top={{ base: "30%", md: "8%" }}
        zIndex={2}
        w={{ base: "92%", md: "72.35%" }}
        h={{ base: "53%", md: "52%" }}
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
        h={{ base: "39%", md: "33.7%" }}
        objectFit="cover"
        objectPosition="center top"
        clipPath="inset(45% 0 0)"
        pointerEvents="none"
      />

      <MotionBox
        position="absolute"
        left={{ base: "4%", md: "15.55%" }}
        top={{ base: "30%", md: "8%" }}
        zIndex={4}
        w={{ base: "92%", md: "72.35%" }}
        h={{ base: "53%", md: "52%" }}
        px={{ base: 6, sm: 10, md: "5.5%" }}
        pt={{ base: 8, md: "2.8%" }}
        pb={{ base: 12, md: "4%" }}
        initial={{ opacity: 0, y: 36 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: "easeOut" }}
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
      </MotionBox>
    </Box>
  );
};

export default Description;
