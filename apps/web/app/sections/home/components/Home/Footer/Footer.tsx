import { Flex, Grid, Image, Link, Text, useMediaQuery } from "@chakra-ui/react";

import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const footerLinkIcons: { src: string; alt: string; to: string }[] = [
  {
    src: "email_icon.svg",
    alt: "Email",
    to: "mailto:contact@reflectionsprojections.org"
  },
  {
    src: "linkedin_icon.svg",
    alt: "LinkedIn",
    to: "https://linkedin.com/company/reflections-projections-uiuc"
  },
  {
    src: "facebook_icon.svg",
    alt: "Facebook",
    to: "https://facebook.com/acmrp/"
  },
  {
    src: "tiktok_icon.svg",
    alt: "TikTok",
    to: "https://www.tiktok.com/@uiuc_rp"
  },
  {
    src: "github_icon.svg",
    alt: "GitHub",
    to: "https://github.com/ReflectionsProjections"
  },
  {
    src: "instagram_icon.svg",
    alt: "Instagram",
    to: "https://instagram.com/uiuc_rp/"
  }
]; // there should be <= 6 of these

export const Footer = () => {
  const [isTiny] = useMediaQuery("(max-width: 300px)");

  return (
    <Grid
      w="100%"
      bgGradient="linear(to-b, #0F062D 0%, #7C1493 100%)"
      position="relative"
    >
      {/* content layer; shares the grid cell with the buildings image below so
          the footer is always at least as tall as its content */}
      <Flex
        gridArea="1 / 1"
        w="100%"
        maxW="1500px"
        justifySelf="center"
        alignSelf="end"
        flexDir={{ base: "column-reverse", md: "row" }}
        alignItems={{ base: "center", md: "flex-end" }}
        justifyContent={{ base: "center", md: "space-between" }}
        gap={{ base: 6, md: 0 }}
        px={12}
        py={14}
        zIndex={2}
      >
        {/* left side content */}
        <Flex
          flexDirection="column"
          alignItems={{ base: "center", md: "flex-start" }}
          justifyContent="flex-end"
        >
          <Image
            display={{
              base: "none",
              md: "block"
            }}
            src="/site/footer/2026/2026_footer_logo.svg"
            alt="Reflections | Projections 2026"
            maxH={{ md: "150px", lg: "200px" }}
            mx={8}
            my={16}
          />
          <Text
            color="#FFFFFF80"
            w="100%"
            fontFamily="Inter, sans-serif"
            fontWeight={500}
            fontSize={{ base: "md", md: "lg", lg: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            &copy;2026 by Reflections | Projections
          </Text>
        </Flex>
        {/* right side content */}
        <Flex
          flexDirection="column"
          alignItems={{ base: "center", md: "flex-end" }}
          justifyContent="center"
        >
          <Grid
            maxW="600px"
            templateColumns="1fr 1fr 1fr"
            gridTemplateRows="1fr 1fr"
            columnGap={10}
            rowGap={8}
            p={4}
          >
            {footerLinkIcons.map((item) => (
              <Link
                key={item.src}
                href={item.to}
                w={isTiny ? "40px" : "55px"}
                h={isTiny ? "40px" : "55px"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                target="_blank"
              >
                <Image
                  src={`/site/footer/2026/socials/${item.src}`}
                  alt={item.alt}
                  w="100%"
                  h="100%"
                  transition="transform 0.2s ease, filter 0.2s ease"
                  _hover={{
                    transform: "scale(1.1)",
                    filter: "brightness(0.7)"
                  }}
                />
              </Link>
            ))}
          </Grid>
          <Text
            color="#FFFFFF"
            w="100%"
            fontFamily="Inter, sans-serif"
            fontWeight={500}
            fontSize={{ base: "md", md: "lg" }}
            textAlign={{ base: "center", md: "right" }}
            mt={2}
            mb={8}
            pr={4}
          >
            Download the R|P app!
          </Text>
          <Flex flexDir="row" justifyContent="center" gap={10}>
            <Link
              // href="https://apps.apple.com/us/app/r-p-2025/id6744465190"
              isExternal
              _hover={{ transform: "scale(1.025)" }}
              transition="all 0.3s ease"
            >
              <Image
                src="/site/footer/2026/app_store_bubble.svg"
                alt="Download on the App Store"
                h={{ base: "50px", md: "70px" }}
                w="auto"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                _hover={{
                  filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))"
                }}
              />
            </Link>

            <Link
              // href="https://play.google.com/store/apps/details?id=com.reflectionsprojections&utm_source=na_Med"
              isExternal
              _hover={{ transform: "scale(1.025)" }}
              transition="all 0.3s ease"
            >
              <Image
                src="/site/footer/2026/google_play_bubble.svg"
                alt="Get it on Google Play"
                h={{ base: "50px", md: "70px" }}
                w="auto"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                _hover={{
                  filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.4))"
                }}
              />
            </Link>
          </Flex>
          <ChakraLink
            as={RouterLink}
            to="/app"
            _hover={{ textDecoration: "none" }}
          >
            <Text
              mt={8}
              color="#FFFFFF"
              w="100%"
              fontFamily="Inter, sans-serif"
              fontWeight={500}
              fontSize={{ base: "md", md: "lg" }}
              textAlign={{ base: "center", md: "right" }}
              pr={{ base: 0, md: 4 }}
              textDecoration="underline"
              _hover={{ color: "#FFFFFFB0" }}
            >
              Download the app
            </Text>
          </ChakraLink>
          <ChakraLink
            as={RouterLink}
            to="/profile"
            _hover={{ textDecoration: "none" }}
          >
            <Text
              mt={2}
              color="#FFFFFF"
              w="100%"
              fontFamily="Inter, sans-serif"
              fontWeight={500}
              fontSize={{ base: "md", md: "lg" }}
              textAlign={{ base: "center", md: "right" }}
              pr={{ base: 0, md: 4 }}
              textDecoration="underline"
              _hover={{ color: "#FFFFFFB0" }}
            >
              Go to profile and QR code
            </Text>
          </ChakraLink>
        </Flex>
      </Flex>
      {/* image background content */}
      <Image
        gridArea="1 / 1"
        alignSelf="end"
        display="block"
        pt={20}
        src="/site/footer/2026/footer_buildings.svg"
        alt=""
        w="100%"
        zIndex={1}
      />
    </Grid>
  );
};

export default Footer;
