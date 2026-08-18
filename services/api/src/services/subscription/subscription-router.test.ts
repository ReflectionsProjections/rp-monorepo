import { describe, expect, it } from '@jest/globals';
import {
    getAsAdmin,
    postAsAdmin,
    postAsUser,
    delAsAdmin,
    postAsSuperAdmin,
} from '../../../testing/testingTools';
import { StatusCodes } from 'http-status-codes';
import { SupabaseDB } from '../../database';
import { IncomingSubscription } from './subscription-schema';

const mockSendBulkTemplateEmail = jest.fn().mockResolvedValue({
    success: true,
    successCount: 2,
    failedCount: 0,
    errors: [],
});
const mockSendHTMLEmail = jest.fn().mockResolvedValue(undefined);
jest.mock('../ses/ses-utils', () => ({
    sendBulkTemplateEmail: mockSendBulkTemplateEmail,
    sendHTMLEmail: mockSendHTMLEmail,
    sendTemplateEmail: jest.fn().mockResolvedValue(undefined),
}));

const USER_ID_1 = 'test-er-user-id';
const USER_ID_2 = 'test-user-2';
const INVALID_USER_ID = 'invalid-user-id';
const VALID_mailingList = 'rp_interest';
const EMAIL_1 = 'user1@test.com';
const EMAIL_2 = 'user2@test.com';

const SUBSCRIPTION_1 = {
    userId: USER_ID_1,
    mailingList: VALID_mailingList,
} satisfies IncomingSubscription;
const SUBSCRIPTION_2 = {
    userId: USER_ID_2,
    mailingList: VALID_mailingList,
} satisfies IncomingSubscription;
const SUBSCRIPTION_INVALID_USER_ID = {
    userId: INVALID_USER_ID,
    mailingList: VALID_mailingList,
};

beforeEach(async () => {
    jest.clearAllMocks();

    try {
        await SupabaseDB.AUTH_INFO.insert([
            {
                userId: USER_ID_1,
                email: EMAIL_1,
                authId: 'auth1',
                displayName: 'User 1',
            },
            {
                userId: USER_ID_2,
                email: EMAIL_2,
                authId: 'auth2',
                displayName: 'User 2',
            },
        ]);
    } catch {
        // Ignore errors if data already exists
    }
});

describe('POST /subscription/', () => {
    it('should create a new subscription for a new user', async () => {
        const response = await postAsUser('/subscription/')
            .send(SUBSCRIPTION_1)
            .expect(StatusCodes.CREATED);
        expect(response.body).toEqual(SUBSCRIPTION_1);

        const { data: dbEntry } = await SupabaseDB.MAILING_LISTS.select()
            .eq('listName', VALID_mailingList)
            .eq('email', EMAIL_1)
            .maybeSingle()
            .throwOnError();
        expect(dbEntry).toMatchObject({
            listName: VALID_mailingList,
            email: EMAIL_1,
        });
    }, 50000);

    it('should create a subscription for a different user', async () => {
        const response = await postAsAdmin('/subscription/')
            .send(SUBSCRIPTION_2)
            .expect(StatusCodes.CREATED);
        expect(response.body).toEqual(SUBSCRIPTION_2);

        const { data: dbEntry } = await SupabaseDB.MAILING_LISTS.select()
            .eq('listName', VALID_mailingList)
            .eq('email', EMAIL_2)
            .maybeSingle()
            .throwOnError();
        expect(dbEntry).toMatchObject({
            listName: VALID_mailingList,
            email: EMAIL_2,
        });
    });

    it('should not create duplicate subscriptions', async () => {
        await SupabaseDB.MAILING_LISTS.insert({
            listName: VALID_mailingList,
            email: EMAIL_1,
        }).throwOnError();

        await postAsUser('/subscription/').send(SUBSCRIPTION_1).expect(StatusCodes.CREATED);

        const { data } = await SupabaseDB.MAILING_LISTS.select()
            .eq('listName', VALID_mailingList)
            .eq('email', EMAIL_1)
            .throwOnError();
        expect(data?.length).toBe(1);
    });

    it.each([
        {
            description: 'missing userId',
            payload: { mailingList: VALID_mailingList },
            helper: postAsUser,
        },
        {
            description: 'missing mailingList',
            payload: { userId: USER_ID_1 },
            helper: postAsUser,
        },
        {
            description: 'invalid userId',
            payload: SUBSCRIPTION_INVALID_USER_ID,
            helper: postAsAdmin,
        },
    ])('should return BAD_REQUEST when $description', async ({ payload, helper }) => {
        await helper('/subscription/').send(payload).expect(StatusCodes.BAD_REQUEST);
    });

    it('should ignore extra fields in the payload', async () => {
        const response = await postAsUser('/subscription/')
            .send({ ...SUBSCRIPTION_1, extraField: 'should be ignored' })
            .expect(StatusCodes.CREATED);
        expect(response.body).toEqual(SUBSCRIPTION_1);
    });
});

describe('GET /subscription/', () => {
    it('should return an empty list when no entries exist', async () => {
        const response = await getAsAdmin('/subscription/').expect(StatusCodes.OK);
        expect(response.body).toEqual([]);
    });

    it('should return all mailing list entries', async () => {
        await SupabaseDB.MAILING_LISTS.insert([
            { listName: VALID_mailingList, email: EMAIL_1 },
            { listName: VALID_mailingList, email: EMAIL_2 },
        ]).throwOnError();

        const response = await getAsAdmin('/subscription/').expect(StatusCodes.OK);

        expect(response.body.length).toBe(2);
        expect(response.body).toEqual(
            expect.arrayContaining([
                { listName: VALID_mailingList, email: EMAIL_1 },
                { listName: VALID_mailingList, email: EMAIL_2 },
            ]),
        );
    });
});

describe('POST /subscription/send-email', () => {
    const emailPayload = {
        mailingList: VALID_mailingList,
        subject: 'Test Subject',
        htmlBody: '<p>Hello World</p>',
    };

    beforeEach(async () => {
        await SupabaseDB.MAILING_LISTS.insert([
            { listName: VALID_mailingList, email: EMAIL_1 },
            { listName: VALID_mailingList, email: EMAIL_2 },
        ]).throwOnError();
    });

    it('should send an email to all subscribers of a list', async () => {
        await postAsSuperAdmin('/subscription/send-email')
            .send(emailPayload)
            .expect(StatusCodes.OK);

        expect(mockSendBulkTemplateEmail).toHaveBeenCalledWith(
            expect.anything(),
            expect.arrayContaining(
                [EMAIL_1, EMAIL_2].map((email) => expect.objectContaining({ email })),
            ),
            expect.objectContaining({ subject: 'Test Subject' }),
        );
    });

    it('fails to send an email for non super-admins', async () => {
        const res = await postAsAdmin('/subscription/send-email')
            .send(emailPayload)
            .expect(StatusCodes.FORBIDDEN);

        expect(mockSendBulkTemplateEmail).not.toHaveBeenCalled();
        expect(res.body).toMatchObject({ error: 'Forbidden' });
    });
});

describe('POST /subscription/send-email/single', () => {
    const emailPayload = {
        email: 'ritam@test.com',
        subject: 'Single Email Test',
        htmlBody: '<p>Single Email Body</p>',
    };

    it('should send an email to a single specified email address', async () => {
        const res = await postAsSuperAdmin('/subscription/send-email/single')
            .send(emailPayload)
            .expect(StatusCodes.OK);

        expect(mockSendHTMLEmail).toHaveBeenCalledWith(
            emailPayload.email,
            emailPayload.subject,
            emailPayload.htmlBody,
        );
        expect(res.body).toEqual({
            status: 'success',
            message: 'Email sent successfully',
        });
    });

    it('fails to send for non super-admin', async () => {
        const res = await postAsAdmin('/subscription/send-email/single')
            .send(emailPayload)
            .expect(StatusCodes.FORBIDDEN);

        expect(mockSendHTMLEmail).not.toHaveBeenCalled();
        expect(res.body).toMatchObject({ error: 'Forbidden' });
    });
});

describe('GET /subscription/lists', () => {
    it('should return an empty array when no entries exist', async () => {
        const response = await getAsAdmin('/subscription/lists').expect(StatusCodes.OK);
        expect(response.body).toEqual([]);
    });

    it('should return unique mailing list names', async () => {
        await SupabaseDB.MAILING_LISTS.insert([
            { listName: VALID_mailingList, email: EMAIL_1 },
            { listName: VALID_mailingList, email: EMAIL_2 },
            { listName: 'newsletter', email: EMAIL_1 },
        ]).throwOnError();

        const response = await getAsAdmin('/subscription/lists').expect(StatusCodes.OK);

        expect(response.body).toHaveLength(2);
        expect(response.body).toEqual(expect.arrayContaining([VALID_mailingList, 'newsletter']));
    });
});

describe('GET /subscription/:mailingList', () => {
    it('should return the list of subscriber emails', async () => {
        await SupabaseDB.MAILING_LISTS.insert([
            { listName: VALID_mailingList, email: EMAIL_1 },
            { listName: VALID_mailingList, email: EMAIL_2 },
        ]).throwOnError();

        const response = await getAsAdmin(`/subscription/${VALID_mailingList}`).expect(
            StatusCodes.OK,
        );

        expect(response.body).toEqual(expect.arrayContaining([EMAIL_1, EMAIL_2]));
        expect(response.body.length).toBe(2);
    });

    it('should return 404 for a non-existent mailing list', async () => {
        const response = await getAsAdmin('/subscription/non-existent-list').expect(
            StatusCodes.NOT_FOUND,
        );

        expect(response.body).toEqual({
            error: 'No subscribers found for this mailing list.',
        });
    });
});

describe('GET /subscription/user/:userId', () => {
    it("should return a user's mailing lists", async () => {
        await SupabaseDB.MAILING_LISTS.insert([
            { listName: VALID_mailingList, email: EMAIL_1 },
        ]).throwOnError();

        const response = await getAsAdmin(`/subscription/user/${USER_ID_1}`).expect(StatusCodes.OK);

        expect(response.body).toEqual([VALID_mailingList]);
    });

    it('should return an empty array for a user with no subscriptions', async () => {
        const response = await getAsAdmin(`/subscription/user/${USER_ID_1}`).expect(StatusCodes.OK);

        expect(response.body).toEqual([]);
    });
});

describe('DELETE /subscription/', () => {
    it('should unsubscribe a user from a mailing list', async () => {
        await SupabaseDB.MAILING_LISTS.insert({
            listName: VALID_mailingList,
            email: EMAIL_1,
        }).throwOnError();

        const response = await delAsAdmin('/subscription/')
            .send({ userId: USER_ID_1, mailingList: VALID_mailingList })
            .expect(StatusCodes.OK);

        expect(response.body).toEqual({ status: 'success' });

        const { data } = await SupabaseDB.MAILING_LISTS.select()
            .eq('listName', VALID_mailingList)
            .eq('email', EMAIL_1)
            .maybeSingle()
            .throwOnError();
        expect(data).toBeNull();
    });

    it('should return 404 when subscription not found', async () => {
        const response = await delAsAdmin('/subscription/')
            .send({ userId: USER_ID_1, mailingList: VALID_mailingList })
            .expect(StatusCodes.NOT_FOUND);

        expect(response.body).toEqual({ error: 'Subscription not found.' });
    });
});
