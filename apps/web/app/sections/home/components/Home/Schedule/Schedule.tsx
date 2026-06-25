import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { Event } from "@app";
import { usePolling } from "@app";
import { useMemo, useState } from "react";

import EventModal from "./EventModal";
import ScheduleDaySelector from "./ScheduleDaySelector";
import ScheduleScreen from "./ScheduleScreen";
import {
  defaultActiveDay,
  groupEventsByDay,
  orderDays
} from "./schedule-utils";

const slideBuildings = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const SECTION_VH = 80;
const MOBILE_SCENE_WIDTH_VW = 165;
const SCENE_HEIGHT_VW = (MOBILE_SCENE_WIDTH_VW * 982) / 1512;
const SCREEN_TOP_GAP_PX = 10;
const SCREEN_BOTTOM_PCT = 34;

const MOBILE_SCREEN_TOP = `calc(${SCENE_HEIGHT_VW}vw - ${SECTION_VH}vh + ${SCREEN_TOP_GAP_PX}px)`;

export default function Schedule() {
  const { data } = usePolling("/events");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events = useMemo(
    () => data ?? [],
    [data]
  );
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);
  const orderedDays = useMemo(() => orderDays(eventsByDay), [eventsByDay]);
  const defaultDay = useMemo(
    () => defaultActiveDay(orderedDays),
    [orderedDays]
  );

  const activeDay =
    selectedDay && orderedDays.includes(selectedDay) ? selectedDay : defaultDay;
  const dayEvents = activeDay ? eventsByDay[activeDay] ?? [] : [];

  return (
    <>
      <Box
        id="schedule"
        position="relative"
        w="100%"
        overflow="hidden"
        bg="#100E0E"
      >
        <Box
          position="relative"
          w="100%"
          mx="auto"
          display="flex"
          justifyContent="center"
          h={{ base: `${SECTION_VH}vh`, md: "auto" }}
          alignItems={{ base: "flex-end", md: "stretch" }}
          bgColor={{ base: "#7F7A98", md: "transparent" }}
          overflow="hidden"
        >
          <Box
            position="relative"
            flexShrink={0}
            w={{ base: `${MOBILE_SCENE_WIDTH_VW}%`, md: "100%" }}
            overflow={{ base: "visible", md: "hidden" }}
            sx={{ aspectRatio: "1512 / 982" }}
            transform={{ base: "translateX(0.3%)", md: "none" }}
          >
            <Box
              aria-hidden
              position="absolute"
              inset={0}
              zIndex={0}
              overflow="hidden"
              sx={{ willChange: "transform" }}
            >
              <Box
                position="absolute"
                inset={0}
                display="flex"
                w="200%"
                animation={`${slideBuildings} 15s linear infinite`}
                sx={{ willChange: "transform" }}
              >
                <Box
                  flex="0 0 50%"
                  h="100%"
                  backgroundImage="url('/site/schedule/buildings.svg')"
                  backgroundSize="100% 100%"
                  backgroundRepeat="no-repeat"
                />
                <Box
                  flex="0 0 50%"
                  h="100%"
                  backgroundImage="url('/site/schedule/buildings.svg')"
                  backgroundSize="100% 100%"
                  backgroundRepeat="no-repeat"
                />
              </Box>
            </Box>

            <Box
              position="absolute"
              inset={0}
              zIndex={1}
              backgroundImage="url('/site/schedule/subway-environment.svg')"
              backgroundSize="100% 100%"
              backgroundRepeat="no-repeat"
              pointerEvents="none"
            />

            <Box
              position="absolute"
              zIndex={2}
              left="20.5%"
              right="21%"
              top={{ base: MOBILE_SCREEN_TOP, md: "5%" }}
              bottom={{ base: `${SCREEN_BOTTOM_PCT}%`, md: "auto" }}
              height={{ base: "auto", md: "61%" }}
            >
              <ScheduleScreen
                events={dayEvents}
                onSelectEvent={setSelectedEvent}
              />
            </Box>

            <Box
              position="absolute"
              zIndex={2}
              left="18.25%"
              right="18%"
              top="68%"
              height="28%"
            >
              <ScheduleDaySelector
                days={orderedDays}
                selectedDay={activeDay}
                onSelectDay={setSelectedDay}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
