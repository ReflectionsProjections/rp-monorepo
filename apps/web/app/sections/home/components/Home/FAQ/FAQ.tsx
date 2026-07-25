import { FAQS } from "@app/sections/home/constants/faq-questions";
import { Box, HStack, Image } from "@chakra-ui/react";
import { Fragment, useState } from "react";

import { FAQQuestion } from "./FAQQuestion";

const BRICK_WIDTHS = ["78%", "92%", "70%", "84%", "64%"];

type WallBrickProps = {
  index: number;
  side: "left" | "right";
};

const WallBrick = ({ index, side }: WallBrickProps) => (
  <Box
    aria-hidden
    display={{ base: "none", xl: "flex" }}
    alignSelf="center"
    justifyContent={side === "left" ? "flex-start" : "flex-end"}
    w="100%"
    transition="transform 280ms ease"
  >
    <Box
      w={BRICK_WIDTHS[index % BRICK_WIDTHS.length]}
      h="clamp(54px, 5.25vw, 80px)"
      border="2px solid rgba(122, 112, 132, 0.34)"
      borderRadius={side === "left" ? "0 10px 10px 0" : "10px 0 0 10px"}
      bg="#494152"
      boxShadow="inset 0 2px 0 rgba(255, 255, 255, 0.04)"
    />
  </Box>
);

type BrickBandProps = {
  position: "top" | "bottom";
};

const BrickBand = ({ position }: BrickBandProps) => {
  const rows =
    position === "top"
      ? [
          ["7%", "19%", "14%", "22%"],
          ["15%", "24%", "18%", "15%"]
        ]
      : [
          ["12%", "21%", "18%", "16%", "13%"],
          ["18%", "14%", "23%", "17%", "19%"],
          ["11%", "22%", "16%", "20%", "17%"]
        ];

  return (
    <Box
      aria-hidden
      position="absolute"
      insetX={0}
      {...(position === "top" ? { top: 6 } : { bottom: 5 })}
      display={{ base: "none", xl: "block" }}
      zIndex={0}
      pointerEvents="none"
    >
      {rows.map((widths, rowIndex) => (
        <HStack
          key={`${position}-${rowIndex}`}
          justify="space-between"
          spacing="14px"
          mt={rowIndex === 0 ? 0 : "14px"}
          transform={rowIndex % 2 === 0 ? "translateX(-3%)" : "translateX(3%)"}
        >
          {widths.map((width, brickIndex) => (
            <Box
              key={`${width}-${brickIndex}`}
              flexShrink={0}
              w={width}
              h="clamp(52px, 5.1vw, 76px)"
              border="2px solid rgba(122, 112, 132, 0.34)"
              borderRadius="10px"
              bg="#494152"
              boxShadow="inset 0 2px 0 rgba(255, 255, 255, 0.04)"
            />
          ))}
        </HStack>
      ))}
    </Box>
  );
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Box
      as="section"
      id="faq"
      aria-label="Frequently asked questions"
      position="relative"
      w="100%"
      maxW="1512px"
      minH={{ base: "760px", xl: "1297px" }}
      mx="auto"
      overflow="hidden"
      bg="#18111d"
      transition="min-height 280ms ease"
    >
      <BrickBand position="top" />
      <BrickBand position="bottom" />

      <Box
        aria-hidden
        position="absolute"
        top={{ base: "9%", xl: "8.9%" }}
        left={{ base: "-28%", md: "4%", xl: "19%" }}
        zIndex={1}
        w={{ base: "156%", md: "92%", xl: "57.7%" }}
        aspectRatio={1}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(157, 102, 151, 0.68) 0%, rgba(112, 69, 108, 0.62) 55%, rgba(59, 36, 63, 0) 72%)"
        filter="blur(3px)"
      />

      <Box
        position="relative"
        zIndex={2}
        display="grid"
        gridTemplateColumns={{
          base: "minmax(0, 1fr)",
          xl: "minmax(86px, 1fr) minmax(0, min(68vw, 1028px)) minmax(86px, 1fr)"
        }}
        columnGap={{ xl: "20px" }}
        rowGap={{ base: 4, xl: "20px" }}
        w={{ base: "calc(100% - 32px)", xl: "100%" }}
        mx="auto"
        pt={{ base: "132px", md: "140px", xl: "146px" }}
        pb={{ base: "220px", xl: "335px" }}
      >
        {FAQS.map((faqItem, index) => (
          <Fragment key={faqItem.question}>
            <WallBrick index={index} side="left" />
            <FAQQuestion
              index={index}
              faqItem={faqItem}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
            <WallBrick index={index + 2} side="right" />
          </Fragment>
        ))}
      </Box>

      <Image
        src="/site/faq/faq-graffiti.png"
        alt=""
        aria-hidden
        position="absolute"
        left={{ base: "-8%", xl: "-1%" }}
        bottom={{ base: "20px", xl: "1.2%" }}
        zIndex={3}
        w={{ base: "76%", xl: "44%" }}
        pointerEvents="none"
      />

      <Image
        src="/site/faq/faq-crown.png"
        alt=""
        aria-hidden
        position="absolute"
        right={{ base: "-12%", xl: "-1%" }}
        bottom={{ base: "-28px", xl: "-2%" }}
        zIndex={3}
        w={{ base: "50%", xl: "27%" }}
        pointerEvents="none"
      />
    </Box>
  );
};
