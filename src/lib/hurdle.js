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
  { answer: "ASCOT", category: "Racecourse", clue: "Top hats and a royal procession in June." },
  { answer: "EPSOM", category: "Racecourse", clue: "Downs where the blue riband is decided." },
  { answer: "AINTREE", category: "Racecourse", clue: "Merseyside's test over national fences." },
  { answer: "GOODWOOD", category: "Racecourse", clue: "Glorious by name, high on the Sussex Downs." },
  { answer: "NEWMARKET", category: "Racecourse", clue: "The headquarters town, home of the Guineas." },
  { answer: "DONCASTER", category: "Racecourse", clue: "Town Moor stage for the season's final Classic." },
  { answer: "SANDOWN", category: "Racecourse", clue: "Esher track of the Eclipse and Tingle Creek." },
  { answer: "KEMPTON", category: "Racecourse", clue: "Sunbury floodlights and a Boxing Day showpiece." },
  { answer: "HAYDOCK", category: "Racecourse", clue: "Merseyside galloping track, the Sprint Cup's home." },
  { answer: "DETTORI", category: "Jockey", clue: "The flying-dismount showman." },
  { answer: "MOORE", category: "Jockey", clue: "Ballydoyle's quietly ruthless rider." },
  { answer: "BUICK", category: "Jockey", clue: "Godolphin's first call in the royal blue." },
  { answer: "DOYLE", category: "Jockey", clue: "Britain's record-breaking woman in the plate." },
  { answer: "MURPHY", category: "Jockey", clue: "Killarney-born, flamboyant multiple champion." },
  { answer: "FALLON", category: "Jockey", clue: "Six-time champion of a turbulent era." },
  { answer: "GOSDEN", category: "Trainer", clue: "Clarehaven's Classic-winning handler." },
  { answer: "APPLEBY", category: "Trainer", clue: "Moulton Paddocks' globe-trotting boss." },
  { answer: "HENDERSON", category: "Trainer", clue: "The Seven Barrows jumping kingpin." },
  { answer: "STOUTE", category: "Trainer", clue: "Freemason Lodge's knighted master." },
  { answer: "ELLIOTT", category: "Trainer", clue: "Cullentra's prolific Irish jumps man." },
  { answer: "FRANKEL", category: "Horse", clue: "Fourteen from fourteen — simply the best." },
  { answer: "ENABLE", category: "Horse", clue: "The dual-Arc heroine from Clarehaven." },
  { answer: "BAAEED", category: "Horse", clue: "Shadwell's unbeaten miling machine." },
  { answer: "SHERGAR", category: "Horse", clue: "A Derby romp, then gone forever." },
  { answer: "ARKLE", category: "Horse", clue: "'Himself' — the Irish chasing colossus." },
  { answer: "GALILEO", category: "Horse", clue: "The sire who shaped a generation." },
  { answer: "DENMAN", category: "Horse", clue: "'The Tank' from Ditcheat." },
  { answer: "NIJINSKY", category: "Horse", clue: "The last colt to land the Triple Crown." },
  { answer: "FURLONG", category: "Racing term", clue: "Two hundred and twenty yards of it." },
  { answer: "PADDOCK", category: "Racing term", clue: "Where they parade before the off." },
  { answer: "BRIDLE", category: "Racing term", clue: "Travelling sweetly: 'on the ___'." },
  { answer: "STAYER", category: "Racing term", clue: "Built for the trip, not the dash." },
  { answer: "MAIDEN", category: "Racing term", clue: "Still chasing a first success." },
  { answer: "SILKS", category: "Racing term", clue: "What tells the colours apart." },
  { answer: "STEEPLE", category: "Racing term", clue: "___chase territory." },
  { answer: "FAVOURITE", category: "Racing term", clue: "The 'jolly' at the head of the market." },
  { answer: "GOING", category: "Racing term", clue: "Soft, good or firm underfoot." },
  { answer: "TIPSTER", category: "Racing term", clue: "Sells you the winner — allegedly." },
  { answer: "PHOTO", category: "Racing term", clue: "Called when it's too tight to split." },
  { answer: "GALLOP", category: "Racing term", clue: "Where the morning work is done." },
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
