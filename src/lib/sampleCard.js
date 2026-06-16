// Sample Day-1 card. Used as the local demo fallback when Supabase has no row
// for today, and as the paste template in the admin page. The live card is
// loaded from Supabase by date — this is never the source of truth in prod.
export const SAMPLE_RACES = [
  { id: "r1", time: "14:30", name: "Queen Anne Stakes", runners: [
    { id: "a", name: "Field Marshal" }, { id: "b", name: "Silver Cascade" }, { id: "c", name: "Berkshire Blue" }, { id: "d", name: "Lunar Crest" }, { id: "e", name: "Tidewater" }] },
  { id: "r2", time: "15:05", name: "Coventry Stakes", runners: [
    { id: "a", name: "Quick Sixpence" }, { id: "b", name: "Gold Standard" }, { id: "c", name: "Morning Drum" }, { id: "d", name: "Vanguard Lad" }] },
  { id: "r3", time: "15:40", name: "King Charles III Stakes", runners: [
    { id: "a", name: "Crown Imperial" }, { id: "b", name: "Flash Harry" }, { id: "c", name: "Ostend" }, { id: "d", name: "Saffron King" }, { id: "e", name: "Dauntless" }] },
  { id: "r4", time: "16:20", name: "St James's Palace Stakes", runners: [
    { id: "a", name: "Palace Guard" }, { id: "b", name: "Inisfree" }, { id: "c", name: "Northern Light" }, { id: "d", name: "Composer" }] },
  { id: "r5", time: "16:55", name: "Ascot Stakes (Handicap)", runners: [
    { id: "a", name: "Stayer's Pride" }, { id: "b", name: "Long Acre" }, { id: "c", name: "Galway Mist" }, { id: "d", name: "Endurance" }, { id: "e", name: "Two Mile Tom" }, { id: "f", name: "Marathon Man" }] },
  { id: "r6", time: "17:30", name: "Wolferton Stakes (Listed)", runners: [
    { id: "a", name: "Royal Standard" }, { id: "b", name: "Windsor Knot" }, { id: "c", name: "Berkshire Boy" }, { id: "d", name: "Sandringham" }] },
  { id: "r7", time: "18:05", name: "Copper Horse Stakes (Handicap)", runners: [
    { id: "a", name: "Copper Beech" }, { id: "b", name: "Last Hurrah" }, { id: "c", name: "Twilight Run" }, { id: "d", name: "Closing Time" }, { id: "e", name: "Sundowner" }] },
];

export const SAMPLE_NAP = { raceId: "r3", runnerId: "b" };

// Shown only in local demo mode (no Supabase). The live board reads Supabase.
export const SEED_BOARD = [
  { name: "TrackHawk", points: 5 }, { name: "AnneMarie", points: 4 },
  { name: "theRailbird", points: 4 }, { name: "GallopGav", points: 3 },
  { name: "SilkRoad", points: 3 },
];
