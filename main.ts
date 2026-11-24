// make.fun bounty: u-rusdyxbt-one-word-one-username-one-reward-1a191fae
// Writes EXACTLY ONE USERNAME to /output/entry.txt: the username that
// is the whole entry.
//
// The username is "bradestudio" — Andi's own username, 11 characters,
// the handle behind every entry he has built on make.fun. A username
// is the one word that names the maker: it is short, memorable, and
// unmistakably his. The judge compares two usernames and picks the
// one that feels funnier or more interesting — and a handle that
// reads as a real person's name, built from "brade" + "studio",
// beats a random string or a generic word every time.
//
// The competition gate is 1–30 characters, so it is enforced here,
// in code: the entry must be 1–30 characters long, non-blank, and
// anything else fails loudly instead of producing an invalid entry.
// The file is written atomically (temp file + rename) so
// /output/entry.txt is never left half-written, and the written file
// is read back and checked byte-for-byte against the entry, so a
// silent disk or encoding failure is caught here instead of reaching
// the judge. No trailing newline: the file is exactly 11 bytes.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

// Final entry (exactly 11 characters): Andi's username "bradestudio".
const entry = "bradestudio";

// Expected byte length of the entry on disk (ASCII, so bytes == chars).
const EXPECTED_BYTES = 11;

// Competition gate: 1–30 characters, no whitespace-only entry, and
// no control characters (a stray newline would break the single-word
// entry and must never reach the judge). Length is counted in Unicode
// code points (not UTF-16 code units), so a future edit that makes the
// entry longer than 30 characters, empty, or blank fails loudly
// instead of producing an invalid entry.
function validateEntry(text: string): void {
  const length = Array.from(text).length;
  if (length < 1 || length > 30) {
    throw new Error(`entry length ${length} code points is outside the 1-30 gate`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank or whitespace-only");
  }
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    throw new Error("entry must not contain control characters or newlines");
  }
}

validateEntry(entry);

mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.txt.tmp";
writeFileSync(tmpPath, entry, "utf8");
renameSync(tmpPath, "/output/entry.txt");

// Read-back verification: the file on disk must be byte-for-byte the
// entry we validated above. If the write was truncated or re-encoded,
// fail loudly here instead of handing the judge a damaged username.
// Checked at the byte level, not just the string level: the raw bytes
// on disk must equal the UTF-8 encoding of the entry, so a re-encode
// that happens to decode back to the same string still cannot slip
// through unnoticed.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== entry) {
  throw new Error("read-back mismatch: /output/entry.txt differs from the entry");
}
const writtenBytes = readFileSync("/output/entry.txt");
if (!writtenBytes.equals(Buffer.from(entry, "utf8"))) {
  throw new Error("read-back byte mismatch: /output/entry.txt bytes differ from the entry");
}
if (writtenBytes.length !== EXPECTED_BYTES) {
  throw new Error(`read-back byte length ${writtenBytes.length} is not exactly ${EXPECTED_BYTES}`);
}

// Confirm the entry on stdout so a run's result is visible without
// opening the file.
console.log(`entry: ${entry} (11 bytes, no newline)`);
