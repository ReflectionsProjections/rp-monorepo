import {
  Box,
  HStack,
  Icon,
  Image,
  Link,
  Spinner,
  Text,
  useMediaQuery,
  useToast,
  VStack
} from "@chakra-ui/react";
import type { Attendee, RoleObject, TierTypes } from "@app";
import { api, path } from "@app";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { MdArrowBack, MdRefresh } from "react-icons/md";

const tierToName: Record<TierTypes, string> = {
  TIER1: "TIER 0",
  TIER2: "TIER 1",
  TIER3: "TIER 2",
  TIER4: "TIER 3"
};

type FoodWave = "standard" | "priority" | "not-yet" | null;

export function Profile() {
  const toast = useToast();

  const [qr, setQr] = useState<string>("");
  const [roleObject, setRoleObject] = useState<RoleObject | null>(null);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [foodWave, setFoodWave] = useState<FoodWave>(null);

  const [smallWebMode] = useMediaQuery("(max-width: 600px)", {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  });

  const [xsWebMode] = useMediaQuery("(max-width: 400px)");

  const handleLoadQr = async () => {
    const qrCode = await api.get("/attendee/qr");
    setQr(qrCode.data.qrCode);
  };

  const handleLoadAuthData = async () => {
    let role: RoleObject | null = null;
    try {
      role = (await api.get("/auth/info")).data;
      setRoleObject(role);
    } catch {
      toast({
        title: "Error loading authentication data",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    if (!role) {
      toast({
        title: "Error loading authentication data",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    if (role.userId) {
      let newAttendee: Attendee | null = null;
      try {
        newAttendee = (await api.get(path(`/attendee`, {}))).data;
      } catch (error) {
        // The account has no attendee record, but the access token is valid —
        // this is an incomplete registration, not a signed-out visitor. Send
        // them to finish registering rather than back through sign-in.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          window.location.href = "/register";
          return;
        }

        console.error("Failed to fetch attendee data:", error);
        toast({
          title: "Error loading attendee data",
          description: "Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top"
        });
        return;
      }
      setAttendee(newAttendee);

      const now = new Date();
      const todayShort = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "America/Chicago"
      }).format(now);
      const rpStartDate = new Date("2025-09-16T00:00:00-05:00");
      const rpEndDate = new Date("2025-09-20T23:59:59-05:00");

      if (now > rpStartDate && now < rpEndDate) {
        // RP in progress
        const hasPriority =
          newAttendee[`hasPriority${todayShort}` as keyof typeof newAttendee] ||
          false;
        setFoodWave(hasPriority ? "priority" : "standard");
      } else if (now < rpStartDate) {
        // RP has not started
        setFoodWave("not-yet");
      } else {
        // RP is over
        setFoodWave(null);
      }
    }
  };

  useEffect(() => {
    void handleLoadQr();
    void handleLoadAuthData();
  }, []);

  return !smallWebMode ? (
    <VStack
      bgColor="black"
      minH="100vh"
      color="white"
      spacing={0}
      align="stretch"
      bgImage="/site/profile_qr_bg.svg"
      bgSize={"cover"}
      pb={32}
      overflow="hidden"
    >
      <Link
        href={"/"}
        color="blue.300"
        fontFamily="Inter, sans-serif"
        display="flex"
        alignItems="center"
        gap={1}
        cursor="pointer"
        _hover={{
          color: "blue.500"
        }}
        fontSize={"lg"}
        fontWeight={"bold"}
        p={4}
      >
        <Icon as={MdArrowBack} w={5} h={5} />
        Back to main site
      </Link>
      <Box
        mt="30px"
        p={"8px"}
        maxW="650px"
        w="100%"
        mx="auto"
        bgColor="#EEEEEE"
        borderRadius={"16px"}
        transform="rotate(-1.5deg)"
      >
        <Box
          w="100%"
          h="fit-content"
          outline="1px solid #BBBBBB"
          borderRadius="9px"
          p={"12px"}
          display="flex"
          flexDirection="column"
          position="relative"
          gap="4px"
        >
          {/* top row */}
          <HStack justifyContent={"flex-start"} w="100%" gap="36px">
            {/* profile picture */}
            <Box
              display="flex"
              justifyContent={"center"}
              alignItems={"center"}
              w="fit-content"
              h="fit-content"
              pos="relative"
            >
              <Image
                src="/site/profile_image_wrapper.svg"
                w="150px"
                position="relative"
                zIndex="3"
              />
              <Box
                w="120px"
                h="142px"
                pos="absolute"
                zIndex="1"
                bgColor="#BBBBBB"
                // style={{
                //   background:
                //     "linear-gradient(0deg,rgba(36, 1, 49, 1) 0%, rgba(153, 153, 153, 1) 100%);"
                // }}
              >
                <Image
                  src="/site/profile_image_default.svg"
                  width="100%"
                  height="110%"
                  objectFit="cover"
                  objectPosition={"center"}
                />
              </Box>
            </Box>
            {/* attendee info */}
            <HStack
              px="18px"
              py="6px"
              flex={1}
              minWidth={0}
              justifyContent={"space-between"}
              borderRadius="18px"
              borderLeftWidth="8px"
              borderRightWidth="2px"
              borderColor="#049AEB"
            >
              <VStack
                gap={"8px"}
                alignItems={"flex-start"}
                fontFamily="'Geist Pixel', sans-serif"
                minWidth={0}
              >
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  color="gray.800"
                  // for cutting off text
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  width="100%"
                  minWidth={0}
                >
                  {roleObject?.displayName}
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.600"
                  // for cutting off text
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  width="100%"
                  minWidth={0}
                >
                  {roleObject?.email}
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.600"
                  // for cutting off text (just in case)
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  width="100%"
                  minWidth={0}
                >
                  {foodWave === "priority"
                    ? "FOOD WAVE: PRIORITY"
                    : foodWave === "standard"
                      ? "FOOD WAVE: STANDARD"
                      : "ATTENDEE"}
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.600"
                  // for cutting off text (just in case)
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  width="100%"
                  minWidth={0}
                >
                  {attendee?.points ?? 0} PTS TOTAL -{" "}
                  {attendee?.currentTier
                    ? tierToName[attendee.currentTier]
                    : "Not available"}
                </Text>
              </VStack>
              <Image
                position="absolute"
                src="/rp-2026.svg"
                w="40px"
                alignSelf="flex-end"
                m="12px"
                right="30px"
              />
            </HStack>
          </HStack>
          {/* bottom row */}
          <HStack justifyContent={"space-between"} w="100%" gap="24px">
            {/* text */}
            <Box
              display="flex"
              flexDirection={"column"}
              justifyContent={"flex-start"}
              alignItems={"flex-start"}
              alignSelf={"flex-start"}
              pt="24px"
              flex={1}
              pos="relative"
              color="gray.800"
              gap="8px"
            >
              <Text
                fontFamily="Inter, sans-serif"
                fontSize="md"
                fontWeight="500"
              >
                Welcome to R|P 2026! Attend events and activities to earn
                points; exchange them at the front desk for prizes -- attend 2
                events per day to get into the fast lane at dinner! Use this QR
                code to check into events.
              </Text>
              <Text
                fontFamily="Inter, sans-serif"
                fontSize="md"
                display="flex"
                alignItems={"center"}
                gap={1}
                color="blue.300"
                cursor="pointer"
                _hover={{
                  color: "blue.500"
                }}
                fontWeight={"bold"}
                onClick={() => {
                  void handleLoadQr();
                  toast({
                    title: "QR Code Refreshed",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                  });
                }}
              >
                <Icon as={MdRefresh} w={4} h={4} />
                Refresh QR Code
              </Text>
            </Box>
            {/* qr code */}
            <VStack w="220px" h="220px">
              <Box
                p={8}
                bgColor={"#ccc"}
                borderRadius={"8px"}
                w="100%"
                h="100%"
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {qr ? (
                  <QRCodeSVG
                    value={qr}
                    width="100%"
                    height="100%"
                    bgColor="transparent"
                  />
                ) : (
                  <Spinner />
                )}
              </Box>
            </VStack>
          </HStack>
          <Text
            fontFamily="'Geist Pixel', sans-serif"
            fontSize="sm"
            color="gray.800"
            position="absolute"
            bottom="4px"
          >
            {attendee?.userId.toUpperCase()}
          </Text>
        </Box>
      </Box>
    </VStack>
  ) : (
    // MOBILE VIEW --------------------------------------------------------
    <VStack
      bgColor="black"
      minH="100vh"
      color="white"
      spacing={0}
      align="stretch"
      bgImage="/site/profile_qr_bg.svg"
      bgSize={"cover"}
      pb={32}
    >
      <Link
        href={"/"}
        color="blue.300"
        fontFamily="Inter, sans-serif"
        display="flex"
        alignItems="center"
        gap={1}
        cursor="pointer"
        _hover={{
          color: "blue.500"
        }}
        fontSize={"lg"}
        fontWeight={"bold"}
        p={4}
      >
        <Icon as={MdArrowBack} w={5} h={5} />
        Back to main site
      </Link>
      {/* content */}
      <VStack
        mt="30px"
        p="24px"
        w="100%"
        maxW="100%"
        justifyContent={"center"}
        alignItems={"center"}
        overflow={"hidden"}
      >
        {/* profile picture */}
        <Box
          display="flex"
          justifyContent={"center"}
          alignItems={"center"}
          w="fit-content"
          h="fit-content"
          pos="relative"
        >
          <Image
            src="/site/profile_image_wrapper.svg"
            w="150px"
            position="relative"
            zIndex="3"
          />
          <Box
            w="120px"
            h="142px"
            pos="absolute"
            zIndex="1"
            bgColor="#BBBBBB"
            // style={{
            //   background:
            //     "linear-gradient(0deg,rgba(36, 1, 49, 1) 0%, rgba(153, 153, 153, 1) 100%);"
            // }}
          >
            <Image
              src="/site/profile_image_default.svg"
              width="100%"
              height="110%"
              objectFit="cover"
              objectPosition={"center"}
            />
          </Box>
        </Box>
        {/* attendee info */}
        <HStack
          px="18px"
          mx="0px"
          py="6px"
          minWidth={0}
          width="100%"
          justifyContent={"space-between"}
          borderRadius="18px"
          borderLeftWidth="8px"
          borderRightWidth="2px"
          borderColor="#049AEB"
        >
          <VStack
            gap={"8px"}
            alignItems={"flex-start"}
            fontFamily="'Geist Pixel', sans-serif"
            minWidth={0}
            color="gray.100"
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              // for cutting off text (just in case)
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              width="100%"
              minWidth={0}
            >
              {roleObject?.displayName}
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {roleObject?.email}
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {foodWave === "priority"
                ? "FOOD WAVE: PRIORITY"
                : foodWave === "standard"
                  ? "FOOD WAVE: STANDARD"
                  : "ATTENDEE"}
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {attendee?.points ?? 0} PTS TOTAL -{" "}
              {attendee?.currentTier
                ? tierToName[attendee.currentTier]
                : "Not available"}
            </Text>
          </VStack>
          {!xsWebMode && (
            <Image
              position="absolute"
              src="/rp-2026.svg"
              w="40px"
              alignSelf="flex-end"
              m="12px"
              right="30px"
            />
          )}
        </HStack>
        <Box
          display="flex"
          maxW="80%"
          flexDirection={"column"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          pt="24px"
          flex={1}
          pos="relative"
          color="gray.800"
          gap="8px"
        >
          <Text
            fontFamily="Inter, sans-serif"
            fontSize="md"
            fontWeight="500"
            color="gray.100"
          >
            Welcome to R|P 2026! Attend events and activities to earn points;
            exchange them at the front desk for prizes -- attend 2 events per
            day to get into the fast lane at dinner! Use this QR code to check
            into events.
          </Text>
        </Box>
        <br />
        {/* qr code */}
        <VStack w="220px" h="220px">
          <Box
            p={8}
            bgColor={"#ccc"}
            borderRadius={"8px"}
            w="100%"
            h="100%"
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {qr ? (
              <QRCodeSVG
                value={qr}
                width="100%"
                height="100%"
                bgColor="transparent"
              />
            ) : (
              <Spinner />
            )}
          </Box>
        </VStack>
        <Text
          fontFamily="Inter, sans-serif"
          fontSize="md"
          display="flex"
          alignItems={"center"}
          color="blue.300"
          cursor="pointer"
          _hover={{
            color: "blue.500"
          }}
          fontWeight={"bold"}
          onClick={() => {
            void handleLoadQr();
            toast({
              title: "QR Code Refreshed",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top"
            });
          }}
        >
          <Icon as={MdRefresh} w={4} h={4} />
          Refresh QR Code
        </Text>
        <Text
          fontFamily="'Geist Pixel', sans-serif"
          fontSize="sm"
          position="absolute"
          bottom="4px"
          color="gray.100"
        >
          {attendee?.userId.toUpperCase()}
        </Text>
      </VStack>
    </VStack>
  );
}
