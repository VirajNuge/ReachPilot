/**
 * Robust JSON parser for LLM-generated text.
 *
 * LLMs frequently return:
 *  - Markdown code fences (```json ... ```)
 *  - Bare control characters (real \n, \t) inside string values
 *  - Invalid escape sequences (\p, \(, \e, Windows paths, etc.)
 *  - Extra prose before/after the JSON object
 *
 * Strategy (in order):
 *  1. Strip code fences, try direct JSON.parse
 *  2. Extract outermost {...} via brace matching, try JSON.parse
 *  3. Walk character-by-character, fixing bad escapes and control chars
 *     only inside strings — never touching structural characters.
 */

// Valid single-char JSON escape sequences after the leading backslash.
const VALID_JSON_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

export function parseAIJson(text: string): unknown {
  // Step 1: Strip markdown code fences
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Step 2: Try direct parse (handles well-formed responses)
  try {
    return JSON.parse(stripped);
  } catch {
    // continue
  }

  // Step 3: Extract outermost JSON object via brace matching
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new SyntaxError("No JSON object found in AI response");
  }
  const extracted = stripped.slice(firstBrace, lastBrace + 1);

  // Step 4: Try parsing the extracted slice directly
  try {
    return JSON.parse(extracted);
  } catch {
    // continue to character-level repair
  }

  // Step 5: Character-level repair.
  // Process one character at a time, tracking whether we're inside a JSON
  // string so we can fix:
  //   (a) bare control characters → proper \n / \r / \t / \uXXXX escapes
  //   (b) invalid escape sequences (e.g. \p, \() → doubled backslash (\\p)
  let repaired = "";
  let inString = false;
  let i = 0;

  while (i < extracted.length) {
    const ch = extracted[i];

    if (!inString) {
      // Outside a string: just track when we enter one.
      if (ch === '"') inString = true;
      repaired += ch;
      i++;
      continue;
    }

    // --- Inside a JSON string ---

    if (ch === '"') {
      // End of string (unescaped quote).
      inString = false;
      repaired += ch;
      i++;
      continue;
    }

    if (ch === "\\") {
      const next = extracted[i + 1];

      if (next === undefined) {
        // Trailing backslash at end of input — escape it.
        repaired += "\\\\";
        i++;
        continue;
      }

      if (VALID_JSON_ESCAPES.has(next)) {
        // Valid escape sequence — pass both characters through as-is.
        // For \uXXXX we also pass the next 4 chars; JSON.parse will validate them.
        repaired += ch + next;
        i += 2;
        continue;
      }

      // Invalid escape (e.g. \p, \(, \e) — double the backslash so the
      // character is preserved as a literal backslash in the parsed value.
      repaired += "\\\\" + next;
      i += 2;
      continue;
    }

    // Bare control character inside a string — must be escaped.
    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      switch (ch) {
        case "\n": repaired += "\\n"; break;
        case "\r": repaired += "\\r"; break;
        case "\t": repaired += "\\t"; break;
        default:   repaired += "\\u" + code.toString(16).padStart(4, "0");
      }
      i++;
      continue;
    }

    repaired += ch;
    i++;
  }

  return JSON.parse(repaired);
}

