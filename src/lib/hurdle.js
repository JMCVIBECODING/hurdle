// Daily Hurdle (racing-name Wordle). The answer is a single word/name, the
// clue tells the player the category (Horse / Jockey / Trainer / Track / Term).
// Two optional clues: clue (anytime) and clue2 (a stronger hint, offered after
// 4 wrong guesses). Variable length; guesses must match the answer's length.
export const SAMPLE_HURDLE = {
  answer: "ASCOT",
  category: "Racecourse",
  clue: "Top hats and a royal procession in June.",
  clue2: "Berkshire home of the Royal meeting.",
};

export const MAX_GUESSES = 6;

// Curated racing answer pool. One is chosen automatically per calendar day
// (same for everyone). Admin can still override a specific day via Supabase.
export const POOL = [
  // Racecourses
  { answer: "ASCOT", category: "Racecourse", clue: "Top hats and a royal procession in June.", clue2: "Berkshire home of the Royal meeting." },
  { answer: "EPSOM", category: "Racecourse", clue: "Downs where the blue riband is decided.", clue2: "Surrey home of the Derby and Oaks." },
  { answer: "AINTREE", category: "Racecourse", clue: "A test over national fences.", clue2: "Merseyside home of the Grand National." },
  { answer: "GOODWOOD", category: "Racecourse", clue: "High on the Sussex Downs.", clue2: "Hosts the 'Glorious' summer festival." },
  { answer: "NEWMARKET", category: "Racecourse", clue: "The headquarters town.", clue2: "HQ of British flat racing, home of the Guineas." },
  { answer: "DONCASTER", category: "Racecourse", clue: "Town Moor, the season's final Classic.", clue2: "Yorkshire home of the St Leger." },
  { answer: "SANDOWN", category: "Racecourse", clue: "An uphill Surrey finish.", clue2: "Esher track of the Eclipse and Tingle Creek." },
  { answer: "YORK", category: "Racecourse", clue: "The Knavesmire, in the north.", clue2: "Yorkshire course of the Ebor and Juddmonte." },
  { answer: "HAYDOCK", category: "Racecourse", clue: "A galloping north-west track.", clue2: "Lancashire home of the Sprint Cup." },
  { answer: "CHELTENHAM", category: "Racecourse", clue: "Where the roar greets the jumpers.", clue2: "Home of the Gold Cup and March Festival." },
  { answer: "KEMPTON", category: "Racecourse", clue: "Sunbury floodlights, a Boxing Day showpiece.", clue2: "Hosts the King George VI Chase." },
  // Jockeys
  { answer: "DETTORI", category: "Jockey", clue: "The flying-dismount showman.", clue2: "Frankie ___, the magnificent seven man." },
  { answer: "MOORE", category: "Jockey", clue: "Ballydoyle's quietly ruthless rider.", clue2: "Ryan ___, perennial champion jockey." },
  { answer: "BUICK", category: "Jockey", clue: "First call in the royal blue.", clue2: "William ___, Godolphin's number one." },
  { answer: "DOYLE", category: "Jockey", clue: "A record-breaking woman in the plate.", clue2: "Hollie ___, married to Tom Marquand." },
  { answer: "MURPHY", category: "Jockey", clue: "Killarney-born, flamboyant champion.", clue2: "Oisin ___, multiple champion jockey." },
  { answer: "MARQUAND", category: "Jockey", clue: "A globe-trotting big-race rider.", clue2: "Tom ___, partners many Gosden runners." },
  { answer: "KEANE", category: "Jockey", clue: "An Irish champion in green silks.", clue2: "Colin ___, often for Juddmonte / Ger Lyons." },
  { answer: "PIGGOTT", category: "Jockey", clue: "Nine Derbys, 'the Long Fellow'.", clue2: "Lester ___, the greatest of his age." },
  { answer: "FALLON", category: "Jockey", clue: "Six-time champion of a turbulent era.", clue2: "Kieren ___, rode Ouija Board." },
  // Trainers
  { answer: "GOSDEN", category: "Trainer", clue: "Clarehaven's Classic-winning handler.", clue2: "John & Thady ___, trained Enable." },
  { answer: "APPLEBY", category: "Trainer", clue: "Moulton Paddocks' globe-trotter.", clue2: "Charlie ___, Godolphin's flat trainer." },
  { answer: "MULLINS", category: "Trainer", clue: "Closutton's all-conquering jumps king.", clue2: "Willie ___, champion in Britain and Ireland." },
  { answer: "HENDERSON", category: "Trainer", clue: "The Seven Barrows jumping kingpin.", clue2: "Nicky ___, trained Sprinter Sacre." },
  { answer: "STOUTE", category: "Trainer", clue: "Freemason Lodge's knighted master.", clue2: "Sir Michael ___, six Derby wins." },
  { answer: "ELLIOTT", category: "Trainer", clue: "Cullentra's prolific Irish jumps man.", clue2: "Gordon ___, won Nationals with Tiger Roll." },
  { answer: "HAGGAS", category: "Trainer", clue: "Somerville Lodge, Newmarket.", clue2: "William ___, trained Baaeed." },
  { answer: "SKELTON", category: "Trainer", clue: "An Alcester jumps yard on the rise.", clue2: "Dan ___, brother of jockey Harry." },
  // Horses — greats and current
  { answer: "FRANKEL", category: "Horse", clue: "Fourteen from fourteen — simply the best.", clue2: "Henry Cecil's unbeaten superstar." },
  { answer: "ENABLE", category: "Horse", clue: "A dual-Arc heroine.", clue2: "Gosden mare, ridden by Dettori." },
  { answer: "BAAEED", category: "Horse", clue: "An unbeaten miling machine.", clue2: "Shadwell's champion of 2022, by Haggas." },
  { answer: "KYPRIOS", category: "Horse", clue: "A Coolmore stayer who rules the Cup races.", clue2: "Won the Ascot Gold Cup for O'Brien." },
  { answer: "TRAWLERMAN", category: "Horse", clue: "A tough Gosden stayer, Cup-race regular.", clue2: "Won the Ascot Stakes and ran in the Gold Cup." },
  { answer: "SHERGAR", category: "Horse", clue: "A Derby romp, then gone forever.", clue2: "1981 Derby winner, famously kidnapped." },
  { answer: "ARKLE", category: "Horse", clue: "'Himself' — the Irish chasing colossus.", clue2: "Rated the greatest steeplechaser ever." },
  { answer: "GALILEO", category: "Horse", clue: "The sire who shaped a generation.", clue2: "Coolmore champion stallion, son of Sadler's Wells." },
  { answer: "NIJINSKY", category: "Horse", clue: "The last colt to land the Triple Crown.", clue2: "1970 Triple Crown winner for Vincent O'Brien." },
  { answer: "DENMAN", category: "Horse", clue: "'The Tank' from Ditcheat.", clue2: "2008 Gold Cup winner, Kauto Star's great rival." },
  // Terms
  { answer: "FURLONG", category: "Racing term", clue: "Two hundred and twenty yards of it.", clue2: "An eighth of a mile." },
  { answer: "PADDOCK", category: "Racing term", clue: "Where they parade before the off.", clue2: "The parade ring." },
  { answer: "BRIDLE", category: "Racing term", clue: "Travelling sweetly: 'on the ___'.", clue2: "The headgear that controls the horse." },
  { answer: "STAYER", category: "Racing term", clue: "Built for the trip, not the dash.", clue2: "A horse suited to long distances." },
  { answer: "MAIDEN", category: "Racing term", clue: "Still chasing a first success.", clue2: "A horse yet to win a race." },
  { answer: "SILKS", category: "Racing term", clue: "What tells the colours apart.", clue2: "The jockey's racing colours." },
  { answer: "STEEPLE", category: "Racing term", clue: "___chase territory.", clue2: "Racing over big fences." },
  { answer: "FAVOURITE", category: "Racing term", clue: "The 'jolly' at the head of the market.", clue2: "The shortest-priced runner." },
  { answer: "GOING", category: "Racing term", clue: "Soft, good or firm underfoot.", clue2: "The state of the ground." },
  { answer: "HANDICAP", category: "Racing term", clue: "Weights to level the field.", clue2: "A race where horses carry different weights." },
  { answer: "TIPSTER", category: "Racing term", clue: "Sells you the winner — allegedly.", clue2: "Someone who gives racing selections." },
  { answer: "PHOTO", category: "Racing term", clue: "Called when it's too tight to split.", clue2: "A ___ finish." },
  { answer: "GALLOP", category: "Racing term", clue: "Where the morning work is done.", clue2: "A fast training run." },
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
