export const DEFAULT_ADMIN_EMAILS = ["omarhag396@gmail.com"];

export function getAdminEmails() {
  const configured = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configured?.length ? configured : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
