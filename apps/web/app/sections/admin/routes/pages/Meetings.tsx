import { Heading, Flex } from "@chakra-ui/react"
import { usePolling } from "@app"
import AddModal from "@app/sections/admin/components/Meetings/AddModal.tsx"
import MeetingCard, {
    MeetingCardSkeleton,
} from "@app/sections/admin/components/Meetings/MeetingCard.tsx"
import { useOutletContext } from "react-router-dom"
import type { MainContext } from "../Main.tsx"

function Meetings() {
    const { authorized } = useOutletContext<MainContext>()
    const {
        data: meetings,
        update: updateMeetings,
        isLoading,
    } = usePolling("/meetings", authorized)

    return (
        <>
            <Flex justifyContent="center" alignItems="center">
                <Heading size="lg">Meetings</Heading>
            </Flex>
            <br />
            <Flex
                w="100%"
                p={4}
                flexWrap="wrap"
                justifyContent="space-evenly"
                gap={6}
            >
                {isLoading
                    ? Array.from({ length: 16 }).map((_, index) => (
                          <MeetingCardSkeleton
                              key={index}
                              animation={authorized}
                          />
                      ))
                    : meetings?.map((meeting) => (
                          <MeetingCard
                              meeting={meeting}
                              updateMeetings={updateMeetings}
                              key={meeting.meetingId}
                          />
                      ))}
            </Flex>
            <AddModal updateMeetings={updateMeetings} />
        </>
    )
}

export default Meetings
