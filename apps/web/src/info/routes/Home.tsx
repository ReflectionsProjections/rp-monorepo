// src/routes/Home.tsx
import { ExhibitSection } from "@info/components/Home/ExhibitSection";
import { Footer } from "@info/components/Footer";
import { Header } from "@info/components/Home/Header";
import { SponsorSection } from "@info/components/Home/SponsorSection";
import { Stats } from "@info/components/Home/Stats";
import { TeamSection } from "@info/components/Home/TeamSection";

import { Box, Divider } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    const section = document.getElementById(hash.slice(1));
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [hash]);

  return (
    <>
      <Box id="home">
        <Header />
      </Box>
      <Box id="exhibits">
        <ExhibitSection />
      </Box>
      <Box id="stats">
        <Stats />
      </Box>
      <Box id="team">
        <TeamSection />
      </Box>
      <Divider borderColor="blackAlpha.900" borderWidth="1px" />{" "}
      <Box id="sponsors">
        <SponsorSection />
      </Box>
      <Box id="footer">
        <Footer />
      </Box>
    </>
  );
};
