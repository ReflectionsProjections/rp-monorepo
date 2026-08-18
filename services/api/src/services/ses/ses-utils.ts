import { ses, Config } from '../../config';
import {
    SendEmailCommand,
    SendBulkEmailCommand,
    TooManyRequestsException,
} from '@aws-sdk/client-sesv2';
import { Templates } from '../../config';
import { setTimeout } from 'timers/promises';

export interface BulkSendResult {
    success: boolean;
    successCount: number;
    failedCount: number;
    errors: string[];
}

function getBackoffDuration(attempt: number): number {
    const duration = Config.MIN_MAIL_BACKOFF_MS * Math.pow(2, attempt);
    return Math.min(duration, Config.MAX_MAIL_BACKOFF_MS);
}

function isThrottlingError(error: unknown): boolean {
    if (error instanceof TooManyRequestsException) {
        return true;
    }
    if (error instanceof Error && error.name === 'Throttling') {
        return true;
    }
    return false;
}

async function sendWithRetry(command: SendEmailCommand): Promise<void> {
    for (let attempt = 0; attempt < Config.MAX_MAIL_SEND_RETRIES; attempt++) {
        try {
            await ses.send(command);
            return;
        } catch (error) {
            if (isThrottlingError(error) && attempt < Config.MAX_MAIL_SEND_RETRIES - 1) {
                await setTimeout(getBackoffDuration(attempt));
            } else {
                throw error;
            }
        }
    }
}

export async function sendHTMLEmail(
    emailId: string,
    subject: string,
    emailHtml: string,
): Promise<void> {
    const command = new SendEmailCommand({
        FromEmailAddress:
            Config.OUTGOING_EMAIL_ADDRESSES.Enum['no-reply@reflectionsprojections.org'],
        Destination: {
            ToAddresses: [emailId],
        },
        Content: {
            Simple: {
                Subject: { Data: subject, Charset: 'utf-8' },
                Body: { Html: { Data: emailHtml, Charset: 'utf-8' } },
            },
        },
    });

    await sendWithRetry(command);
}

export async function sendEmail(
    emailId: string,
    subject: string,
    emailBody: string,
): Promise<void> {
    const command = new SendEmailCommand({
        FromEmailAddress:
            Config.OUTGOING_EMAIL_ADDRESSES.Enum['no-reply@reflectionsprojections.org'],
        Destination: {
            ToAddresses: [emailId],
        },
        Content: {
            Simple: {
                Subject: { Data: subject },
                Body: { Text: { Data: emailBody } },
            },
        },
    });

    await sendWithRetry(command);
}

export async function sendTemplateEmail(
    emailId: string,
    templateId: Templates,
    templateData: Record<string, unknown>,
): Promise<void> {
    const command = new SendEmailCommand({
        FromEmailAddress:
            Config.OUTGOING_EMAIL_ADDRESSES.Enum['no-reply@reflectionsprojections.org'],
        Destination: {
            ToAddresses: [emailId],
        },
        Content: {
            Template: {
                TemplateName: templateId,
                TemplateData: JSON.stringify(templateData),
            },
        },
    });

    await sendWithRetry(command);
}

export async function sendBulkTemplateEmail(
    templateId: Templates,
    recipients: Array<{ email: string; data?: Record<string, unknown> }>,
    defaultTemplateData?: Record<string, unknown>,
): Promise<BulkSendResult> {
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < recipients.length; i += Config.SES_BULK_BATCH_SIZE) {
        const batch = recipients.slice(i, i + Config.SES_BULK_BATCH_SIZE);

        const command = new SendBulkEmailCommand({
            FromEmailAddress:
                Config.OUTGOING_EMAIL_ADDRESSES.Enum['no-reply@reflectionsprojections.org'],
            DefaultContent: {
                Template: {
                    TemplateName: templateId,
                    TemplateData: JSON.stringify(defaultTemplateData || {}),
                },
            },
            BulkEmailEntries: batch.map(({ email, data }) => ({
                Destination: { ToAddresses: [email] },
                ReplacementEmailContent: {
                    ReplacementTemplate: {
                        ReplacementTemplateData: JSON.stringify({
                            ...defaultTemplateData,
                            ...data,
                        }),
                    },
                },
            })),
        });

        for (let attempt = 0; attempt < Config.MAX_MAIL_SEND_RETRIES; attempt++) {
            try {
                const response = await ses.send(command);

                response.BulkEmailEntryResults?.forEach((result, index) => {
                    if (result.Status === 'SUCCESS') {
                        successCount++;
                    } else {
                        const email = batch[index]!.email;
                        errors.push(`${email}: ${result.Error ?? 'Unknown error'}`);
                    }
                });

                break;
            } catch (error) {
                if (isThrottlingError(error) && attempt < Config.MAX_MAIL_SEND_RETRIES - 1) {
                    await setTimeout(getBackoffDuration(attempt));
                } else {
                    for (const { email } of batch) {
                        const message = error instanceof Error ? error.message : String(error);
                        errors.push(`${email}: ${message}`);
                    }
                    break;
                }
            }
        }
    }

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        errors,
    };
}
