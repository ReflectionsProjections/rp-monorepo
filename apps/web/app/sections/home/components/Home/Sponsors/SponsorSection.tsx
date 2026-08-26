import { Box, Image, Link, Text } from "@chakra-ui/react";

type SponsorPlacement = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  logoSrc?: string;
  href?: string;
  /** Lit-screen fill behind the logo, for logos that need contrast. */
  screenBg?: string;
  /** Fixed logo height (as % of the screen) so same-tier logos match. */
  logoHeight?: string;
  /** Sponsor confirmed but logo not released yet. */
  tba?: boolean;
};

/**
 * Logo content is deliberately separate from the Figma workstation artwork.
 * Add a logoSrc (SVG or PNG) and href to populate any screen without changing
 * the scene asset.
 */
const SPONSOR_PLACEMENTS: SponsorPlacement[] = [
  {
    id: "screen-top-left",
    label: "Aechelon, a Shield AI company",
    left: 17.55,
    top: 2.18,
    width: 25.7,
    height: 19.98,
    logoSrc: "/site/sponsors/2026/aechelon.png",
    screenBg: "#262626",
    logoHeight: "23%"
  },
  {
    id: "screen-top-right",
    label: "Caterpillar",
    left: 52.06,
    top: 2.18,
    width: 25.7,
    height: 19.98,
    logoSrc: "/site/sponsors/2026/caterpillar.png",
    screenBg: "linear-gradient(180deg, #f7f6f2 0%, #e9e7e0 100%)",
    logoHeight: "23%"
  },
  {
    id: "screen-center-portrait",
    label: "John Deere",
    left: 33.47,
    top: 26.85,
    width: 15.06,
    height: 34.08,
    logoSrc: "/site/sponsors/2026/johndeere.svg",
    screenBg: "linear-gradient(180deg, #f7f6f2 0%, #e9e7e0 100%)"
  },
  {
    id: "screen-right-portrait",
    label: "Pylon",
    left: 51.28,
    top: 38.79,
    width: 15.96,
    height: 27.7,
    logoSrc: "/site/sponsors/2026/pylon.svg",
    screenBg: "linear-gradient(180deg, #f7f6f2 0%, #e9e7e0 100%)"
  },
  {
    id: "screen-center-wide",
    label: "Jane Street",
    left: 40.21,
    top: 71.4,
    width: 27.38,
    height: 22.98,
    logoSrc: "/site/sponsors/2026/janestreet.png"
  }
];

const BRICK_PATTERNS = [
  [1.02, 1.32, 1.12, 1.36, 1.04, 1.2],
  [1.25, 1.08, 1.4, 1.05, 1.26, 1.08],
  [1.1, 1.38, 1.06, 1.28, 1.18, 1.1]
];

const BrickWall = () => (
  <Box
    aria-hidden="true"
    position="absolute"
    inset={0}
    overflow="hidden"
    bg="#1b141f"
  >
    {Array.from({ length: 20 }, (_, rowIndex) => {
      const pattern = BRICK_PATTERNS[rowIndex % BRICK_PATTERNS.length];

      return (
        <Box
          key={rowIndex}
          position="absolute"
          top={{
            base: `${rowIndex * 5.35}%`,
            lg: `${rowIndex * 5.93}%`
          }}
          left={{
            base: rowIndex % 2 === 0 ? "-15%" : "-3%",
            lg: rowIndex % 2 === 0 ? "-8.5%" : "-2.5%"
          }}
          display="flex"
          gap={{ base: "10px", lg: "1.35vw" }}
          h={{ base: "4.15%", lg: "3.98%" }}
          w={{ base: "132%", lg: "118%" }}
        >
          {pattern.map((grow, brickIndex) => (
            <Box
              key={`${rowIndex}-${brickIndex}`}
              flex={`${grow} 0 0`}
              minW={{ base: "72px", lg: "12vw" }}
              borderRadius={{ base: "5px", lg: "8px" }}
              border="1px solid rgba(219, 205, 229, 0.16)"
              bg="linear-gradient(180deg, #50485b 0%, #474050 16%, #474050 84%, #3c3546 100%)"
              boxShadow="inset 0 2px 2px rgba(255,255,255,0.08), 0 2px 0 rgba(5,3,8,0.75)"
            />
          ))}
        </Box>
      );
    })}
  </Box>
);

const SponsorSlot = ({ placement }: { placement: SponsorPlacement }) => {
  const content = placement.logoSrc ? (
    <Image
      src={placement.logoSrc}
      alt={placement.label}
      w={placement.logoHeight ? "auto" : "82%"}
      maxW="90%"
      h={placement.logoHeight ?? "78%"}
      objectFit="contain"
      filter="drop-shadow(0 0 12px rgba(255,255,255,0.28))"
    />
  ) : placement.tba ? (
    <Text
      m={0}
      px="8%"
      color="rgba(252, 248, 251, 0.55)"
      fontFamily="'Geist Pixel', sans-serif"
      fontSize={{
        base: "clamp(10px, 2.6vw, 18px)",
        lg: "clamp(12px, 1.3vw, 22px)"
      }}
      lineHeight="1.4"
      textAlign="center"
      textTransform="uppercase"
      letterSpacing="0.06em"
    >
      To be announced
    </Text>
  ) : (
    <Box
      aria-hidden="true"
      w="100%"
      h="100%"
      bg="radial-gradient(circle at 50% 42%, rgba(18, 27, 42, 0.16), transparent 68%)"
    />
  );

  return (
    <Box
      position="absolute"
      left={`${placement.left}%`}
      top={`${placement.top}%`}
      w={`${placement.width}%`}
      h={`${placement.height}%`}
      zIndex={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      borderRadius="2%"
      bg={placement.screenBg}
      data-sponsor-slot={placement.id}
      aria-label={placement.label}
    >
      {placement.href ? (
        <Link
          href={placement.href}
          isExternal
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ transform: "scale(1.035)" }}
          transition="transform 180ms ease"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </Box>
  );
};

const WorkstationScene = () => (
  <Box
    position="absolute"
    zIndex={3}
    top={{ base: "230px", lg: "26.6%" }}
    left={{ base: "calc(50% + 2vw)", sm: "50%", lg: 0 }}
    transform={{ base: "translateX(-50%)", lg: "none" }}
    w={{ base: "165vw", sm: "100vw", lg: "100%" }}
    aspectRatio="1512 / 1140"
  >
    <Image
      src="/site/sponsors/2026/workstation-v3.png"
      alt=""
      aria-hidden="true"
      position="absolute"
      inset={0}
      w="100%"
      h="100%"
      objectFit="fill"
      pointerEvents="none"
      userSelect="none"
    />

    {SPONSOR_PLACEMENTS.map((placement) => (
      <SponsorSlot key={placement.id} placement={placement} />
    ))}
  </Box>
);

export default function SponsorSection() {
  return (
    <Box
      as="section"
      id="sponsors"
      aria-labelledby="sponsors-heading"
      position="relative"
      w="100%"
      h={{
        base: "calc(230px + 124.4vw)",
        sm: "calc(230px + 75.4vw)",
        lg: "auto"
      }}
      aspectRatio={{ lg: "1512 / 1654" }}
      minH={{ base: "640px", lg: "auto" }}
      overflow="hidden"
      bg="#1b141f"
      isolation="isolate"
    >
      <BrickWall />

      <Box
        aria-hidden="true"
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={2}
        h={{ base: "8%", lg: "7.8%" }}
        bg="linear-gradient(180deg, #252936 0%, #252936 35%, #1d202a 36%, #1d202a 67%, #171a22 68%, #171a22 100%)"
        boxShadow="inset 0 5px 0 rgba(70, 75, 96, 0.28)"
        pointerEvents="none"
      />

      <Image
        src="/site/sponsors/2026/heart.png"
        alt=""
        aria-hidden="true"
        position="absolute"
        zIndex={1}
        top={{ base: "16%", lg: "23.3%" }}
        left={{ base: "-16%", lg: "3.2%" }}
        w={{ base: "54%", lg: "30%" }}
        opacity={0.3}
        mixBlendMode="multiply"
        pointerEvents="none"
      />
      <Image
        src="/site/sponsors/2026/fire.png"
        alt=""
        aria-hidden="true"
        position="absolute"
        zIndex={1}
        top={{ base: "4%", lg: "4.1%" }}
        right={{ base: "-14%", lg: "-1%" }}
        w={{ base: "46%", lg: "25.6%" }}
        opacity={0.33}
        mixBlendMode="multiply"
        pointerEvents="none"
      />
      <Image
        src="/site/sponsors/2026/star.png"
        alt=""
        aria-hidden="true"
        position="absolute"
        zIndex={1}
        top={{ base: "42%", lg: "60.6%" }}
        left={{ base: "-7%", lg: "20.2%" }}
        w={{ base: "42%", lg: "23.7%" }}
        opacity={0.17}
        mixBlendMode="multiply"
        pointerEvents="none"
      />

      <Text
        as="h2"
        id="sponsors-heading"
        position="absolute"
        zIndex={4}
        top={{ base: "140px", lg: "16.1%" }}
        left="50%"
        transform="translateX(-50%)"
        m={0}
        color="#fcf8fb"
        fontFamily="'Geist Pixel', sans-serif"
        fontSize={{
          base: "clamp(28px, 8vw, 38px)",
          lg: "clamp(52px, 6vw, 92px)"
        }}
        fontWeight="400"
        lineHeight="1"
        letterSpacing="-0.015em"
        textAlign="center"
        textShadow="0 4px 0 rgba(20, 14, 26, 0.42)"
      >
        Sponsors
      </Text>

      <WorkstationScene />
    </Box>
  );
}
