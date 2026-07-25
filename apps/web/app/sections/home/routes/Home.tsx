import { FAQ } from "@app/sections/home/components/Home/FAQ/FAQ";
import Footer from "@app/sections/home/components/Home/Footer/Footer";
import Schedule from "@app/sections/home/components/Home/Schedule/Schedule";
import SponsorSection from "@app/sections/home/components/Home/Sponsors/SponsorSection";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import landingAboutBg from "../assets/Landing/LandingAbout.svg";
import Description from "../components/Home/Description/Description";
import Landing from "../components/Home/Landing/Landing";

const Home = () => {
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
    <Box bg="#100E0E">
      <Box position="relative" overflow="hidden" bg="#0d0b1a">
        <Box
          as="img"
          src={landingAboutBg}
          alt=""
          aria-hidden="true"
          display={{ base: "none", xl: "block" }}
          position="absolute"
          inset={0}
          zIndex={0}
          w="100%"
          h="auto"
          pointerEvents="none"
        />
        <Landing />
        <Description />
      </Box>
      <Schedule />
      <FAQ />
      <SponsorSection />
      <Footer />
    </Box>
  );
};

export default Home;
