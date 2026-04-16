import { ICON_COLOR_TO_COLOR } from "@app/sections/dashboard/constants/colors";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import type { IconColor, LeaderboardEntry } from "@app";
import { api, IconColors } from "@app";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import useUpdateAnimationLoop, {
  DRAW_CARS_IN_CANVAS
} from "../hooks/LeaderboardDraw";

const TOP_CARS_NUMBER = 10;
const ROAD_SRC = "/dashboard/road.png";
const ROAD_SIDING_SRC = "/dashboard/road-side.png";
const CAR_SVG_SRC = "/dashboard/car.svg";
const ICON_SVG_SRC = "/dashboard/icon.svg";

const svgToDataUrl = (svg: string, color?: string) => {
  const content = color ? svg.replace(/currentColor/g, color) : svg;
  return `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
};

const createBrowserImage = () => new window.Image();

export default function Leaderboard({
  trackPercent
}: {
  trackPercent: number;
}) {
  const [leaderboard, setLeaderboard] = useState<
    LeaderboardEntry[] | undefined
  >(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [carImages, setCarImages] = useState<
    Record<IconColor, HTMLImageElement> | undefined
  >(undefined);
  const [roadImage, setRoadImage] = useState<HTMLImageElement | undefined>(
    undefined
  );
  const [roadSidingImage, setRoadSidingImage] = useState<
    HTMLImageElement | undefined
  >(undefined);
  const [carSvgMarkup, setCarSvgMarkup] = useState<string>();
  const [iconSvgMarkup, setIconSvgMarkup] = useState<string>();
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  useUpdateAnimationLoop({
    entryRefs,
    canvasRef,
    trackPercent,
    carImages,
    roadImage,
    roadSidingImage,
    leaderboard
  });

  useEffect(() => {
    const date = new Date();
    // First try to get daily leaderboard
    api
      .get("/leaderboard/daily", {
        params: {
          // Cursed day format requirement - why is this not just unix time???
          day: `${date.getFullYear()}-${date.getMonth().toString().padStart(2, "0")}-${date.getDay().toString().padStart(2, "0")}`,
          n: TOP_CARS_NUMBER
        }
      })
      .then((response) => {
        // If there's results currently, then use that
        if (response.data.leaderboard.length > 0) {
          setLeaderboard(response.data.leaderboard.slice(0, TOP_CARS_NUMBER));
        } else {
          // Otherwise, show global leaderboard
          api
            .get("/leaderboard/global", {
              params: {
                n: TOP_CARS_NUMBER
              }
            })
            .then((response) => {
              setLeaderboard(
                response.data.leaderboard.slice(0, TOP_CARS_NUMBER)
              );
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  // Preload images for each color
  const loadImages = useCallback(async () => {
    if (!carSvgMarkup) return;
    const loadedEntries = await Promise.all(
      Object.values(IconColors).map(async (color: IconColor) => {
        return new Promise<[IconColor, HTMLImageElement]>((resolve, reject) => {
          const img = createBrowserImage();
          img.src = svgToDataUrl(carSvgMarkup, ICON_COLOR_TO_COLOR[color]);

          img.onload = () => resolve([color, img]);
          img.onerror = reject;
        });
      })
    );
    // Convert array of [color, image] tuples into an object
    const images = Object.fromEntries(loadedEntries) as Record<
      IconColor,
      HTMLImageElement
    >;

    setCarImages(images);
  }, [carSvgMarkup]);

  useEffect(() => {
    if (!DRAW_CARS_IN_CANVAS) return;
    loadImages().catch(console.error);
  }, [loadImages]);

  useEffect(() => {
    const image = createBrowserImage();
    image.src = ROAD_SRC;
    image.onload = () => {
      setRoadImage(image);
    };
    const image2 = createBrowserImage();
    image2.src = ROAD_SIDING_SRC;
    image2.onload = () => {
      setRoadSidingImage(image2);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(CAR_SVG_SRC).then((response) => response.text()),
      fetch(ICON_SVG_SRC).then((response) => response.text())
    ])
      .then(([carSvg, iconSvg]) => {
        setCarSvgMarkup(carSvg);
        setIconSvgMarkup(iconSvg);
      })
      .catch(console.error);
  }, []);

  return (
    <Flex flexDirection={"column"} height={"100%"} maxHeight={"100%"}>
      <Flex
        position={"relative"}
        minHeight={"0"}
        flexGrow={"1"}
        overflow={"hidden"}
      >
        <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
        <Box position="absolute" top={0} left={0} right={0} bottom={0}>
          {leaderboard &&
            leaderboard.map((entry, i) => {
              return (
                <LeaderboardEntryDisplay
                  ref={(element) => (entryRefs.current[i] = element)}
                  key={i}
                  entry={entry}
                  carSvgMarkup={carSvgMarkup}
                  iconSvgMarkup={iconSvgMarkup}
                />
              );
            })}
        </Box>
      </Flex>
    </Flex>
  );
}

const LeaderboardEntryDisplay = forwardRef<
  HTMLDivElement,
  {
    entry: LeaderboardEntry;
    carSvgMarkup?: string;
    iconSvgMarkup?: string;
  }
>(function LeaderboardEntryDisplay(
  { entry, carSvgMarkup, iconSvgMarkup },
  ref
) {
  const carSrc = carSvgMarkup
    ? svgToDataUrl(carSvgMarkup, ICON_COLOR_TO_COLOR[entry.icon])
    : undefined;

  return (
    <Box ref={ref}>
      {!DRAW_CARS_IN_CANVAS && carSrc && (
        <Box
          position={"absolute"}
          left={"var(--drawX)"}
          top={"var(--drawY)"}
          width={"var(--width)"}
          height={"var(--height)"}
          transform={"translate(-50%, -50%) rotate(var(--drawAngle))"}
        >
          <Image src={carSrc} width={"100%"} height={"100%"} />
        </Box>
      )}
      <LeaderboardScorecard entry={entry} iconSvgMarkup={iconSvgMarkup} />
    </Box>
  );
});

function LeaderboardScorecard({
  entry: { rank, displayName, points, icon },
  iconSvgMarkup
}: {
  entry: LeaderboardEntry;
  iconSvgMarkup?: string;
}) {
  const iconSrc = iconSvgMarkup
    ? svgToDataUrl(iconSvgMarkup, ICON_COLOR_TO_COLOR[icon])
    : undefined;
  let placePostfix = "th";
  if (rank % 10 == 1 && (rank < 10 || rank > 20)) {
    placePostfix = "st";
  }
  if (rank % 10 == 2 && (rank < 10 || rank > 20)) {
    placePostfix = "nd";
  }
  if (rank % 10 == 3 && (rank < 10 || rank > 20)) {
    placePostfix = "rd";
  }

  // const stagerOffset = i % 2 == 0 ? pos.width * 0.3 : -pos.width * 0.3;
  // const carOffset = stagerOffset + 0.6 * pos.width; // Increased offset for better spacing

  return (
    <Box
      position={"absolute"}
      transform={"translate(0,-50%)"}
      backgroundColor={"#0000008c"}
      width={"max-content"}
      padding={"0.5vh"}
      borderRadius={"1vh"}
      transition={"opacity 0.5s"}
      left={"var(--scorecardX)"}
      top={"var(--scorecardY)"}
      opacity={"var(--scorecardOpacity)"}
    >
      <Flex
        border={`0.2vh solid ${ICON_COLOR_TO_COLOR[icon]}`}
        borderRadius={"0.8vh"}
        padding={"0.5vh"}
        paddingX="0.9vh"
        alignItems={"center"}
      >
        <Text
          marginRight={"0.5vh"}
          fontFamily={"Magistral"}
          fontWeight={"bold"}
          letterSpacing={"0.1vh"}
          fontSize={"2vh"}
        >
          {rank}
          <small>{placePostfix}</small>
        </Text>
        {iconSrc && (
          <Image src={iconSrc} width={"4vh"} height={"4vh"} mr={"0.5vh"} />
        )}
        <Flex flexDirection={"column"}>
          <Text fontWeight={"black"} fontFamily={"Magistral"} fontSize={"2vh"}>
            {displayName}
          </Text>
          <Text fontFamily={"Magistral"} fontSize={"1.5vh"} fontWeight="bold">
            {points} PTS
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
