import { Box, Button, Flex, Text, VStack, Wrap, WrapItem, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import type { UploadFile } from '@app';
import { CYAN, FAINT, MUTED, PINK, TEXT_COLOR, TITLE_FONT, WizardInput } from './ui';

const pillStyles = {
    px: '17px',
    py: '11px',
    h: 'auto',
    borderRadius: 'full',
    border: '1px solid',
    borderColor: 'rgba(252,242,246,0.14)',
    bg: 'rgba(252,242,246,0.045)',
    color: TEXT_COLOR,
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1',
    whiteSpace: 'normal' as const,
    textAlign: 'center' as const,
    _hover: { borderColor: 'rgba(252,242,246,0.35)' },
};

const selectedPillStyles = {
    borderColor: PINK,
    bg: 'rgba(239,83,158,0.2)',
    boxShadow: '0 0 16px rgba(239,83,158,0.4)',
    _hover: { borderColor: PINK },
};

type PillGroupProps = {
    options: string[];
    value: string | string[];
    onChange: (next: string | string[]) => void;
    multi?: boolean;
};

/** The pill-button choice control used for every enum question. */
export const PillGroup = ({ options, value, onChange, multi }: PillGroupProps) => (
    <Wrap spacing="9px">
        {options.map((option) => {
            const selected = multi ? (value as string[]).includes(option) : value === option;

            const toggle = () => {
                if (multi) {
                    const current = value as string[];
                    onChange(
                        selected ? current.filter((item) => item !== option) : [...current, option],
                    );
                } else {
                    onChange(selected ? '' : option);
                }
            };

            return (
                <WrapItem key={option}>
                    <Button
                        type="button"
                        onClick={toggle}
                        aria-pressed={selected}
                        {...pillStyles}
                        {...(selected ? selectedPillStyles : {})}
                    >
                        {option}
                    </Button>
                </WrapItem>
            );
        })}
    </Wrap>
);

type OtherInputProps = {
    visible: boolean;
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
};

/** Free-text input revealed when the matching "Other" pill is selected. */
export const OtherInput = ({
    visible,
    value,
    onChange,
    placeholder = 'Please specify',
}: OtherInputProps) => {
    if (!visible) {
        return null;
    }
    return (
        <WizardInput
            mt="11px"
            value={value}
            maxLength={50}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
        />
    );
};

const chipStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    px: '13px',
    py: '8px',
    h: 'auto',
    borderRadius: 'full',
    border: '1px solid',
    borderColor: 'rgba(239,83,158,0.5)',
    bg: 'rgba(239,83,158,0.16)',
    color: TEXT_COLOR,
    fontSize: '13px',
    fontWeight: '400',
    whiteSpace: 'normal' as const,
    textAlign: 'left' as const,
    _hover: { bg: 'rgba(239,83,158,0.28)' },
};

type ComboBoxProps = {
    placeholder: string;
    options: string[];
    selected: string[];
    onChange: (next: string[]) => void;
    maxSelections?: number;
};

/**
 * Search-as-you-type picker for the long option lists (schools, majors,
 * minors). Selections render as removable chips below the input; pass
 * maxSelections 1 for single-choice fields.
 */
export const ComboBox = ({
    placeholder,
    options,
    selected,
    onChange,
    maxSelections,
}: ComboBoxProps) => {
    const [query, setQuery] = useState('');

    const trimmed = query.trim().toLowerCase();
    const results = trimmed
        ? options
              .filter(
                  (option) => option.toLowerCase().includes(trimmed) && !selected.includes(option),
              )
              .slice(0, 40)
        : [];

    const pick = (option: string) => {
        if (maxSelections === 1) {
            onChange([option]);
        } else if (maxSelections === undefined || selected.length < maxSelections) {
            onChange([...selected, option]);
        }
        setQuery('');
    };

    return (
        <Box>
            <Box position="relative">
                <WizardInput
                    value={query}
                    placeholder={placeholder}
                    onChange={(event) => setQuery(event.target.value)}
                />
                {results.length > 0 && (
                    <Box
                        position="absolute"
                        left={0}
                        right={0}
                        top="calc(100% + 8px)"
                        zIndex={8}
                        maxH="236px"
                        overflowY="auto"
                        borderRadius="11px"
                        border="1px solid"
                        borderColor="rgba(252,242,246,0.16)"
                        bg="#180A3A"
                        boxShadow="0 22px 50px rgba(6,2,20,0.65)"
                    >
                        {results.map((option) => (
                            <Box
                                key={option}
                                as="button"
                                type="button"
                                display="block"
                                w="100%"
                                textAlign="left"
                                px="16px"
                                py="12px"
                                borderBottom="1px solid"
                                borderColor="rgba(252,242,246,0.07)"
                                color={TEXT_COLOR}
                                fontSize="14px"
                                _hover={{ bg: 'rgba(239,83,158,0.16)' }}
                                onClick={() => pick(option)}
                            >
                                {option}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
            {selected.length > 0 && (
                <Wrap spacing="8px" mt="11px">
                    {selected.map((option) => (
                        <WrapItem key={option}>
                            <Button
                                type="button"
                                aria-label={`Remove ${option}`}
                                onClick={() => onChange(selected.filter((item) => item !== option))}
                                {...chipStyles}
                            >
                                {option}
                                <Box as="span" color="rgba(252,242,246,0.6)" fontSize="15px">
                                    ×
                                </Box>
                            </Button>
                        </WrapItem>
                    ))}
                </Wrap>
            )}
        </Box>
    );
};

type FlagCardProps = {
    title: string;
    description: string;
    active: boolean;
    onToggle: () => void;
};

/** The PuzzleBang / MechMania interest toggle card. */
export const FlagCard = ({ title, description, active, onToggle }: FlagCardProps) => (
    <VStack
        as="button"
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        align="flex-start"
        spacing="7px"
        px="20px"
        py="18px"
        borderRadius="13px"
        border="1px solid"
        borderColor={active ? CYAN : 'rgba(252,242,246,0.14)'}
        bg={active ? 'rgba(92,225,230,0.13)' : 'rgba(252,242,246,0.04)'}
        boxShadow={active ? '0 0 20px rgba(92,225,230,0.35)' : 'none'}
        color={TEXT_COLOR}
        textAlign="left"
        cursor="pointer"
        transition="all 0.15s ease"
        _hover={{ borderColor: active ? CYAN : 'rgba(252,242,246,0.35)' }}
    >
        <Text fontFamily={TITLE_FONT} fontSize="12.5px">
            {title}
        </Text>
        <Text fontSize="13px" color={MUTED} lineHeight="1.5">
            {description}
        </Text>
    </VStack>
);

const MAX_RESUME_BYTES = 6 * 1024 * 1024;
const RESUME_EXTENSIONS = ['.pdf', '.docx'];

type FileDropProps = {
    value: UploadFile | null;
    onChange: (next: UploadFile | null) => void;
};

/** Drag-and-drop / browse resume picker matching the API's 6 MB PDF limit. */
export const FileDrop = ({ value, onChange }: FileDropProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const toast = useToast();

    const acceptFile = (file: File | undefined) => {
        setDragging(false);
        if (!file) {
            return;
        }
        const name = file.name.toLowerCase();
        if (!RESUME_EXTENSIONS.some((extension) => name.endsWith(extension))) {
            toast({ title: 'Please upload a PDF or DOCX file', status: 'error' });
            return;
        }
        if (file.size > MAX_RESUME_BYTES) {
            toast({ title: 'Resume must be 6 MB or smaller', status: 'error' });
            return;
        }
        onChange({
            name: file.name,
            file,
            open: () => {
                window.open(URL.createObjectURL(file));
                return Promise.resolve();
            },
        });
    };

    if (value) {
        const sizeLabel = value.file
            ? `${(value.file.size / 1048576).toFixed(1)} MB`
            : 'uploaded previously';

        return (
            <Flex
                align="center"
                gap="14px"
                px="18px"
                py="16px"
                borderRadius="13px"
                border="1px solid"
                borderColor="rgba(92,225,230,0.35)"
                bg="rgba(92,225,230,0.08)"
            >
                <Flex
                    w="38px"
                    h="46px"
                    flex="none"
                    borderRadius="5px"
                    border="1px solid"
                    borderColor="rgba(92,225,230,0.5)"
                    bg="rgba(15,6,45,0.5)"
                    align="center"
                    justify="center"
                    fontSize="9.5px"
                    letterSpacing="0.05em"
                    color={CYAN}
                >
                    {value.name.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF'}
                </Flex>
                <VStack flex={1} align="flex-start" spacing="4px" minW={0}>
                    <Text
                        as="button"
                        type="button"
                        onClick={() => void value.open()}
                        fontSize="14.5px"
                        color={TEXT_COLOR}
                        maxW="100%"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        textDecoration="underline"
                        textUnderlineOffset="3px"
                        cursor="pointer"
                    >
                        {value.name}
                    </Text>
                    <Text fontSize="12.5px" color="rgba(252,242,246,0.45)">
                        {sizeLabel}
                    </Text>
                </VStack>
                <Button
                    type="button"
                    onClick={() => {
                        onChange(null);
                        inputRef.current?.click();
                    }}
                    flex="none"
                    px="14px"
                    py="8px"
                    h="auto"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="rgba(252,242,246,0.2)"
                    bg="transparent"
                    color="rgba(252,242,246,0.7)"
                    fontSize="12.5px"
                    fontWeight="400"
                    _hover={{ bg: 'rgba(252,242,246,0.08)' }}
                >
                    Replace
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={RESUME_EXTENSIONS.join(',')}
                    style={{ display: 'none' }}
                    onChange={(event) => acceptFile(event.target.files?.[0])}
                />
            </Flex>
        );
    }

    return (
        <VStack
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    inputRef.current?.click();
                }
            }}
            onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                acceptFile(event.dataTransfer.files[0]);
            }}
            spacing="8px"
            px="24px"
            py="34px"
            borderRadius="13px"
            border="1.5px dashed"
            borderColor={dragging ? PINK : 'rgba(252,242,246,0.24)'}
            bg={dragging ? 'rgba(239,83,158,0.12)' : 'rgba(15,6,45,0.4)'}
            cursor="pointer"
            textAlign="center"
        >
            <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(252,242,246,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
            >
                <path d="M12 16V4" />
                <path d="M7.5 8.5L12 4l4.5 4.5" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
            </svg>
            <Text fontSize="14.5px" color={TEXT_COLOR}>
                Drop your resume here, or{' '}
                <Box as="span" color={PINK}>
                    browse
                </Box>
            </Text>
            <Text fontSize="12.5px" color={FAINT}>
                PDF or DOCX · max 6 MB
            </Text>
            <input
                ref={inputRef}
                type="file"
                accept={RESUME_EXTENSIONS.join(',')}
                style={{ display: 'none' }}
                onChange={(event) => acceptFile(event.target.files?.[0])}
            />
        </VStack>
    );
};

const LINK_PLACEHOLDERS = [
    'https://linkedin.com/in/username',
    'https://github.com/username',
    'Portfolio or personal site',
];

/**
 * Pasted links usually come without a scheme ("linkedin.com/in/…"), which the
 * URL validator rejects — quietly add https:// instead of surfacing an error.
 */
const normalizeLink = (raw: string) => {
    const trimmed = raw.trim();
    return trimmed === '' || /^([a-z][a-z0-9+.-]*:)?\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
};

type LinksInputProps = {
    value: string[];
    onChange: (next: string[]) => void;
    error?: string | (string | undefined)[];
};

/**
 * Three fixed link slots. Rows keep their position locally while typing; the
 * Formik value only ever holds the non-empty entries, which is what the API
 * schema (an array of up to 3 URLs) expects.
 */
export const LinksInput = ({ value, onChange, error }: LinksInputProps) => {
    const [slots, setSlots] = useState<string[]>(() => [
        value[0] ?? '',
        value[1] ?? '',
        value[2] ?? '',
    ]);

    const update = (index: number, next: string) => {
        const updated = slots.map((slot, i) => (i === index ? next : slot));
        setSlots(updated);
        onChange(updated.map((slot) => slot.trim()).filter((slot) => slot !== ''));
    };

    // The Formik value (and so yup's error array) holds only the non-empty
    // slots, so a slot's error sits at its position among the non-empty ones.
    const errorFor = (index: number): string | undefined => {
        if (!Array.isArray(error) || slots[index].trim() === '') {
            return undefined;
        }
        const filteredIndex = slots.slice(0, index).filter((slot) => slot.trim() !== '').length;
        const message: unknown = error[filteredIndex];
        return typeof message === 'string' ? message : undefined;
    };

    return (
        <VStack spacing="10px" align="stretch">
            {slots.map((slot, index) => (
                <Box key={index}>
                    <WizardInput
                        value={slot}
                        maxLength={50}
                        placeholder={LINK_PLACEHOLDERS[index]}
                        onChange={(event) => update(index, event.target.value)}
                        onBlur={() => update(index, normalizeLink(slot))}
                    />
                    {errorFor(index) !== undefined && (
                        <Text fontSize="12.5px" color="#FFB4D1" mt="8px" role="alert">
                            {errorFor(index)}
                        </Text>
                    )}
                </Box>
            ))}
            {typeof error === 'string' && (
                <Text fontSize="12.5px" color="#FFB4D1" role="alert">
                    {error}
                </Text>
            )}
        </VStack>
    );
};
