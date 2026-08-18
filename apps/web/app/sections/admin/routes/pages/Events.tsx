import { Heading, Flex, VStack } from '@chakra-ui/react';
import type { Event } from '@app';
import { usePolling } from '@app';
import EventCard, { EventCardSkeleton } from '@app/sections/admin/components/Events/EventCard.tsx';
import AddModal from '@app/sections/admin/components/Events/AddModal.tsx';
import type { ViewMode } from '@app/sections/admin/components/Events/ViewToggle.tsx';
import ViewToggle from '@app/sections/admin/components/Events/ViewToggle.tsx';
import EventCalendar from '@app/sections/admin/components/Events/EventCalendar.tsx';
import { useOutletContext } from 'react-router-dom';
import type { MainContext } from '../Main.tsx';
import { useState } from 'react';

function Events() {
    const { authorized } = useOutletContext<MainContext>();
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const { data: events, update: updateEvents, isLoading } = usePolling('/events', authorized);

    return (
        <VStack spacing={4} align="stretch">
            <Flex justifyContent="center" alignItems="center">
                <Heading size="lg">Events</Heading>
            </Flex>

            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />

            {isLoading ? (
                <Flex w="100%" p={4} flexWrap="wrap" justifyContent="space-evenly" gap={6}>
                    {Array.from({ length: 16 }).map((_, index) => (
                        <EventCardSkeleton key={index} animation={authorized} />
                    ))}
                </Flex>
            ) : viewMode === 'cards' ? (
                <Flex w="100%" p={4} flexWrap="wrap" justifyContent="space-evenly" gap={6}>
                    {events?.map((event: Event) => (
                        <EventCard event={event} updateEvents={updateEvents} key={event.eventId} />
                    ))}
                </Flex>
            ) : (
                <EventCalendar events={events || []} updateEvents={updateEvents} />
            )}

            <AddModal updateEvents={updateEvents} />
        </VStack>
    );
}

export default Events;
