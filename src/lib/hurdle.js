// Daily Hurdle (racing-name Wordle). The answer is a single word/name, the
// clue tells the player the category (Horse / Jockey / Trainer / Track / Term).
// Variable length; guesses must match the answer's length (names aren't in a
// dictionary, so we don't validate against one — the clue is the help).
export const SAMPLE_HURDLE = {
  answer: "ASCOT",
  category: "Racecourse",
  clue: "Home of the Royal meeting.",
};

export const MAX_GUESSES = 6;

// Per-letter result for a guess vs the answer: 'correct' | 'present' | 'absent'.
export function evaluate(guess, answer) {
  const g = guess.toUpperCase(), a = answer.toUpperCase();
  const res = Array(g.length).fill("absent");
  const counts = {};
  for (const ch of a) counts[ch] = (counts[ch] || 0) + 1;
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) { res[i] = "correct"; counts[g[i]]--; }
  }
  for (let i = 0; i < g.length; i++) {
    if (res[i] === "correct") continue;
    if (counts[g[i]] > 0) { res[i] = "present"; counts[g[i]]--; }
  }
  return res;
}

// Best-known state per keyboard letter, for colouring the keyboard.
export function keyStates(guesses, answer) {
  const rank = { absent: 0, present: 1, correct: 2 };
  const out = {};
  for (const guess of guesses) {
    const ev = evaluate(guess, answer);
    for (let i = 0; i < guess.length; i++) {
      const ch = guess[i].toUpperCase();
      if (!out[ch] || rank[ev[i]] > rank[out[ch]]) out[ch] = ev[i];
    }
  }
  return out;
}
