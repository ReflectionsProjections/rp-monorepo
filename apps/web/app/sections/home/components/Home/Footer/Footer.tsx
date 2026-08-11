import { Flex, Grid, Image, Link, Text, useMediaQuery } from "@chakra-ui/react";

const footerLinkIcons: { src: string; to: string }[] = [
  { src: "email_icon.svg", to: "mailto:contact@reflectionsprojections.org" },
  {
    src: "linkedin_icon.svg",
    to: "https://linkedin.com/company/reflections-projections-uiuc"
  },
  { src: "facebook_icon.svg", to: "https://facebook.com/acmrp/" },

  { src: "tiktok_icon.svg", to: "https://www.tiktok.com/@uiuc_rp" },
  { src: "github_icon.svg", to: "https://github.com/ReflectionsProjections" },
  { src: "instagram_icon.svg", to: "https://instagram.com/uiuc_rp/" }
]; // there should be <= 6 of these

export const Footer = () => {
  const [isTiny] = useMediaQuery("(max-width: 300px)");

  return (
    <Flex
      w="100%"
      h="fit-content"
      flexDir="column"
      bgGradient="linear(to-b, #0F062D 0%, #7C1493 100%)"
      alignItems="center"
      position="relative"
    >
      <Flex
        w="100%"
        maxW="1500px"
        h="inherit"
        flexDir="row"
        alignItems="flex-end"
        justifyContent={{ base: "center", md: "space-between" }}
        px={12}
        py={14}
        zIndex={2}
        position="absolute"
        bottom={0}
      >
        {/* left side content */}
        <Flex
          flexDirection="column"
          h="inherit"
          alignItems="flex-start"
          justifyContent="flex-end"
          zIndex={2}
        >
          <Image
            display={{
              base: "none",
              md: "block"
            }}
            src="/site/footer/2026_footer_logo.svg"
            maxH={{ md: "150px", lg: "200px" }}
            mx={8}
            my={16}
          />
          <Text
            color="#FFFFFF57"
            w="100%"
            fontFamily="Inter"
            fontSize={{ base: "md", md: "lg", lg: "xl" }}
            textAlign={{ base: "center", md: "left" }}
          >
            &copy;2026 by Reflections | Projections
          </Text>
        </Flex>
        {/* right side content */}
        <Flex
          flexDirection="column"
          h="inherit"
          alignItems="flex-end"
          justifyContent="center"
          zIndex={2}
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
                  src={`/site/footer/socials/${item.src}`}
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
            fontFamily="Inter"
            fontSize={{ base: "md", md: "lg" }}
            textAlign={{ base: "center", md: "right" }}
            letterSpacing="wider"
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
                src="/site/footer/app_store_bubble.svg"
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
                src="/site/footer/google_play_bubble.svg"
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
        </Flex>
      </Flex>
      {/* image background content */}
      <Image
        display="block"
        position="relative"
        bottom={0}
        pt={20}
        src="/site/footer/footer_buildings.svg"
        w="100%"
        zIndex={1}
      />
    </Flex>
  );
};

export default Footer;
