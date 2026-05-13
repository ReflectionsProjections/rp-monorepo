import SpeakerCardRow from "@app/sections/home/components/Speakers/SpeakerCardRow";
import type { SpeakerRow } from "@app/sections/home/types/speaker-types";
import { Text, useMediaQuery, VStack } from "@chakra-ui/react";
import type { Speaker } from "@app";
import { useCallback, useEffect, useMemo, useState } from "react";

const COLORS = [
  "#007bff", // blue
  "#e74c3c", // red
  "#f39c12", // orange
  "#1abc9c", // teal
  "#e84393", // pink
  "#2ecc71" // green
];

const SpeakerData: Speaker[] = [
  {
    speakerId: "fe4f5f5c-e8f0-4055-b656-579490723078",
    name: "Juan Pablo Hourcade",
    title: "Professor, The University of Iowa",
    bio: "Juan Pablo Hourcade is a Professor at The University of Iowa's Department of Computer Science and Director of the Interdisciplinary Graduate Program in Informatics. His main area of research is Human-Computer Interaction, with a focus on the design, implementation, evaluation, and ethics of technologies that support creativity, collaboration, well-being, healthy development, and information access for a variety of users, including children and older adults. He conducts research with his students at the HawCHI Lab. Dr. Hourcade is the author of Child-Computer Interaction, the first comprehensive book on the topic, and has held various leadership roles in his research community. He is in the Editorial Board of Interacting with Computers and the International Journal of Child-Computer Interaction. In 2022, he was named ACM Distinguished Speaker.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "7fbe4b19-ff36-4c19-819c-bba0c41ba50f",
    name: "Michael Schrenk",
    title: "Publisher, Mepso Media",
    bio: "Michael Schrenk develops Autonomous Bots and Competitive Intelligence Campaigns for a global client base.  He's written several books on the topic, but is perhaps best known for developing a bot that autonomously purchased tens of millions of dollars in underpriced vehicles.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "88f1977b-1b23-4050-bc12-d281a1b516ee",
    name: "Ben Grosser",
    title: "Professor, University of Illinois Urbana-Champaign",
    bio: "Ben Grosser investigates how platform interfaces—from social media to AI chatbots—shape human behavior, desire, and culture. Through tactics such as software recomposition, interface reduction, and radical reimagination, his artworks expose software’s hidden politics and propose alternatives that restore user agency. His work has been exhibited at Centre Pompidou (Paris), Somerset House (London), ZKM (Karlsruhe), SXSW (Austin), and the Japan Media Arts Festival (Tokyo), and has appeared in The New York Times, The New Yorker, Wired, The Atlantic, The Guardian, Le Monde, and Der Spiegel. Grosser’s projects are regularly cited in books on the cultural effects of technology, including The Age of Surveillance Capitalism, The Metainterface, and Investigative Aesthetics. He is Professor of New Media at the University of Illinois Urbana–Champaign and a Faculty Associate at Harvard’s Berkman Klein Center for Internet and Society.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "8a2103b1-e28f-42d9-b998-e6fe9dd8ffec",
    name: "Shubha Jagannatha",
    title: "Startup Founder, Figment",
    bio: "Shubha Jagannatha is a Bay Area-based startup founder and creative technologist. Her startup, Figment, develops playful creative tools for storytelling and world building. Before Figment, she spent three years at Pixar as a Technical Director & Lead on five animated films (Turning Red, Lightyear, Elemental, Elio, and Hoppers). She has her B.S. and M.Eng degrees in Electrical Engineering and Computer Sciences from UC Berkeley.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "d3ebf3f2-fcbd-462a-8375-a4bb46e157aa",
    name: "Josh Antonuccio",
    title: "Director, School of Media Arts and Studies",
    bio: "Josh Antonuccio is the Director of the School of Media Arts & Studies and an Associate Professor in Music Production and Recording Industry at Ohio University. He has spent over 2 decades in the music industry as an artist, producer, musician, audio specialist, technology adventurist, and studio owner. He is a Grammy-Voting member of The Recording Academy, an ASCAP-affiliated songwriter, and an AES member. He is the faculty director of the student-run record label Brick City Records and serves as the advisor for OHIO Women in Music Industry.\\n\\nHe created and now directs the annual Music Industry Summit, the largest annual music industry conference in the Midwest. The conference enters its 8th year in 2026 and has welcomed scores of artists, and music industry leaders to Ohio University. Past artist keynotes have included Earl Sweatshirt, Caamp, Jason Isbell, Phoebe Bridgers, Michelle Zauner, DJ Premier, Killer Mike, mxmtoon, Chuck D, St. Vincent, FINNEAS, and Saba. \\n\\nHis current research extends into artificial intelligence and its impact on music production and distribution, being interviewed on the topic across news outlets including The Associated Press, NBC News and Teen Vogue.\\n",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "584912b0-0de2-410d-8df3-f25c8abf084c",
    name: "Lionel P. Robert Jr.",
    title: "Professor of Information and Robotics, Univ. of Michigan",
    bio: 'He is a Professor of Information and Robotics at the University of Michigan, with joint appointments in the School of Information and the College of Engineering’s Robotics Department. Currently, he oversees the Michigan Autonomous Vehicle Research Intergroup Collaboration (MAVRIC). Recognized as an ACM Distinguished Member, an AIS Distinguished Member "Cum Laude," and a Senior Member of INFORMS and IEEE. His research has been funded by the AAA Foundation, Automotive Research Center/U.S. Army, Army Research Laboratory, Toyota Research Institute, MCity, Lieberthal-Rogel Center for Chinese Studies, and the National Science Foundation. His work has also been featured in media outlets such as ABC, CNN, CNBC, NPR, Inc., The New York Times, and the Associated Press.',
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "97d874ac-5825-4543-98e8-ea563c9a1fb4",
    name: "Eva Galperin",
    title: "Director of Cybersecurity, Electronic Frontier Foundation",
    bio: "Eva Galperin is EFF's Director of Cybersecurity, where she has worked since 2007. Her work is primarily focused on providing privacy and security for vulnerable populations around the world. To that end, she has applied the combination of her political science and technical background to everything from organizing EFF's Tor Relay Challenge, to writing privacy and security training materials, and publishing research on malware in Syria, Vietnam, Lebanon, and Kazakhstan. Since 2018, she has worked on addressing the digital privacy and security needs of survivors or domestic abuse. She is also a co-founder of the Coalition Against Stalkerware.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "08f645f5-8164-44c9-a6c5-bbcd1a969a84",
    name: "Mehdi Bahrami",
    title: "Principal Researcher, Fujitsu Research of America",
    bio: "Dr. Mehdi Bahrami is a Senior Member of both ACM and IEEE. He is a Principal Researcher at Fujitsu Research of America in California. With expertise in Generative AI, Applied Machine Learning at scale, his work focuses on advancing cutting-edge AI Agent technologies. He holds a Ph.D. in Computer Science from the University of California, Merced. Dr. Bahrami has over 15 years of software industry experience, complemented by more than five years of academic engagement, all toward contributing to AutoML, Natural Language Processing, and Generative AI.\\nDr. Bahrami is a recipient of several awards, such as the 2024 IEEE Outstanding Engineer Award for his “pioneering contributions to generative AI and API automation”, the 2024 Fujitsu Research Group Head's Award for “achievements in AI trust technologies”, and the 2016 ACM ICN Best Demo Award. He has also received prestigious fellowships and leadership awards. Dr. Bahrami is the author of over 30 publications and the inventor of more than 34 granted U.S. patents. His work has been featured in prominent media outlets, including MIT Technology Review. Dr. Bahrami served as an AI panelist for the National Science Foundation’s Small Business Innovation Research (NSF SBIR) program.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "1052e4b7-7bc2-4bd4-99c7-74c7d967c76f",
    name: "Claire Liang",
    title: "Postdoctoral Fellow, Massachusetts Institute of Technology (MIT)",
    bio: "Claire Liang is an algorithmic HRI researcher who focuses on extracting social information from physical space. She focuses on a human-centric approach to robot system development while drawing from theoretical foundations rooted in topological methods. She is currently a CSAIL Postdoctoral Fellow in the Interactive Robotics Group at the Massachusetts Institute of Technology and an alum of the Verifiable Robotics Research Group at Cornell University.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "1d67c285-abc9-404f-bb4a-494f03bcfb51",
    name: "Eliot Chang",
    title: "Cofounder (Product + Design), Figment",
    bio: "Eliot is a Chicago suburb (Schaumburg!) raised creative technologist focusing on social software and world building. His startup Figment aims to create the tools that allow creators to bring their worlds to life, and the platform to let anyone explore them.\nBefore Figment, he was at Fortnite working on their growth and social teams as a product designer. He has his B.S. and M.S. in mathematics, economics, and computer science from the University of Southern California.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "e21235cd-5f60-47ff-b777-7c5fff0c81f2",
    name: "Joana Moll",
    title: "Professor, Academy of Media Arts Cologne",
    bio: "She is a Barcelona/Berlin based artist and researcher. Her work critically explores the way techno-capitalist narratives affect the alphabetization of machines, humans and ecosystems. Her main research topics include data materiality, surveillance, interfaces, and the increasing militarization of civil society through digital media. She has presented her work in renowned institutions, museums, universities and festivals around the world such as Venice Biennale, Art Basel, MAXXI, MMOMA, MACBA, Laboral, CCCB, ZKM, Bozar, The Natural History Museum in Berlin, Austrian Museum of Applied Arts (MAK), Ars Electronica, HeK Basel, Photographer’s Gallery, Korean Cultural Foundation Center, Chronus Art Center, New York University, Georgetown University, Berkman Klein Center at Harvard University, Rutgers University, University of Cambridge, Goldsmiths University of London, University of Illinois, Concordia University, Universitat Autònoma de Barcelona, ETH Zürich, École d'Art d'Aix en Provence, British Computer Society, The New School, CPDP 2019, Transmediale, FILE and ISEA among many others.\n\nHer work has been featured extensively on international media including The New York Times, The Financial Times, Der Spiegel, National Geographic, Quartz, Wired, Vice, The New Inquiry, Netzpolitk, El Mundo, O’Globo, La Reppublica, Fast Company, CBC, NBC or MIT Press.\n\nShe is the co-founder of the Critical Interface Politics Research Group at HANGAR [Barcelona], and has collaborated with organizations including the Mozilla Foundation and the Barcelona Supercomputing Center, one of Europe’s leading high-performance computing institutions. She's been a research fellow at BBVA Foundation, a fellow at The Weizenbaum Institute and Disruption Network Institute in Berlin, and an artistic researcher in residence at the Critical Media Lab at HGK in Basel. Currently, she is a professor for Networks in the Art Department at KHM in Cologne, and a visiting lecturer at Escola Elisava in Barcelona.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "cda23525-4e33-4982-a2d2-abdf5a56394e",
    name: "Sue Harnett",
    title: "Founder and CEO, Rewriting the Code",
    bio: "Sue is a proven company founder, entrepreneur and healthcare leader. Prior to Rewriting the Code, Sue launched, developed and successfully sold a novel e-commerce and technology business in the collegiate and professional sports industry. Sue also created the strategic vision and operational infrastructure for a multi-specialty physician organization within Duke University Health System, a nationally acclaimed academic health system. She is an expert at recognizing the viability of business opportunities, testing the market to refine the proposed model and executing the go-to-market strategy. She brings a strong ability to create passionate teams, establish focused and positive work cultures and lead disruptive business models to bring innovative change. Sue hopes to positively impact the young college women of Rewriting the Code by supporting the students with the necessary skills, confidence and applied work opportunities to develop the next generation of technology leaders.\nSue received her Masters in Healthcare Administration from Duke University in 1992 and an AB in Economics from Duke University in 1990. Sue earned a full scholarship to Duke where she received All-America honors prior to playing professional basketball in Kortrijk, Belgium.",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  },
  {
    speakerId: "6625be29-374d-4f4e-aae2-52706e04fec3",
    name: "Abdu Alawini",
    title: "Teaching Associate Professor, UIUC",
    bio: "Abdussalam Alawini is a Teaching Associate Professor of Computer Science at the University of Illinois at Urbana-Champaign. He earned his B.S. in Computer Science from the University of Tripoli in 2002 and spent over six years in industry as a database administrator, software developer, and IT manager. He later earned two master’s degrees—one in Computer Science and another in Engineering and Technology Management—and a Ph.D. in Computer Science from Portland State University (2016), where his research focused on helping scientists manage and analyze file-based datasets. He then completed a postdoctoral fellowship at the University of Pennsylvania, developing data citation and provenance systems. His current interests include databases and computing education, with a focus on using AI to enhance teaching and learning. ",
    eventTitle: "N/A",
    eventDescription: "N/A",
    imgUrl: "http://reflectionsprojections.org"
  }
];

// Now we have six rows (as in your design), each with up to three speakers
// Colors go in the order: blue, red, orange, teal, pink, green
export default function Speakers() {
  const [isMediumScreen] = useMediaQuery("(min-width: 960px)");
  const [isSmallScreen] = useMediaQuery("(min-width: 768px)");
  const [isMicroScreen] = useMediaQuery("(min-width: 360px)");
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  // Define the desired speaker order by first name
  const speakerOrder = useMemo(
    () => [
      "Sue",
      "Abdu",
      "Eva",
      "Josh",
      "Michael",
      "Mehdi",
      "Ben",
      "Claire",
      "Eliot",
      "Lionel",
      "Shubha",
      "Karlyn",
      "Juan",
      "Joana"
    ],
    []
  );

  const handleLoadSpeakers = useCallback(() => {
    try {
      const speakersData = SpeakerData.map((speakerData) => {
        return {
          ...speakerData
        };
      });

      // Sort speakers according to the specified order by first name
      const sortedSpeakers = speakerOrder
        .map((firstName) =>
          speakersData.find(
            (speaker) => speaker.name.split(" ")[0] === firstName
          )
        )
        .filter(Boolean) as Speaker[];

      // Add any speakers not in the order list at the end
      const remainingSpeakers = speakersData.filter(
        (speaker) => !speakerOrder.includes(speaker.name.split(" ")[0])
      );

      setSpeakers([...sortedSpeakers, ...remainingSpeakers]);
    } catch {
      console.error("Failed to load speakers");
    }
  }, [speakerOrder]);

  useEffect(() => {
    void handleLoadSpeakers();
  }, []);

  const speakerRows = useMemo<SpeakerRow[]>(() => {
    const maxPerRow = isMediumScreen
      ? 3
      : isSmallScreen
        ? 2
        : isMicroScreen
          ? 2
          : 1;

    return speakers.reduce<SpeakerRow[]>((rows, speaker: Speaker, idx) => {
      const rowIndex = Math.floor(idx / maxPerRow);
      if (!rows[rowIndex]) {
        rows[rowIndex] = {
          speakers: [],
          color: COLORS[rowIndex % COLORS.length]
        };
      }
      rows[rowIndex].speakers.push(speaker);
      return rows;
    }, []);
  }, [isMediumScreen, isSmallScreen, isMicroScreen, speakers]);

  return (
    <VStack
      gap={0}
      bgColor="#1F1F1F"
      pt={36}
      pb={48}
      bgImage="/site/backdrop.svg"
      minH="100dvh"
      bgSize="cover"
    >
      <Text
        fontSize={{ base: "5xl", sm: "5xl", md: "6xl" }}
        fontFamily="ProRacing"
        color="white"
      >
        Speakers
      </Text>
      <Text
        fontSize={{ base: "7xl", sm: "6xl", md: "8xl" }}
        fontFamily="ProRacing"
        color="white"
        my={0}
        mt={{ base: -5, md: -10 }}
      >
        2025
      </Text>
      <br />
      {speakerRows.map((row, index) => (
        <SpeakerCardRow key={`speaker-${index}`} row={row} />
      ))}
    </VStack>
  );
}
