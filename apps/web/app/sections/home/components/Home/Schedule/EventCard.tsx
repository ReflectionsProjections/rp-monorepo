import { Box, Flex, Text } from "@chakra-ui/react";
import type { Event } from "@app";
import { formatCardTime } from "./schedule-utils";

export default function EventCard({
  event,
  onClick
}: {
  event: Event;
  onClick: (event: Event) => void;
}) {
  return (
    <Flex
      as="button"
      type="button"
      position="relative"
      onClick={() => onClick(event)}
      aria-label={`${event.name} – view details`}
      cursor="pointer"
      textAlign="left"
      w="100%"
      align="stretch"
      overflow="hidden"
      borderRadius="lg"
      bgColor="#181818"
      border="1px solid"
      borderColor="whiteAlpha.200"
      minH={{ base: "64px", md: "76px" }}
      transition="transform 0.15s ease, box-shadow 0.15s ease"
      _hover={{
        transform: "translateX(4px)",
        borderColor: "#F52DBC"
      }}
      _focusVisible={{
        outline: "2px solid #F52DBC",
        outlineOffset: "2px"
      }}
    >
      <Box
        position="absolute"
        top={0}
        bottom={0}
        right="6px"
        width={{ base: "38%", md: "32%" }}
        pointerEvents="none"
        opacity={0.6}
        backgroundImage="repeating-linear-gradient(115deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 14px, transparent 14px, transparent 34px)"
        sx={{
          maskImage: "linear-gradient(to right, transparent, black 55%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 55%)"
        }}
      />

      <Flex
        direction="column"
        justify="center"
        gap={0.5}
        px={{ base: 4, md: 6 }}
        py={{ base: 3, md: 3 }}
        flex={1}
        minW={0}
        zIndex={1}
      >
        <Text
          fontFamily="Ethnocentric"
          fontSize={{ base: "md", md: "md" }}
          color="white"
          textTransform="uppercase"
          letterSpacing="0.5px"
          noOfLines={1}
          my={0}
        >
          {event.name}
        </Text>
        <Flex
          gap={{ base: 2, md: 4 }}
          align="baseline"
          flexWrap="nowrap"
          rowGap={0}
          minW={0}
        >
          <Text
            fontFamily="inter"
            fontSize={{ base: "xs", md: "xs" }}
            color="gray.400"
            fontWeight="bold"
            my={0}
            noOfLines={1}
            minW={0}
            flexShrink={1}
          >
            {event.location || "Siebel CS"}
          </Text>
          <Text
            fontFamily="inter"
            fontSize={{ base: "xs", md: "xs" }}
            color="gray.500"
            my={0}
            whiteSpace="nowrap"
            flexShrink={0}
          >
            {formatCardTime(event.startTime, event.endTime)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
