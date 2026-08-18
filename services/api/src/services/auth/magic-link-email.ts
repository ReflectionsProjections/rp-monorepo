import mustache from 'mustache';
import templates from '../../templates/templates';
import { MagicLinkIntent } from './magic-link-schema';

function actionFor(intent: MagicLinkIntent): string {
    switch (intent) {
        case 'registration':
            return 'Continue registration';
        case 'resume-book':
            return 'Open the resume book';
        case 'login':
            return 'Sign in';
        default:
            return assertNever(intent);
    }
}

function assertNever(intent: never): never {
    throw new Error(`Unhandled magic-link intent: ${String(intent)}`);
}

export function renderMagicLinkEmail(link: string, code: string, intent: MagicLinkIntent): string {
    return mustache.render(templates.MAGIC_LINK, {
        action: actionFor(intent),
        link,
        code,
    });
}
