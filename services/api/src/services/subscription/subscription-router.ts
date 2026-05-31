import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import {
    SubscriptionValidator,
    CreateMailingListValidator,
} from "./subscription-schema";
import { SupabaseDB } from "../../database";
import cors from "cors";
import RoleChecker from "../../middleware/role-checker";
import { Role } from "../auth/auth-models";
import { sendHTMLEmail, sendBulkTemplateEmail } from "../ses/ses-utils";
import { Templates } from "../../config";

const subscriptionRouter = Router();

// Create a new subscription
subscriptionRouter.post("/", cors(), async (req, res) => {
    // Validate the incoming user subscription
    const subscriptionData = SubscriptionValidator.parse(req.body);

    const { userId, mailingList } = subscriptionData;

    // Check if the user exists
    const { data: user } = await SupabaseDB.AUTH_INFO.select("userId")
        .eq("userId", userId)
        .maybeSingle()
        .throwOnError();

    if (!user) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "User not found." });
    }

    // Check if this specific subscription already exists
    const { data: existingSubscription } =
        await SupabaseDB.SUBSCRIPTIONS.select("userId, mailingList")
            .eq("userId", userId)
            .eq("mailingList", mailingList)
            .maybeSingle()
            .throwOnError();

    if (!existingSubscription) {
        // Create the subscription if it doesn't exist
        await SupabaseDB.SUBSCRIPTIONS.insert({
            userId: userId,
            mailingList: mailingList,
        }).throwOnError();
    }

    return res.status(StatusCodes.CREATED).json(subscriptionData);
});

/**
 * @swagger
 * /subscription/lists:
 *   post:
 *     summary: Create a mailing list from a list of emails
 *     description: |
 *       Creates a named mailing list and adds the provided email addresses to it.
 *       Emails do not need to correspond to registered user accounts.
 *       Duplicate entries are skipped (upsert behaviour).
 *
 *       **Required roles: SUPER_ADMIN**
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMailingListValidator'
 *     responses:
 *       201:
 *         description: Mailing list created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionSuccessResponse'
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.post(
    "/lists",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { listName, emails } = CreateMailingListValidator.parse(req.body);

        const rows = emails.map((email) => ({ listName, email }));

        await SupabaseDB.MAILING_LISTS.upsert(rows, {
            onConflict: "listName,email",
            ignoreDuplicates: true,
        }).throwOnError();

        return res.status(StatusCodes.CREATED).json({ status: "success" });
    }
);

/**
 * @swagger
 * /subscription/:
 *   get:
 *     summary: Get all subscriptions
 *     description: |
 *       Returns every subscription record in the database.
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of all subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionValidator'
 *     security:
 *       - bearerAuth: []
 */
// Get a list of all subscriptions - envisioning that admins can use this as dropdown to choose who to send emails to
subscriptionRouter.get(
    "/",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { data: subscriptions } =
            await SupabaseDB.SUBSCRIPTIONS.select("*").throwOnError();

        return res.status(StatusCodes.OK).json(subscriptions);
    }
);

/**
 * @swagger
 * /subscription/lists:
 *   get:
 *     summary: Get all unique mailing list names
 *     description: |
 *       Returns a deduplicated list of every mailing list that has at least
 *       one subscriber.
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of unique mailing list names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["rp_interest", "attendees"]
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/lists",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { data: subscriptions } =
            await SupabaseDB.SUBSCRIPTIONS.select("mailingList").throwOnError();

        const uniqueMailingLists = [
            ...new Set(subscriptions?.map((sub) => sub.mailingList) || []),
        ];

        return res.status(StatusCodes.OK).json(uniqueMailingLists);
    }
);

/**
 * @swagger
 * /subscription/external-lists:
 *   get:
 *     summary: Get all external mailing list names
 *     description: |
 *       Returns the names of all mailing lists created via the external
 *       mailing list endpoint (not tied to user accounts).
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of external mailing list names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["2026_Staff", "sponsors_2025"]
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/external-lists",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { data: lists } =
            await SupabaseDB.MAILING_LISTS.select("listName").throwOnError();

        const uniqueListNames = [
            ...new Set(lists?.map((row) => row.listName) || []),
        ];

        return res.status(StatusCodes.OK).json(uniqueListNames);
    }
);

/**
 * @swagger
 * /subscription/send-email:
 *   post:
 *     summary: Send an email to a mailing list
 *     description: |
 *       Sends an HTML email to all subscribers of the given mailing list via
 *       AWS SES. BCC is used so recipients cannot see each other's addresses.
 *
 *       **Required roles: SUPER_ADMIN**
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendEmailValidator'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionSuccessResponse'
 *       404:
 *         description: No subscribers found for this mailing list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "No subscribers found for this mailing list."
 *     security:
 *       - bearerAuth: []
 */
// Send an email to a mailing list
// API body: {String} mailingList The list to send the email to, {String} subject The subject line of the email, {String} htmlBody The HTML content of the email.
subscriptionRouter.post(
    "/send-email",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { mailingList, subject, htmlBody } = req.body;

        // Check external mailing lists first
        const { data: externalEntries } = await SupabaseDB.MAILING_LISTS.select(
            "email"
        )
            .eq("listName", mailingList)
            .throwOnError();

        if (externalEntries && externalEntries.length > 0) {
            const emailAddresses = externalEntries.map((row) => row.email);
            const result = await sendBulkTemplateEmail(
                Templates.RP_EMAILS,
                emailAddresses.map((email) => ({ email })),
                { subject, body: htmlBody }
            );
            return res.status(StatusCodes.OK).send(result);
        }

        // Fall back to subscriptions table
        const { data: subscriptions } = await SupabaseDB.SUBSCRIPTIONS.select(
            "userId"
        )
            .eq("mailingList", mailingList)
            .throwOnError();

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: "No subscribers found for this mailing list.",
            });
        }

        // need to batch to avoid URL length limits
        const userIds = subscriptions.map((sub) => sub.userId);
        const BATCH_SIZE = 100;
        const emailAddresses: string[] = [];

        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
            const batch = userIds.slice(i, i + BATCH_SIZE);
            const { data: users } = await SupabaseDB.AUTH_INFO.select("email")
                .in("userId", batch)
                .throwOnError();

            const batchEmails = users?.map((user) => user.email) || [];
            emailAddresses.push(...batchEmails);
        }

        const result = await sendBulkTemplateEmail(
            Templates.RP_EMAILS,
            emailAddresses.map((email) => ({ email })),
            { subject, body: htmlBody }
        );

        return res.status(StatusCodes.OK).send(result);
    }
);

// Send an email to a list of arbitrary emails (testing only, no accounts required)
// API body: {String[]} emails, {String} subject, {String} htmlBody
subscriptionRouter.post(
    "/send-email/bulk",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { emails, subject, htmlBody } = req.body;

        const result = await sendBulkTemplateEmail(
            Templates.RP_EMAILS,
            emails.map((email: string) => ({
                email,
                data: { subject, body: htmlBody },
            })),
            { subject, body: htmlBody }
        );

        return res.status(StatusCodes.OK).send(result);
    }
);

/**
 * @swagger
 * /subscription/send-email/single:
 *   post:
 *     summary: Send an email to a single address
 *     description: |
 *       Sends an HTML email to one specific email address via AWS SES.
 *
 *       **Required roles: SUPER_ADMIN**
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendEmailSingleValidator'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionSuccessResponse'
 *     security:
 *       - bearerAuth: []
 */
// Send an email to a specific person
// API body: {String} email (the singular email to send to), {String} subject : The subject line of the email, {String} htmlBody : The HTML content of the email.
subscriptionRouter.post(
    "/send-email/single",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { email, subject, htmlBody } = req.body;

        await sendHTMLEmail(email, subject, htmlBody);

        return res.status(StatusCodes.OK).send({ status: "success" });
    }
);

/**
 * @swagger
 * /subscription/{mailingList}:
 *   get:
 *     summary: Get email addresses for a mailing list
 *     description: |
 *       Returns the email addresses of all users subscribed to the given
 *       mailing list.
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     parameters:
 *       - name: mailingList
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: rp_interest
 *     responses:
 *       200:
 *         description: List of subscriber email addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: email
 *               example: ["hacker@example.com", "volunteer@illinois.edu"]
 *       404:
 *         description: No subscribers found for this mailing list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "No subscribers found for this mailing list."
 *     security:
 *       - bearerAuth: []
 */
// Get all the emails in a specific mailing list
// Param: mailingList - the name of the mailing list to retrieve
subscriptionRouter.get(
    "/:mailingList",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { mailingList } = req.params;

        // Get all users subscribed to this mailing list
        const { data: subscriptions } = await SupabaseDB.SUBSCRIPTIONS.select(
            "userId"
        )
            .eq("mailingList", mailingList)
            .throwOnError();

        if (!subscriptions || subscriptions.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: "No subscribers found for this mailing list." });
        }

        // Get email addresses for all subscribed users (batch to avoid URL length limits)
        const userIds = subscriptions.map((sub) => sub.userId);
        const BATCH_SIZE = 100; // Process in smaller batches
        const emailAddresses: string[] = [];

        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
            const batch = userIds.slice(i, i + BATCH_SIZE);
            const { data: users } = await SupabaseDB.AUTH_INFO.select("email")
                .in("userId", batch)
                .throwOnError();

            const batchEmails = users?.map((user) => user.email) || [];
            emailAddresses.push(...batchEmails);
        }

        return res.status(StatusCodes.OK).json(emailAddresses);
    }
);

/**
 * @swagger
 * /subscription/user/{userId}:
 *   get:
 *     summary: Get a user's mailing list subscriptions
 *     description: |
 *       Returns the names of all mailing lists the given user is subscribed to.
 *       Non-admin users may only query their own subscriptions.
 *
 *       **Required roles: USER | ADMIN**
 *     tags: [Subscription]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of mailing list names the user is subscribed to
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["rp_interest", "attendees"]
 *       403:
 *         description: Non-admin user attempting to query another user's subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied."
 *     security:
 *       - bearerAuth: []
 */
// Get a user's subscriptions
subscriptionRouter.get(
    "/user/:userId",
    RoleChecker([Role.Enum.USER, Role.Enum.ADMIN]),
    async (req, res) => {
        const { userId } = req.params;

        // Check if the user is requesting their own data or is an admin
        const payload = res.locals.payload;
        if (
            !payload.roles.includes(Role.Enum.ADMIN) &&
            payload.userId !== userId
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "Access denied." });
        }

        const { data: userSubscriptions } =
            await SupabaseDB.SUBSCRIPTIONS.select("mailingList")
                .eq("userId", userId)
                .throwOnError();

        const mailingLists =
            userSubscriptions?.map((sub) => sub.mailingList) || [];

        return res.status(StatusCodes.OK).json(mailingLists);
    }
);

/**
 * @swagger
 * /subscription/:
 *   delete:
 *     summary: Unsubscribe from a mailing list
 *     description: |
 *       Removes the given user's subscription from the specified mailing list.
 *       Non-admin users may only unsubscribe themselves.
 *
 *       **Required roles: USER | ADMIN**
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnsubscribeValidator'
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionSuccessResponse'
 *       403:
 *         description: Non-admin user attempting to unsubscribe another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied."
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Subscription not found."
 *     security:
 *       - bearerAuth: []
 */
// Unsubscribe from a mailing list
subscriptionRouter.delete(
    "/",
    RoleChecker([Role.Enum.USER, Role.Enum.ADMIN]),
    async (req, res) => {
        const { userId, mailingList } = req.body;

        // Check if the user is unsubscribing themselves or is an admin
        const payload = res.locals.payload;
        if (
            !payload.roles.includes(Role.Enum.ADMIN) &&
            payload.userId !== userId
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "Access denied." });
        }

        // Check if the subscription exists
        const { data: existingSubscription } =
            await SupabaseDB.SUBSCRIPTIONS.select("userId, mailingList")
                .eq("userId", userId)
                .eq("mailingList", mailingList)
                .maybeSingle()
                .throwOnError();

        if (!existingSubscription) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: "Subscription not found." });
        }

        // Delete the specific subscription
        await SupabaseDB.SUBSCRIPTIONS.delete()
            .eq("userId", userId)
            .eq("mailingList", mailingList)
            .throwOnError();

        return res.status(StatusCodes.OK).json({ status: "success" });
    }
);

export default subscriptionRouter;
