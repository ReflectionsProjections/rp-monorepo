# Magic-Link Authentication Design

## Purpose

This system uses an email link to verify a person. The link does not give a
role to the person. An administrator controls sponsor access.

A base account is an account with no roles. A setup token lets a base account
use the registration routes. An access token lets an account use the routes
that its roles permit.

## Main Rules

-   The API stores one account in `authInfo`.
-   The API stores account roles in `authRoles`.
-   Registration adds the `USER` role.
-   An administrator adds or removes the `CORPORATE` role.
-   A login operation does not add the `CORPORATE` role.
-   A resume-book login requires the `CORPORATE` role.
-   A mobile login requires the `USER` role.

## Link Request

The client sends an email, a client name, and an intent to the API. The API
accepts only these combinations:

-   Web and registration.
-   Web and login.
-   Mobile and login.
-   Web and resume-book.

The API does not accept a redirect address. The API selects a fixed callback
address for each combination.

The API returns status 202 for each valid request. This response does not show
if an account exists.

## Token Storage

The API makes a token from 32 random bytes. The token does not contain an email
address. The API sends the token in the email link.

The API calculates a SHA-256 digest of the token. The API stores only the
digest. The token expires after 10 minutes.

The database consumes the token in one operation. The operation checks the
digest, client, expiry time, and used state. An invalid token does not change a
valid token.

## Account Creation

A valid web registration link can create a base account. A valid web login link
can also create a base account. The API uses the normalized email as the unique
account identity.

The base account has no roles. The API returns a setup token for this account.
The normal authorization middleware rejects the setup token.

Registration completion sets the display name and adds `USER`. It also creates
the registration, attendee, and mailing-list records in one database
transaction.

## Sponsor Access

A sponsor first creates a base account with a web login link. An administrator
then adds `CORPORATE` to the account.

The resume-book issue operation checks for `CORPORATE`. The resume-book verify
operation checks for `CORPORATE` again. Neither operation creates an account or
adds a role.

The `corporate` table can keep sponsor contact data. It is not the source of
resume-book authorization.

## Client Routing

The API does not return a destination. The callback route owns client
navigation.

-   Web registration uses `/auth/registration`.
-   Web login uses `/auth/login`.
-   Mobile login uses `/auth/mobile/login`.
-   Resume-book login uses `/sponsor/auth/magic-link`.

The mobile route must use an HTTPS Universal Link or Android App Link. The
client must remove the token from the visible URL after it reads the token.

## Security Controls

-   The API normalizes all account emails.
-   The API stores only token digests.
-   The API uses a generic invalid-token response.
-   The API limits requests by IP address and email.
-   Anonymous database clients cannot access authentication tables.
-   The service role is the only database role that can consume tokens.
-   The verification operation loads current roles before it creates a JWT.

## Compatibility

The API keeps the Google OAuth routes and columns. A later OAuth login must find
an existing account by normalized email before it creates an account.

The API keeps the legacy sponsor code routes during client migration. These
routes require a manually assigned `CORPORATE` role. They do not create an
account or add a role.
