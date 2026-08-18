import { Box, Text } from '@chakra-ui/react';
import type { Speaker } from '@app';
import { useMemo } from 'react';

type SpeakerCardProps = {
    speaker: Speaker;
    isSelected: boolean;
    onClick: () => void;
};

// Colors pulled from the 2026 Figma design (Development Handoff (Website) -> speaker)
const CARD_BODY = '#240131';
const CARD_BODY_SELECTED = '#600B7F';
const CARD_ACCENT = '#B52E74';
const CARD_ACCENT_SELECTED = '#FDEFBA';
const WINDOW_STROKE = '#FAE2EE';

// Card artwork paths exported from Figma (public/site/speakers-2026 holds the
// standalone SVG files; they are inlined here so the accent colors can swap on
// select and so the photo can be clipped to the window shape).
const BODY_PATH =
    'M367.498 402.322H361.856V350.517H361.756V137.003H361.856V91.6682H365.571C369.419 91.6682 372.54 88.5509 372.54 84.7052V55.9157C372.585 55.5396 372.606 55.1583 372.606 54.7716V10.0644C372.606 4.50515 368.096 0 362.537 0H237.166C231.604 0 227.097 4.50515 227.097 10.0644V11.2748H182.168C179.349 11.2748 176.8 12.4348 174.972 14.3021C174.15 14.9324 173.414 15.7031 172.799 16.6063L162.067 32.3253H139.669C139.468 26.9461 135.04 22.6449 129.608 22.6449H10.0689C4.50717 22.6449 0 27.1527 0 32.7093V186.472C0 192.032 4.50717 196.537 10.0689 196.537H22.5253V306.89H10.0689C4.50717 306.89 0 311.398 0 316.955V470.718C0 476.277 4.50717 480.782 10.0689 480.782H23.1056C24.494 484.681 28.2169 487.472 32.5942 487.472H77.7295V487.372H200.343V487.472H262.539V494.207C262.539 499.764 267.047 504.272 272.608 504.272H367.498C373.057 504.272 377.566 499.764 377.566 494.207V412.387C377.566 406.827 373.057 402.322 367.498 402.322ZM334.678 428.609H97.25L49.1549 386.73V130.625L104.145 75.6632H143.398V84.7052C143.398 88.5509 146.516 91.6682 150.364 91.6682H334.678V428.609Z';

const WINDOW_PATH =
    'M286.523 17.0051V353.946H49.0951L1 312.067V55.9623L55.9896 1H95.2426V10.0421C95.2426 13.8877 98.3613 17.0051 102.209 17.0051H286.523Z';

const TAB_TOP_PATH =
    'M104.319 7.41588V18.3543H0V7.41588C0 3.31861 3.32275 0 7.41922 0H96.9003C100.997 0 104.319 3.31861 104.319 7.41588Z';

const BAR_RIGHT_PATH =
    'M26.7145 7.41588V206.098C26.7145 210.192 23.3944 213.514 19.2952 213.514H0V0H19.2952C23.3944 0 26.7145 3.31861 26.7145 7.41588Z';

const TAB_BOTTOM_PATH =
    'M122.613 0V25.6828C122.613 29.7774 119.293 33.0987 115.194 33.0987H7.41921C3.32275 33.0987 0 29.7774 0 25.6828V0H122.613Z';

// Photo window box within the 389x521 card viewBox
const WINDOW_X = 49.42;
const WINDOW_Y = 75.93;
const WINDOW_W = 285.52;
const WINDOW_H = 352.95;

export default function SpeakerCard({ speaker, isSelected, onClick }: SpeakerCardProps) {
    const body = isSelected ? CARD_BODY_SELECTED : CARD_BODY;
    const accent = isSelected ? CARD_ACCENT_SELECTED : CARD_ACCENT;

    const imgUrl = useMemo(() => {
        if (speaker.imgUrl && speaker.imgUrl !== 'http://reflectionsprojections.org') {
            return speaker.imgUrl;
        }
        return `/site/speakers/${speaker.name
            .split(' ')
            .join('_')
            .split('.')
            .join('')
            .toLowerCase()}.png`;
    }, [speaker.imgUrl, speaker.name]);

    const clipId = `speaker-window-${speaker.speakerId}`;

    return (
        <Box
            role="group"
            position="relative"
            w="100%"
            cursor="pointer"
            onClick={onClick}
            transition="transform 0.2s ease, filter 0.2s ease"
            _hover={{ transform: 'translateY(-6px)', filter: 'brightness(1.1)' }}
        >
            <svg
                viewBox="0 0 389 521"
                width="100%"
                style={{ display: 'block', overflow: 'visible' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <clipPath id={clipId}>
                        <path transform={`translate(${WINDOW_X} ${WINDOW_Y})`} d={WINDOW_PATH} />
                    </clipPath>
                </defs>
                {/* Card body */}
                <path
                    transform="translate(0.265 0.265)"
                    d={BODY_PATH}
                    fill={body}
                    style={{ transition: 'fill 0.2s ease' }}
                />
                {/* Photo window backing (stays white until a photo loads over it) */}
                <path
                    transform={`translate(${WINDOW_X} ${WINDOW_Y})`}
                    d={WINDOW_PATH}
                    fill="white"
                    stroke={WINDOW_STROKE}
                    strokeWidth="2"
                    strokeMiterlimit="10"
                />
                {/* Speaker photo, clipped to the window shape */}
                <image
                    href={imgUrl}
                    x={WINDOW_X}
                    y={WINDOW_Y}
                    width={WINDOW_W}
                    height={WINDOW_H}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${clipId})`}
                    onError={(e) => {
                        (e.target as SVGImageElement).style.display = 'none';
                    }}
                />
                {/* Window outline drawn above the photo so the frame stays crisp */}
                <path
                    transform={`translate(${WINDOW_X} ${WINDOW_Y})`}
                    d={WINDOW_PATH}
                    fill="none"
                    stroke={WINDOW_STROKE}
                    strokeWidth="2"
                    strokeMiterlimit="10"
                />
                {/* Accent tabs */}
                <path
                    transform="translate(25.554 4.555)"
                    d={TAB_TOP_PATH}
                    fill={accent}
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    transform="translate(362.02 137.268)"
                    d={BAR_RIGHT_PATH}
                    fill={accent}
                    style={{ transition: 'fill 0.2s ease' }}
                />
                <path
                    transform="translate(77.994 487.636)"
                    d={TAB_BOTTOM_PATH}
                    fill={accent}
                    style={{ transition: 'fill 0.2s ease' }}
                />
            </svg>
            {/* Name plate (HTML so long names can wrap/shrink) */}
            <Box
                position="absolute"
                left="12%"
                right="14%"
                top="85%"
                bottom="6.5%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
            >
                <Text
                    color="white"
                    fontFamily="'Geist Pixel', sans-serif"
                    textTransform="uppercase"
                    textAlign="center"
                    lineHeight="1.15"
                    letterSpacing="0.06em"
                    fontSize="clamp(11px, 1.05vw, 17px)"
                    noOfLines={2}
                >
                    {speaker.name}
                </Text>
            </Box>
        </Box>
    );
}
