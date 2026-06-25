import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { splitDayKey } from "./schedule-utils";

const MotionBox = motion(Box);
const MotionImage = motion(Image);

export default function ScheduleDaySelector({
  days,
  selectedDay,
  onSelectDay
}: {
  days: string[];
  selectedDay: string | null;
  onSelectDay: (date: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const FIRST_ROW_WIDTH = "90%";
  const SECOND_ROW_WIDTH = "100%";

  const FIRST_ROW_HEIGHT = 3;
  const SECOND_ROW_HEIGHT = 2;

  const BULB_TILT_RANGE = 120;
  const BULB_TILT_RANDOM_SCALE = 2;
  const BULB_TILT_RANDOM_SHIFT = 1.25;
  const [bulbRotation, setBulbRotation] = useState(0);
  const handleSelectDay = (date: string) => {
    setBulbRotation(
      Math.round(
        (Math.random() * BULB_TILT_RANDOM_SCALE - BULB_TILT_RANDOM_SHIFT) *
          BULB_TILT_RANGE
      )
    );
    onSelectDay(date);
  };

  return (
    <Flex ref={ref} direction="column" h="100%">
      <Flex
        w={FIRST_ROW_WIDTH}
        mx="auto"
        flex={`${FIRST_ROW_HEIGHT} 1 0`}
        minH={0}
        align="stretch"
        flexWrap="nowrap"
      >
        {days.map((day, index) => (
          <MotionBox
            key={day}
            flex="1 1 0"
            minW={0}
            initial={{ opacity: 0, y: -12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08 * index, ease: "easeOut" }}
          >
            <DayCushion
              day={day}
              selected={selectedDay === day}
              onSelectDay={handleSelectDay}
            />
          </MotionBox>
        ))}
      </Flex>

      <Flex
        w={SECOND_ROW_WIDTH}
        mx="auto"
        flex={`${SECOND_ROW_HEIGHT} 1 0`}
        minH={0}
        align="stretch"
        flexWrap="nowrap"
      >
        {days.map((day, index) => (
          <MotionBox
            key={day}
            flex="1 1 0"
            minW={0}
            initial={{ opacity: 0, y: -12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.08 * index, ease: "easeOut" }}
          >
            <PinCushion
              day={day}
              selected={selectedDay === day}
              rotation={bulbRotation}
              onSelectDay={handleSelectDay}
            />
          </MotionBox>
        ))}
      </Flex>
    </Flex>
  );
}

function DayCushion({
  day,
  selected,
  onSelectDay
}: {
  day: string;
  selected: boolean;
  onSelectDay: (date: string) => void;
}) {
  const { day: label, date } = splitDayKey(day);

  return (
    <Box position="relative" h="100%">
      <Flex
        role="group"
        onClick={() => onSelectDay(day)}
        cursor="pointer"
        h="100%"
        direction="column"
        align="center"
        justify="center"
        px={{ base: 1, md: 3 }}
        textAlign="center"
        transition="transform 0.15s ease, filter 0.2s ease"
        _hover={{ transform: "translateY(-2px)" }}
        filter={!selected ? "brightness(0.95)" : undefined}
      >
        <Text
          fontFamily="Ethnocentric"
          fontStyle="italic"
          fontSize={{ base: "md", sm: "lg", md: "2xl" }}
          lineHeight="1"
          letterSpacing="0.5px"
          noOfLines={1}
          my={0}
          w="100%"
          color={selected ? "#F52DBC" : "white"}
          sx={
            !selected ? { textShadow: "0 2px 4px rgba(0,0,0,0.6)" } : undefined
          }
        >
          {label.toUpperCase()}
        </Text>
        <Text
          fontFamily="Magistral"
          fontSize="xs"
          fontWeight="bold"
          color="whiteAlpha.800"
          mt={1}
          my={0}
        >
          {date}
        </Text>
      </Flex>
    </Box>
  );
}

function PinCushion({
  day,
  selected,
  rotation,
  onSelectDay
}: {
  day: string;
  selected: boolean;
  rotation: number;
  onSelectDay: (date: string) => void;
}) {
  return (
    <Box position="relative" h="100%">
      <Flex
        role="group"
        onClick={() => onSelectDay(day)}
        cursor="pointer"
        w="100%"
        h="100%"
        align="center"
        justify="center"
      >
        {selected && (
          <MotionImage
            key={day}
            src="/site/schedule/bulb.png"
            alt="Light Bulb"
            maxW="100%"
            maxH="100%"
            w="auto"
            h="auto"
            objectFit="cover"
            initial={{ y: "-60%", opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: rotation }}
            transition={{ type: "spring", stiffness: 520, damping: 24 }}
            whileHover={{ y: -8, rotate: rotation }}
          />
        )}
      </Flex>
    </Box>
  );
}
