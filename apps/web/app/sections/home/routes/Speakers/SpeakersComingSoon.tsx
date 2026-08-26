import { Box, Text, VStack } from "@chakra-ui/react";

// Temporary stand-in for Speakers.tsx until the 2026 lineup is announced.
// Swap the /speakers route in App.tsx back to Speakers once it is.
export default function SpeakersComingSoon() {
  return (
    <Box
      position="relative"
      minH="100dvh"
      overflow="hidden"
      bgGradient="linear(to-b, #22002F 0%, #511767 43.75%, #2A003A 100%)"
    >
      {/* Perspective grid backdrop (from the 2026 design) */}
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        top={{ base: "360px", md: "560px" }}
        bgImage="/site/speakers-2026/grid-backdrop.svg"
        bgSize="cover"
        bgPosition="top center"
        bgRepeat="no-repeat"
        pointerEvents="none"
      />
      <VStack
        position="relative"
        gap={0}
        pt={{ base: 28, md: 40 }}
        pb={{ base: 16, md: 24 }}
        px={{ base: 4, md: 8 }}
      >
        <Text
          as="h1"
          fontFamily="'Geist Pixel', sans-serif"
          color="#EFF2FF"
          textAlign="center"
          lineHeight="1"
          fontSize="clamp(44px, 6.35vw, 96px)"
        >
          SPEAKERS
        </Text>
        <Text
          fontFamily="'Geist Pixel', sans-serif"
          color="#EFF2FF"
          textAlign="center"
          lineHeight="1"
          mt={{ base: 1, md: 2 }}
          fontSize="clamp(72px, 11.6vw, 175px)"
        >
          2026
        </Text>
        <Text
          fontFamily="'Geist Pixel', sans-serif"
          color="#EFF2FF"
          textAlign="center"
          lineHeight="1.2"
          mt={{ base: 16, md: "180px" }}
          fontSize="clamp(24px, 3.2vw, 48px)"
        >
          TO BE ANNOUNCED
        </Text>
      </VStack>
    </Box>
  );
}
