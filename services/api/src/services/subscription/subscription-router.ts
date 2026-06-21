import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import {
    SubscriptionValidator,
    CreateMailingListValidator,
    SendEmailValidator,
    SendEmailBulkValidator,
    SendEmailSingleValidator,
    UnsubscribeValidator,
} from "./subscription-schema";
import { SupabaseDB } from "../../database";
import cors from "cors";
import RoleChecker from "../../middleware/role-checker";
import { Role } from "../auth/auth-models";
import { sendHTMLEmail, sendBulkTemplateEmail } from "../ses/ses-utils";
import { Templates } from "../../config";

const subscriptionRouter = Router();

// Subscribe a user to a mailing list
subscriptionRouter.post(
    "/",
    cors(),
    RoleChecker([Role.Enum.USER, Role.Enum.ADMIN]),
    async (req, res) => {
        const { userId, mailingList } = SubscriptionValidator.parse(req.body);

        const payload = res.locals.payload;
        if (
            !payload.roles.includes(Role.Enum.ADMIN) &&
            payload.userId !== userId
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "Access denied." });
        }

        const { data: user } = await SupabaseDB.AUTH_INFO.select("email")
            .eq("userId", userId)
            .maybeSingle()
            .throwOnError();

        if (!user) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: "User not found." });
        }

        await SupabaseDB.MAILING_LISTS.upsert(
            { listName: mailingList, email: user.email },
            { onConflict: "listName,email", ignoreDuplicates: true }
        ).throwOnError();

        return res.status(StatusCodes.CREATED).json({ userId, mailingList });
    }
);

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

        return res.status(StatusCodes.CREATED).json({
            status: "success",
            message: "Mailing list created successfully",
        });
    }
);

/**
 * @swagger
 * /subscription/:
 *   get:
 *     summary: Get all mailing list entries
 *     description: |
 *       Returns every entry in the mailing lists table.
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: List of all entries
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/",
    RoleChecker([Role.Enum.ADMIN]),
    async (_req, res) => {
        const { data } =
            await SupabaseDB.MAILING_LISTS.select("*").throwOnError();

        return res.status(StatusCodes.OK).json(data);
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
 *               example: ["rp_interest", "attendees", "2026_Staff"]
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/lists",
    RoleChecker([Role.Enum.ADMIN]),
    async (_req, res) => {
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
 *       AWS SES.
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
 *               $ref: '#/components/schemas/BulkSendResultResponse'
 *       404:
 *         description: No subscribers found for this mailing list
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.post(
    "/send-email",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { mailingList, subject, htmlBody } = SendEmailValidator.parse(
            req.body
        );

        const { data: entries } = await SupabaseDB.MAILING_LISTS.select("email")
            .eq("listName", mailingList)
            .throwOnError();

        if (!entries || entries.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: "No subscribers found for this mailing list.",
            });
        }

        const emailAddresses = entries.map((row) => row.email);
        const result = await sendBulkTemplateEmail(
            Templates.RP_EMAILS,
            emailAddresses.map((email) => ({ email })),
            { subject, body: htmlBody }
        );

        return res.status(StatusCodes.OK).send(result);
    }
);

// Send an email to a list of arbitrary emails (testing only)
subscriptionRouter.post(
    "/send-email/bulk",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { emails, subject, htmlBody } = SendEmailBulkValidator.parse(
            req.body
        );

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
subscriptionRouter.post(
    "/send-email/single",
    RoleChecker([Role.Enum.SUPER_ADMIN]),
    async (req, res) => {
        const { email, subject, htmlBody } = SendEmailSingleValidator.parse(
            req.body
        );

        await sendHTMLEmail(email, subject, htmlBody);

        return res
            .status(StatusCodes.OK)
            .json({ status: "success", message: "Email sent successfully" });
    }
);

/**
 * @swagger
 * /subscription/{mailingList}:
 *   get:
 *     summary: Get email addresses for a mailing list
 *     description: |
 *       Returns the email addresses of all subscribers of the given mailing list.
 *
 *       **Required roles: ADMIN**
 *     tags: [Subscription]
 *     parameters:
 *       - name: mailingList
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subscriber email addresses
 *       404:
 *         description: No subscribers found for this mailing list
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/:mailingList",
    RoleChecker([Role.Enum.ADMIN]),
    async (req, res) => {
        const { mailingList } = req.params;

        const { data: entries } = await SupabaseDB.MAILING_LISTS.select("email")
            .eq("listName", mailingList)
            .throwOnError();

        if (!entries || entries.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: "No subscribers found for this mailing list." });
        }

        return res.status(StatusCodes.OK).json(entries.map((row) => row.email));
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
 *         description: List of mailing list names
 *       403:
 *         description: Access denied
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.get(
    "/user/:userId",
    RoleChecker([Role.Enum.USER, Role.Enum.ADMIN]),
    async (req, res) => {
        const { userId } = req.params;

        const payload = res.locals.payload;
        if (
            !payload.roles.includes(Role.Enum.ADMIN) &&
            payload.userId !== userId
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "Access denied." });
        }

        const { data: user } = await SupabaseDB.AUTH_INFO.select("email")
            .eq("userId", userId)
            .maybeSingle()
            .throwOnError();

        if (!user) {
            return res.status(StatusCodes.OK).json([]);
        }

        const { data: entries } = await SupabaseDB.MAILING_LISTS.select(
            "listName"
        )
            .eq("email", user.email)
            .throwOnError();

        const mailingLists = entries?.map((row) => row.listName) || [];

        return res.status(StatusCodes.OK).json(mailingLists);
    }
);

/**
 * @swagger
 * /subscription/:
 *   delete:
 *     summary: Unsubscribe from a mailing list
 *     description: |
 *       Removes the given user's email from the specified mailing list.
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
 *       403:
 *         description: Access denied
 *       404:
 *         description: Subscription not found
 *     security:
 *       - bearerAuth: []
 */
subscriptionRouter.delete(
    "/",
    RoleChecker([Role.Enum.USER, Role.Enum.ADMIN]),
    async (req, res) => {
        const { userId, mailingList } = UnsubscribeValidator.parse(req.body);

        const payload = res.locals.payload;
        if (
            !payload.roles.includes(Role.Enum.ADMIN) &&
            payload.userId !== userId
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json({ error: "Access denied." });
        }

        const { data: user } = await SupabaseDB.AUTH_INFO.select("email")
            .eq("userId", userId)
            .maybeSingle()
            .throwOnError();

        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: "Subscription not found." });
        }

        const { data: existing } = await SupabaseDB.MAILING_LISTS.select(
            "listName"
        )
            .eq("listName", mailingList)
            .eq("email", user.email)
            .maybeSingle()
            .throwOnError();

        if (!existing) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: "Subscription not found." });
        }

        await SupabaseDB.MAILING_LISTS.delete()
            .eq("listName", mailingList)
            .eq("email", user.email)
            .throwOnError();

        return res.status(StatusCodes.OK).json({ status: "success" });
    }
);

export default subscriptionRouter;
