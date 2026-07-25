import { FAQS } from "@app/sections/home/constants/faq-questions";
import { Box, Image, VStack } from "@chakra-ui/react";
import { useState } from "react";

import { FAQQuestion } from "./FAQQuestion";

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
      minH={{ base: "900px", md: "auto" }}
      aspectRatio={{ md: "1512 / 1297" }}
      mx="auto"
      overflow="hidden"
      bg="#18111d"
    >
      <Image
        src="/site/faq/faq-bricks.png"
        alt=""
        aria-hidden
        position="absolute"
        top={{ base: 0, md: "2.3%" }}
        insetX={0}
        zIndex={0}
        w="100%"
        h={{ base: "100%", md: "79.7%" }}
        objectFit="cover"
      />

      <Box
        aria-hidden
        position="absolute"
        top={{ base: "12%", md: "8.9%" }}
        left={{ base: "-28%", md: "19%" }}
        zIndex={1}
        w={{ base: "156%", md: "57.7%" }}
        aspectRatio={1}
        borderRadius="full"
        bg="radial-gradient(circle, rgba(157, 102, 151, 0.68) 0%, rgba(112, 69, 108, 0.62) 55%, rgba(59, 36, 63, 0) 72%)"
        filter="blur(3px)"
      />

      <VStack
        position="relative"
        zIndex={2}
        w={{ base: "calc(100% - 32px)", md: "68.05%" }}
        mx="auto"
        pt={{ base: "120px", md: "11.3%" }}
        pb={{ base: "230px", md: "25.8%" }}
        spacing={{ base: 4, md: "20px" }}
      >
        {FAQS.map((faqItem, index) => (
          <FAQQuestion
            key={faqItem.question}
            faqItem={faqItem}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex((current) => (current === index ? null : index))
            }
          />
        ))}
      </VStack>

      <Image
        src="/site/faq/faq-graffiti.png"
        alt=""
        aria-hidden
        position="absolute"
        left={{ base: "-8%", md: "-1%" }}
        bottom={{ base: "20px", md: "1.2%" }}
        zIndex={3}
        w={{ base: "76%", md: "44%" }}
        pointerEvents="none"
      />

      <Image
        src="/site/faq/faq-crown.png"
        alt=""
        aria-hidden
        position="absolute"
        right={{ base: "-12%", md: "-1%" }}
        bottom={{ base: "-28px", md: "-2%" }}
        zIndex={3}
        w={{ base: "50%", md: "27%" }}
        pointerEvents="none"
      />
    </Box>
  );
};
