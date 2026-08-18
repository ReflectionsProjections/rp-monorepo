import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegistrationDraftValidator, RegistrationValidator } from './registration-schema';
import { SupabaseDB } from '../../database';
import RoleChecker from '../../middleware/role-checker';
import { AttendeeCreateValidator } from '../attendee/attendee-validators';
import cors from 'cors';
import Mustache from 'mustache';
import { sendTemplateEmail } from '../ses/ses-utils';
import { Templates, MailingLists } from '../../config';
import templates from '../../templates/templates';
import { Role } from '../auth/auth-models';
import RegistrationAuthChecker from '../../middleware/registration-auth-checker';
import { generateJWT, normalizeEmail } from '../auth/auth-utils';
import { supabase } from '../../database';

const registrationRouter = Router();
registrationRouter.use(cors());

/**
 * @swagger
 * /registration/draft:
 *   post:
 *     summary: Save a registration draft
 *     description: |
 *       Upserts an in-progress registration draft for the authenticated user.
 *       Allows partial form data to be saved before final submission.
 *
 *       **Required roles: (any authenticated user)**
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationDraftValidator'
 *     responses:
 *       200:
 *         description: The saved draft (with userId attached)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationDraftValidator'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: {}
 *     security:
 *       - bearerAuth: []
 */
registrationRouter.post('/draft', RegistrationAuthChecker, async (req, res) => {
    const payload = res.locals.payload;

    const validatorResult = RegistrationDraftValidator.safeParse(req.body);
    if (!validatorResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: validatorResult.error.format() });
    }

    if (normalizeEmail(validatorResult.data.email) !== normalizeEmail(payload.email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'EmailMismatch' });
    }

    const registrationDraft = {
        ...validatorResult.data,
        email: normalizeEmail(payload.email),
        userId: payload.userId,
    };

    await SupabaseDB.DRAFT_REGISTRATIONS.upsert(registrationDraft).throwOnError();

    return res.status(StatusCodes.OK).json(registrationDraft);
});

/**
 * @swagger
 * /registration/draft:
 *   get:
 *     summary: Get the current user's registration draft
 *     description: |
 *       Returns the saved draft for the authenticated user, if one exists.
 *
 *       **Required roles: (any authenticated user)**
 *     tags: [Registration]
 *     responses:
 *       200:
 *         description: The user's saved draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationDraftValidator'
 *       404:
 *         description: No draft found for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "DoesNotExist"
 *     security:
 *       - bearerAuth: []
 */
registrationRouter.get('/draft', RegistrationAuthChecker, async (req, res) => {
    const { data: draftRegistration } = await SupabaseDB.DRAFT_REGISTRATIONS.select('*')
        .eq('userId', res.locals.payload.userId)
        .maybeSingle();

    if (!draftRegistration) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: 'DoesNotExist',
        });
    }

    return res.status(StatusCodes.OK).json(draftRegistration);
});

/**
 * @swagger
 * /registration/complete:
 *   post:
 *     summary: Complete registration for a verified account
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationValidator'
 *     responses:
 *       200:
 *         description: The registration and a new access token
 *       400:
 *         description: The registration or email is invalid
 *     security:
 *       - bearerAuth: []
 */
registrationRouter.post('/complete', RegistrationAuthChecker, async (req, res) => {
    const payload = res.locals.payload;
    const registrationResult = RegistrationValidator.safeParse(req.body);
    if (!registrationResult.success) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: registrationResult.error.format() });
    }

    if (normalizeEmail(registrationResult.data.email) !== normalizeEmail(payload.email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'EmailMismatch' });
    }

    const registrationData = {
        ...registrationResult.data,
        email: normalizeEmail(payload.email),
    };
    const { error } = await supabase.rpc('complete_magic_link_registration', {
        p_user_id: payload.userId,
        p_email: registrationData.email,
        p_registration: registrationData,
        p_mailing_list: MailingLists.ATTENDEES_2026,
    });
    if (error) {
        // Raised by the database function when the token's userId and
        // email no longer match the account (for example, a stale token
        // after an email change).
        if (error.message?.includes('InvalidRegistrationIdentity')) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: 'InvalidRegistrationIdentity' });
        }
        throw error;
    }

    const registration = {
        ...registrationData,
        userId: payload.userId,
    };
    try {
        await sendTemplateEmail(payload.email, Templates.RP_EMAILS, {
            subject: 'Reflections | Projections Registration Confirmation',
            body: Mustache.render(templates.REGISTRATION_CONFIRMATION, {
                ...registrationData,
                allergies:
                    registrationData.allergies.length > 0
                        ? registrationData.allergies.join(', ')
                        : 'N/A',
                dietaryRestrictions:
                    registrationData.dietaryRestrictions.length > 0
                        ? registrationData.dietaryRestrictions.join(', ')
                        : 'N/A',
                majors:
                    registrationData.majors.length > 0 ? registrationData.majors.join(', ') : 'N/A',
                minors:
                    registrationData.minors.length > 0 ? registrationData.minors.join(', ') : 'N/A',
                tags: registrationData.tags.length > 0 ? registrationData.tags.join(', ') : 'N/A',
            }),
        });
    } catch (error) {
        console.error('Failed to send registration confirmation email', error);
    }

    const token = await generateJWT(payload.userId);
    return res.status(StatusCodes.OK).json({ registration, token });
});

/**
 * @swagger
 * /registration/submit:
 *   post:
 *     summary: Submit a completed registration
 *     description: |
 *       Finalises the user's registration: upserts the registration record,
 *       assigns the USER role, creates/updates the attendee profile, subscribes
 *       the user to the attendees mailing list, and sends a confirmation email.
 *
 *       **Required roles: (any authenticated user)**
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationValidator'
 *     responses:
 *       200:
 *         description: The submitted registration (with userId attached)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationValidator'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: {}
 *     security:
 *       - bearerAuth: []
 */
registrationRouter.post('/submit', RoleChecker([]), async (req, res) => {
    const payload = res.locals.payload;

    const registrationResult = RegistrationValidator.safeParse(req.body);
    if (!registrationResult.success) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: registrationResult.error.format() });
    }

    if (normalizeEmail(registrationResult.data.email) !== normalizeEmail(payload.email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'EmailMismatch' });
    }

    const registration = {
        ...registrationResult.data,
        email: normalizeEmail(payload.email),
        userId: payload.userId,
    };

    const attendeeResult = AttendeeCreateValidator.safeParse(registration);
    if (!attendeeResult.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: attendeeResult.error.format() });
    }

    const attendee = attendeeResult.data;

    const { data: existing } = await SupabaseDB.REGISTRATIONS.select('userId')
        .eq('userId', payload.userId)
        .single();

    await Promise.all([
        SupabaseDB.REGISTRATIONS.upsert(registration, {
            onConflict: 'userId',
        }).throwOnError(),
        SupabaseDB.AUTH_ROLES.upsert(
            {
                userId: payload.userId,
                role: Role.Enum.USER,
            },
            { onConflict: 'userId,role', ignoreDuplicates: true },
        ).throwOnError(),
        SupabaseDB.ATTENDEES.upsert(attendee, {
            onConflict: 'userId',
        }).throwOnError(),
        SupabaseDB.MAILING_LISTS.upsert(
            { listName: MailingLists.ATTENDEES_2026, email: payload.email },
            { onConflict: 'listName,email', ignoreDuplicates: true },
        ).throwOnError(),
    ]);

    const substitution = {
        allergies: registration.allergies.length > 0 ? registration.allergies.join(', ') : 'N/A',
        dietaryRestrictions:
            registration.dietaryRestrictions.length > 0
                ? registration.dietaryRestrictions.join(', ')
                : 'N/A',
        educationLevel: registration.educationLevel,
        ethnicity: registration.ethnicity.length > 0 ? registration.ethnicity.join(', ') : 'N/A',
        gender: registration.gender,
        graduationYear: registration.graduationYear,
        majors: registration.majors.length > 0 ? registration.majors.join(', ') : 'N/A',
        minors: registration.minors.length > 0 ? registration.minors.join(', ') : 'N/A',
        name: registration.name,
        hasResume: registration.hasResume,
        school: registration.school,
        isInterestedMechMania: registration.isInterestedMechMania,
        isInterestedPuzzleBang: registration.isInterestedPuzzleBang,
        howDidYouHear:
            registration.howDidYouHear.length > 0 ? registration.howDidYouHear.join(', ') : 'N/A',
        opportunities:
            registration.opportunities.length > 0 ? registration.opportunities.join(', ') : 'N/A',
        personalLinks: registration.personalLinks,
        tags: registration.tags.length > 0 ? registration.tags.join(', ') : 'N/A',
    };

    // NOTE: The school's email filters block emails with an exclamation mark (!) in the subject
    // Not sure why, but do not put exclamation marks in the subject line
    if (!existing) {
        await sendTemplateEmail(payload.email, Templates.RP_EMAILS, {
            subject: 'Reflections | Projections 2026 Registration Confirmation',
            body: Mustache.render(templates.REGISTRATION_CONFIRMATION, substitution),
        });
    } else {
        await sendTemplateEmail(payload.email, Templates.RP_EMAILS, {
            subject: 'Reflections | Projections 2026 Registration Updated',
            body: Mustache.render(templates.REGISTRATION_UPDATE_CONFIRMATION, substitution),
        });
    }

    return res.status(StatusCodes.OK).json(registration);
});

/**
 * @swagger
 * /registration/all:
 *   get:
 *     summary: Get all registrations with resumes
 *     description: |
 *       Returns a summary of all registrations where the attendee has indicated
 *       they have a resume. Used by corporate partners and admins for recruiting.
 *
 *       **Required roles: ADMIN | CORPORATE**
 *     tags: [Registration]
 *     responses:
 *       200:
 *         description: List of registration summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistrationSummaryView'
 *     security:
 *       - bearerAuth: []
 */
registrationRouter.get(
    '/all',
    RoleChecker([Role.Enum.ADMIN, Role.Enum.CORPORATE]),
    async (req, res) => {
        const { data } = await SupabaseDB.REGISTRATIONS.select(
            'userId, name, majors, minors, school, educationLevel, graduationYear, opportunities, personalLinks',
        )
            .eq('hasResume', true)
            .throwOnError();

        return res.status(StatusCodes.OK).json(data);
    },
);

export default registrationRouter;
