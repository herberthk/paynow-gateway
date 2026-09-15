// Pure narrative builder — no server-only marker so unit tests can import it.

/**
 * Build the Wallet top-up narrative for the Yo! deposit request.
 * Strips XML-significant chars (SDK inserts values verbatim) and keeps
 * the narrative short plain text.
 */
export function buildTopupNarrative(
  userName: string | null | undefined,
): string {
  return (
    `Wallet top-up ${userName || ""}`
      // Strip XML-significant chars (SDK inserts values verbatim) plus
      // XML-illegal / header-risk control chars. \t \n \r are kept here
      // and collapsed to a space by the whitespace pass below.
      .replace(/[<>&"'\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "Wallet top-up"
  );
}
