/**
 * Robust JSON parser for LLM-generated text.
 *
 * LLMs frequently return:
 *  - Markdown code fences (```json ... ```)
 *  - Bare control characters (real \n, \t) inside string values
 *  - Extra prose before/after the JSON object
 *
 * Strategy (in order):
 *  1. Strip code fences, try direct JSON.parse
 *  2. Extract outermost {...} via brace matching, try JSON.parse
 *  3. Walk character-by-character, escaping control chars only inside strings
 */
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

  // Step 5: Character-level repair — track whether we're inside a JSON string
  // so we only escape control characters there, never touching structural chars.
  let repaired = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < extracted.length; i++) {
    const ch = extracted[i];

    if (escaped) {
      repaired += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      repaired += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      repaired += ch;
      continue;
    }

    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        switch (ch) {
          case "\n": repaired += "\\n"; break;
          case "\r": repaired += "\\r"; break;
          case "\t": repaired += "\\t"; break;
          default: repaired += "\\u" + code.toString(16).padStart(4, "0");
        }
        continue;
      }
    }

    repaired += ch;
  }

  return JSON.parse(repaired);
}
