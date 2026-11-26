// make.fun entry: "Make the Judge Laugh in One Line"
// A single pun about a suitcase and emotional baggage. The joke lands
// on the last two words, so the line is kept whole and untrimmed.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Submission limits for this bounty (see RULES.txt): one funny line,
// 1-200 UTF-8 characters, no padding-only content.
const ENTRY_RULES = Object.freeze({
  minChars: 1,
  maxChars: 200,
  outFile: "entry.txt",
});

// The joke itself: setup in the first sentence, punchline in the second.
const JOKE_PARTS = Object.freeze({
  setup: "I told my suitcase there would be no vacation this year.",
  punchline: "Now I'm dealing with emotional baggage.",
});

function assembleJoke(parts: typeof JOKE_PARTS): string {
  return `${parts.setup} ${parts.punchline}`;
}

function validate(entry: string): void {
  const chars = [...entry];
  if (chars.length < ENTRY_RULES.minChars) {
    throw new Error("entry is empty");
  }
  if (chars.length > ENTRY_RULES.maxChars) {
    throw new Error(`entry is ${chars.length} chars, over the 200 limit`);
  }
  if (entry.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (/\r|\n/.test(entry)) {
    throw new Error("entry must be a single line");
  }
  if (/[\u0000-\u001f]/.test(entry)) {
    throw new Error("entry must not contain control characters");
  }
}

function digest(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 12);
}

async function resolveOutDir(): Promise<string> {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

async function handIn(): Promise<void> {
  const entry = assembleJoke(JOKE_PARTS);
  validate(entry);
  const outDir = await resolveOutDir();
  await mkdir(outDir, { recursive: true });
  const target = join(outDir, ENTRY_RULES.outFile);
  await writeFile(target, entry, "utf8");
  // Round-trip: prove the file holds exactly what we validated.
  const back = await readFile(target, "utf8");
  if (back !== entry) {
    throw new Error("round-trip mismatch in entry.txt");
  }
  console.log(`wrote ${[...entry].length} chars to ${target} (sha ${digest(entry)})`);
}

await handIn();
