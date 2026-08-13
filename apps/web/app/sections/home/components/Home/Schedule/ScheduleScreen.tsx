import { Box, Text, VStack } from "@chakra-ui/react";
import type { Event } from "@app";
import EventCard from "./EventCard";

export default function ScheduleScreen({
  events,
  onSelectEvent
}: {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}) {
  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      borderRadius={{ base: "2xl", md: "xl" }}
      p={{ base: "8px", md: "6px" }}
      bgColor="#2a2a2a"
      border="2px solid"
      borderColor="blackAlpha.700"
      boxShadow="0 12px 12px -12px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)"
    >
      <Box
        flex="1"
        minH={0}
        display="flex"
        flexDirection="column"
        borderRadius={{ base: "2xl", md: "xl" }}
        bg="#0a0a0a"
        p={{ base: 2.5, md: 1.5 }}
        boxShadow="inset 0 0 60px rgba(0,0,0,0.9)"
      >
        <VStack
          align="stretch"
          spacing={{ base: 2.5, md: 3 }}
          flex="1"
          minH={0}
          overflowY="auto"
          pr={1}
          sx={{
            scrollbarWidth: "thin",
            scrollbarColor: "#F52DBC transparent",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-button": {
              display: "none",
              height: 0,
              width: 0
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#F52DBC",
              borderRadius: "3px"
            },
            "&::-webkit-scrollbar-track": { background: "transparent" }
          }}
        >
          {events.length === 0 ? (
            <Box
              flex="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontFamily="'Geist Pixel', sans-serif"
                color="gray.500"
                textAlign="center"
                my={0}
              >
                No events scheduled yet.
              </Text>
            </Box>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onClick={onSelectEvent}
              />
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
}
