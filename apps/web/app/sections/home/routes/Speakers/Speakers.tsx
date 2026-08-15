import SpeakerCardRow from "@app/sections/home/components/Speakers/SpeakerCardRow";
import { Box, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import type { Speaker } from "@app";
import { api } from "@app";
import { useEffect, useMemo, useState } from "react";

// Shown until the 2026 speakers are announced (matches the Figma placeholders)
const PLACEHOLDER_SPEAKERS: Speaker[] = Array.from({ length: 8 }, (_, i) => ({
  speakerId: `placeholder-${i}`,
  name: "Name Name",
  title: "",
  bio: "",
  eventTitle: "",
  eventDescription: "",
  imgUrl: ""
}));

export default function Speakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const columns = useBreakpointValue({ base: 2, md: 3, lg: 4 }) ?? 4;

  useEffect(() => {
    api
      .get("/speakers")
      .then((response) => setSpeakers(response.data))
      .catch(() => console.error("Failed to load speakers"));
  }, []);

  const rows = useMemo(() => {
    const displayed = speakers.length > 0 ? speakers : PLACEHOLDER_SPEAKERS;
    const result: Speaker[][] = [];
    for (let i = 0; i < displayed.length; i += columns) {
      result.push(displayed.slice(i, i + columns));
    }
    return result;
  }, [speakers, columns]);

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
        <VStack
          w="100%"
          maxW="1440px"
          gap={{ base: 6, md: 10 }}
          mt={{ base: 12, md: "150px" }}
        >
          {rows.map((row, index) => (
            <SpeakerCardRow
              key={`speaker-row-${index}`}
              speakers={row}
              columns={columns}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
