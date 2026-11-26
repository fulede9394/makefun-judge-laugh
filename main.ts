// One-line joke for make.fun: "Make the Judge Laugh in One Line".
// The gag is a suitcase pun: the vacation is cancelled, so the only
// luggage left is the emotional kind. Keep the sentence intact.
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

// Hard limits the bounty imposes on the single submitted line.
const LIMITS = Object.freeze({
  floor: 1,
  ceiling: 200,
  fileName: "entry.txt",
  fallbackDir: "/output",
});

// The full joke as one string, exactly as it will be judged.
const JOKE = "I told my suitcase there would be no vacation this year. Now I'm dealing with emotional baggage.";

// Work out where the entry file has to land.
function resolvePaths(): { dir: string; file: string } {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? LIMITS.fallbackDir;
  return { dir, file: resolve(dir, LIMITS.fileName) };
}

// Short fingerprint so the run log proves which text was handed in.
function fingerprint(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}

// The bounty wants one funny line, 1-200 chars, no filler. The pun
// only works if both halves survive, so check the whole line at once.
function checkJoke(line: string): void {
  const count = Array.from(line).length;
  if (count < LIMITS.floor) throw new Error("joke is empty");
  if (count > LIMITS.ceiling) {
    throw new Error(`joke is ${count} chars, over the ${LIMITS.ceiling} limit`);
  }
  if (line !== line.trim()) throw new Error("joke has stray leading/trailing space");
  if (/[\r\n]/.test(line)) throw new Error("joke must stay on one line");
  if (/[\u0000-\u001f]/.test(line)) throw new Error("joke must not contain control characters");
  if (!line.includes("suitcase") || !line.includes("emotional baggage")) {
    throw new Error("joke lost its setup or its punchline");
  }
}

// Write the line, then read it back and compare byte for byte.
async function publish(line: string): Promise<void> {
  checkJoke(line);
  const { dir, file } = resolvePaths();
  await mkdir(dir, { recursive: true });
  await writeFile(file, line, "utf8");
  const info = await stat(file);
  if (info.size !== Buffer.byteLength(line, "utf8")) {
    throw new Error("entry.txt size does not match the joke");
  }
  const back = await readFile(file, "utf8");
  if (back !== line) throw new Error("entry.txt differs from the joke");
  console.log(
    `delivered ${Array.from(line).length} chars to ${file} (sha256 ${fingerprint(line)})`,
  );
}

await publish(JOKE);
