import type { Speaker } from "@app";
import { CloseIcon } from "@chakra-ui/icons";
import { Box, Collapse, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import SpeakerCard from "./SpeakerCard";

type SpeakerCardRowProps = {
  speakers: Speaker[];
  columns: number;
  selectedId: string | null;
  onSelect: (speakerId: string | null) => void;
};

const PANEL_BODY = "#240131";

export default function SpeakerCardRow({
  speakers,
  columns,
  selectedId,
  onSelect
}: SpeakerCardRowProps) {
  const selected = speakers.find((s) => s.speakerId === selectedId) ?? null;

  return (
    <Box w="100%">
      <SimpleGrid columns={columns} spacingX={{ base: 4, md: 8, xl: 12 }}>
        {speakers.map((speaker) => (
          <SpeakerCard
            key={speaker.speakerId}
            speaker={speaker}
            isSelected={speaker.speakerId === selectedId}
            onClick={() =>
              onSelect(
                speaker.speakerId === selectedId ? null : speaker.speakerId
              )
            }
          />
        ))}
      </SimpleGrid>
      <Collapse in={selected !== null} animateOpacity>
        {selected && (
          <Box
            position="relative"
            mt={{ base: 4, md: 8 }}
            mb={{ base: 2, md: 4 }}
            bg={PANEL_BODY}
            borderRadius="16px"
            p={{ base: "16px", md: "28px 40px 28px 28px" }}
          >
            <Box
              bg="white"
              clipPath="polygon(28px 0, 100% 0, 100% 100%, 28px 100%, 0 calc(100% - 28px), 0 28px)"
              border={`2px solid ${"#FAE2EE"}`}
              p={{ base: "20px 20px 20px 40px", md: "28px 48px 28px 60px" }}
              minH={{ base: "160px", md: "220px" }}
            >
              <Text
                fontFamily="'Geist Pixel', sans-serif"
                textTransform="uppercase"
                color={PANEL_BODY}
                fontSize={{ base: "xl", md: "2xl" }}
                mb={1}
              >
                {selected.name}
              </Text>
              {selected.title && (
                <Text
                  fontFamily="Inter, sans-serif"
                  fontWeight={600}
                  color="#B52E74"
                  fontSize={{ base: "sm", md: "md" }}
                  mb={3}
                >
                  {selected.title}
                </Text>
              )}
              <Text
                fontFamily="Inter, sans-serif"
                color="#2A2A2A"
                fontSize={{ base: "sm", md: "md" }}
                whiteSpace="pre-wrap"
              >
                {selected.bio}
              </Text>
            </Box>
            <IconButton
              aria-label="Close speaker details"
              icon={<CloseIcon boxSize="10px" />}
              size="sm"
              position="absolute"
              top={{ base: 1, md: 2 }}
              right={{ base: 1, md: 2 }}
              variant="ghost"
              color="#FDEFBA"
              _hover={{ bg: "rgba(253,239,186,0.15)" }}
              onClick={() => onSelect(null)}
            />
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
