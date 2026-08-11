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
};

/**
 * Logo content is deliberately separate from the Figma workstation artwork.
 * Add a logoSrc (SVG or PNG) and href to populate any screen without changing
 * the scene asset.
 */
const SPONSOR_PLACEMENTS: SponsorPlacement[] = [
  {
    id: "screen-top-left",
    label: "Sponsor logo slot 1",
    left: 17.55,
    top: 1.42,
    width: 25.7,
    height: 13.05
  },
  {
    id: "screen-top-right",
    label: "Sponsor logo slot 2",
    left: 52.06,
    top: 4.75,
    width: 25.7,
    height: 13.05
  },
  {
    id: "screen-center-portrait",
    label: "Sponsor logo slot 3",
    left: 33.47,
    top: 17.54,
    width: 15.06,
    height: 22.26
  },
  {
    id: "screen-right-portrait",
    label: "Sponsor logo slot 4",
    left: 51.28,
    top: 25.34,
    width: 15.96,
    height: 18.1
  },
  {
    id: "screen-center-wide",
    label: "Sponsor logo slot 5",
    left: 41.01,
    top: 49.17,
    width: 25.69,
    height: 13.05
  },
  {
    id: "screen-left-lower",
    label: "Sponsor logo slot 6",
    left: 19.58,
    top: 51,
    width: 17.66,
    height: 26.1
  },
  {
    id: "screen-bottom-center",
    label: "Sponsor logo slot 7",
    left: 41.12,
    top: 66.76,
    width: 25.7,
    height: 13.05
  },
  {
    id: "screen-lower-right",
    label: "Sponsor logo slot 8",
    left: 70.04,
    top: 58.28,
    width: 18.72,
    height: 15.3
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
      w="82%"
      h="78%"
      objectFit="contain"
      filter="drop-shadow(0 0 12px rgba(255,255,255,0.28))"
    />
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
    top={{ base: "230px", lg: "19.47%" }}
    left={{ base: "calc(50% + 2vw)", sm: "50%", lg: 0 }}
    transform={{ base: "translateX(-50%)", lg: "none" }}
    w={{ base: "165vw", sm: "100vw", lg: "100%" }}
    aspectRatio="1512 / 1745"
  >
    <Image
      src="/site/sponsors/2026/workstation.png"
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
        base: "calc(230px + 190.4vw)",
        sm: "calc(230px + 115.4vw)",
        lg: "auto"
      }}
      aspectRatio={{ lg: "1512 / 2260" }}
      minH={{ base: "910px", lg: "auto" }}
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
        h={{ base: "8%", lg: "5.2%" }}
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
        top={{ base: "16%", lg: "15.5%" }}
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
        top={{ base: "4%", lg: "2.75%" }}
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
        top={{ base: "42%", lg: "40.2%" }}
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
        top={{ base: "140px", lg: "10.72%" }}
        left="50%"
        transform="translateX(-50%)"
        m={0}
        color="#fcf8fb"
        fontFamily="Ethnocentric, ProRacing, sans-serif"
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
