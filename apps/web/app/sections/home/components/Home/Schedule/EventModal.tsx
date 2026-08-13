import { EVENT_ICONS } from "@app/sections/home/constants/event-icons";
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from "@chakra-ui/react";
import type { Event } from "@app";
import moment from "moment-timezone";
import { FaAward, FaClock, FaMapPin, FaTag } from "react-icons/fa";
import FoodMenu from "./FoodMenu";
import LinkButtons from "./LinkButtons";

export default function EventModal({
  event,
  onClose
}: {
  event: Event | null;
  onClose: () => void;
}) {
  // Schedule pink accent used throughout the modal.
  const accentColor = "#F52DBC";
  const hasFoodMenu = event?.description?.includes(":food:") || false;
  const hasLinks = event?.description?.includes(":link:") || false;

  let displayDescription = event?.description;
  if (displayDescription) {
    if (hasFoodMenu) {
      displayDescription = displayDescription.split(":food:")[0].trim();
    }
    if (hasLinks) {
      displayDescription = displayDescription.split(":link:")[0].trim();
    }
  }

  return (
    <Modal isOpen={event !== null} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      {event && (
        <ModalContent
          position="relative"
          overflow="hidden"
          mt={{ base: 14, md: "auto" }}
          mx={{ base: 4, md: "auto" }}
          p={{ base: 5, md: 7 }}
          pb={{ base: 8, md: 10 }}
          bgGradient="linear(to-b, #161616, #0a0a0a)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          boxShadow={`0 20px 60px -12px rgba(0,0,0,0.85), 0 0 0 1px ${accentColor}33`}
          color="white"
          borderRadius="2xl"
        >
          <ModalHeader p={0} w="100%" zIndex={1}>
            <Flex align="flex-start" justify="space-between" w="100%" gap={3}>
              <Text
                fontFamily="'Geist Pixel', sans-serif"
                fontSize={{ base: "xl", md: "2xl" }}
                textTransform="uppercase"
                letterSpacing="0.5px"
                as="h2"
                my={0}
              >
                {event.name}
              </Text>
              <CloseButton onClick={onClose} mt={1} />
            </Flex>
          </ModalHeader>

          <Box
            h="4px"
            w="100%"
            mt={4}
            borderRadius="full"
            bg={accentColor}
            boxShadow={`0 0 14px 0 ${accentColor}`}
          />

          <Box mt={5} zIndex={1} position="relative">
            <EventDetails event={event} accentColor={accentColor} />
          </Box>

          {displayDescription && (
            <Text
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.6"
              whiteSpace="pre-wrap"
              fontFamily="Inter, sans-serif"
              fontWeight={550}
              letterSpacing="0.3px"
              color="gray.100"
              mt={5}
            >
              {displayDescription}
            </Text>
          )}

          <Box mt={5}>
            <FoodMenu description={event.description} />
            <LinkButtons description={event.description} />
          </Box>

          <Box
            position="absolute"
            bottom={0}
            left={0}
            w="100%"
            h="6px"
            bg={accentColor}
            boxShadow={`0 0 16px 0 ${accentColor}`}
          />
        </ModalContent>
      )}
    </Modal>
  );
}

function EventDetails({
  event,
  accentColor
}: {
  event: Event;
  accentColor: string;
}) {
  return (
    <Box
      borderRadius="lg"
      p={{ base: 4, md: 5 }}
      w="100%"
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        rowGap={3}
        columnGap={4}
        flexWrap="wrap"
      >
        <DetailItem icon={FaClock} accentColor={accentColor}>
          {moment(event.startTime).tz("America/Chicago").format("h:mma")} –{" "}
          {moment(event.endTime).tz("America/Chicago").format("h:mma")} CT
        </DetailItem>
        <DetailItem icon={FaMapPin} accentColor={accentColor}>
          {event.location || "Siebel CS"}
        </DetailItem>
        <DetailItem
          icon={EVENT_ICONS[event.eventType] ?? FaTag}
          accentColor={accentColor}
        >
          {capitalCase(event.eventType)}
        </DetailItem>
        <DetailItem icon={FaAward} accentColor={accentColor}>
          {event.points} points
        </DetailItem>
      </Flex>
    </Box>
  );
}

function DetailItem({
  icon,
  accentColor,
  children
}: {
  icon: React.ComponentType;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <Flex flex={{ base: "1 1 100%", md: "1 1 45%" }} align="center" minW={0}>
      <Icon as={icon} boxSize={5} mr={2} color={accentColor} flexShrink={0} />
      <Text
        fontSize={{ base: "sm", md: "md" }}
        fontFamily="Inter, sans-serif"
        fontWeight="bold"
        letterSpacing="0.3px"
        my={0}
        noOfLines={1}
      >
        {children}
      </Text>
    </Flex>
  );
}

function capitalCase(text: string) {
  if (text.length === 0) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
