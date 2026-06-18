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

// Curated racing answer pool. One is chosen automatically per calendar day
// (same for everyone). Admin can still override a specific day via Supabase.
export const POOL = [
  { answer: "ASCOT", category: "Racecourse", clue: "Home of the Royal meeting." },
  { answer: "EPSOM", category: "Racecourse", clue: "Where the Derby is run." },
  { answer: "AINTREE", category: "Racecourse", clue: "Home of the Grand National." },
  { answer: "GOODWOOD", category: "Racecourse", clue: "Sussex course of the 'Glorious' summer festival." },
  { answer: "NEWMARKET", category: "Racecourse", clue: "The HQ of British flat racing." },
  { answer: "CHELTENHAM", category: "Racecourse", clue: "Home of the jumps Festival and Gold Cup." },
  { answer: "KEMPTON", category: "Racecourse", clue: "Stages the King George VI Chase on Boxing Day." },
  { answer: "DETTORI", category: "Jockey", clue: "Frankie ___ rode all seven winners at Ascot in 1996." },
  { answer: "MOORE", category: "Jockey", clue: "Ryan ___, multiple champion flat jockey." },
  { answer: "BUICK", category: "Jockey", clue: "William ___, Godolphin's number one." },
  { answer: "DOYLE", category: "Jockey", clue: "Hollie ___, trailblazing British jockey." },
  { answer: "MURPHY", category: "Jockey", clue: "Oisin ___, multiple champion jockey." },
  { answer: "GOSDEN", category: "Trainer", clue: "John ___, trains at Clarehaven, Newmarket." },
  { answer: "APPLEBY", category: "Trainer", clue: "Charlie ___, Godolphin's flat trainer." },
  { answer: "HENDERSON", category: "Trainer", clue: "Nicky ___, leading jumps trainer." },
  { answer: "STOUTE", category: "Trainer", clue: "Sir Michael ___, Newmarket flat great." },
  { answer: "FRANKEL", category: "Horse", clue: "Unbeaten in 14, the highest-rated horse ever." },
  { answer: "ENABLE", category: "Horse", clue: "Dual Arc-winning mare trained by John Gosden." },
  { answer: "BAAEED", category: "Horse", clue: "Unbeaten champion miler of 2022." },
  { answer: "SHERGAR", category: "Horse", clue: "1981 Derby winner, famously kidnapped." },
  { answer: "ARKLE", category: "Horse", clue: "Legendary Irish chaser, rated the greatest ever." },
  { answer: "GALILEO", category: "Horse", clue: "Champion sire, son of Sadler's Wells." },
  { answer: "FURLONG", category: "Racing term", clue: "An eighth of a mile." },
  { answer: "PADDOCK", category: "Racing term", clue: "Where horses parade before a race." },
  { answer: "BRIDLE", category: "Racing term", clue: "Headgear used to control a horse." },
  { answer: "STAYER", category: "Racing term", clue: "A horse that races over long distances." },
  { answer: "MAIDEN", category: "Racing term", clue: "A horse that has yet to win a race." },
  { answer: "SILKS", category: "Racing term", clue: "The colours a jockey wears." },
  { answer: "STEEPLE", category: "Racing term", clue: "___chase — racing over fences." },
  { answer: "FAVOURITE", category: "Racing term", clue: "The horse with the shortest odds." },
];

// Deterministic daily pick: same word for everyone on a given date.
export function autoWord(day) {
  const idx = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000);
  return POOL[((idx % POOL.length) + POOL.length) % POOL.length];
}

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
