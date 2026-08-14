import { Button, Link, Text } from "@chakra-ui/react";
import { useState } from "react";
import {
  AuthCard,
  BODY_FONT,
  TEXT_COLOR
} from "@app/sections/home/components/Auth/AuthCard";

const MISSING_TOKEN_MESSAGE =
  "This link is missing its token. Please request a new one from the app.";

function tokenFromQuery() {
  return new URLSearchParams(window.location.search).get("token");
}

/**
 * Fallback page for the mobile magic link. On a phone with the app installed
 * the OS intercepts this URL as a universal/app link and never loads this
 * page; we get here when that interception doesn't fire (desktop, app not
 * installed, or an in-app email browser).
 *
 * The token is minted for client "mobile", so this page must never try to
 * verify it as "web" — it only hands the token back to the app via its
 * custom URL scheme.
 */
export function MobileMagicLink() {
  const [token] = useState(tokenFromQuery);

  const appUrl = token
    ? `reflectionsprojections:///auth/mobile/login?token=${encodeURIComponent(token)}`
    : null;

  return (
    <AuthCard title={token ? "Open in the app" : "Sign in failed"}>
      {appUrl ? (
        <>
          <Text
            fontFamily={BODY_FONT}
            fontWeight={500}
            color={TEXT_COLOR}
            opacity={0.85}
          >
            This sign-in link is for the R|P mobile app. If the app didn&rsquo;t
            open automatically, tap the button below on your phone.
          </Text>
          <Button
            as="a"
            href={appUrl}
            w="100%"
            borderRadius="full"
            fontFamily={BODY_FONT}
            fontWeight={500}
            color="#FFFFFF"
            bg="rgba(192,38,211,0.85)"
            _hover={{ bg: "rgba(192,38,211,1)" }}
            _active={{ bg: "rgba(160,30,180,1)" }}
          >
            Open the R|P app
          </Button>
          <Text
            fontFamily={BODY_FONT}
            fontWeight={500}
            fontSize="sm"
            color={TEXT_COLOR}
            opacity={0.6}
          >
            On a computer? Open this link from the email app on your phone
            instead.
          </Text>
        </>
      ) : (
        <>
          <Text
            fontFamily={BODY_FONT}
            fontWeight={500}
            color={TEXT_COLOR}
            opacity={0.85}
          >
            {MISSING_TOKEN_MESSAGE}
          </Text>
          <Link
            href="/"
            fontFamily={BODY_FONT}
            fontWeight={500}
            color="#FCF2F6"
            textDecoration="underline"
            textUnderlineOffset="4px"
            _hover={{ opacity: 0.75 }}
          >
            Back to the site
          </Link>
        </>
      )}
    </AuthCard>
  );
}
