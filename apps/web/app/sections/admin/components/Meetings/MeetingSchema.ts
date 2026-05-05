import { Config } from '@app/sections/admin/config'
import type { Meeting, CommitteeType } from '@app'
import * as yup from 'yup'

export type MeetingFormValues = Omit<Meeting, 'meetingId'>

export const MeetingFormSchema: yup.Schema<MeetingFormValues> = yup.object({
  committeeType: yup
    .mixed<CommitteeType>()
    .oneOf(Config.COMMITTEE_TYPES)
    .required('Committee is required'),
  startTime: yup.string().required('Start time is required')
})

export const MeetingFormInitialValues: MeetingFormValues = {
  committeeType: 'FULL TEAM',
  startTime: ''
}
