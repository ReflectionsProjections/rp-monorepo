export function renderMagicLinkEmail(link: string, intent: string): string {
    const action =
        intent === "registration"
            ? "Continue registration"
            : intent === "resume-book"
              ? "Open the resume book"
              : "Sign in";

    return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Arial,sans-serif;color:#111827">
  <h1>${action}</h1>
  <p>Select the button to continue. This link expires in 10 minutes.</p>
  <p><a href="${link}" style="background:#111827;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">${action}</a></p>
  <p>If you did not request this link, you can ignore this email.</p>
</body>
</html>`;
}
