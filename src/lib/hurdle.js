// Daily Hurdle (racing-name Wordle). The answer is a single word/name; the
// category is the fair hint, with two optional clues (clue anytime, clue2
// offered after 4 wrong guesses). Variable length.
//
// Difficulty tiers (t): 1 easy, 2 medium, 3 hard. The weekday picks the tier
// (Mon/Tue easy, Wed/Thu/Sun medium, Fri/Sat hard) so the week ramps up and
// the pool cycles per-tier — no repeats for months.
export const SAMPLE_HURDLE = {
  answer: "ASCOT",
  category: "Racecourse",
  clue: "Top hats and a royal procession in June.",
  clue2: "Berkshire home of the Royal meeting.",
};

export const MAX_GUESSES = 6;

export const POOL = [
  // ── Racecourses ──────────────────────────────────────────────────────
  { answer: "ASCOT", category: "Racecourse", t: 1, clue: "Top hats and a royal procession in June.", clue2: "Berkshire home of the Royal meeting." },
  { answer: "EPSOM", category: "Racecourse", t: 1, clue: "Downs where the blue riband is decided.", clue2: "Surrey home of the Derby and Oaks." },
  { answer: "AINTREE", category: "Racecourse", t: 1, clue: "A test over national fences.", clue2: "Merseyside home of the Grand National." },
  { answer: "GOODWOOD", category: "Racecourse", t: 1, clue: "High on the Sussex Downs.", clue2: "Hosts the 'Glorious' summer festival." },
  { answer: "NEWMARKET", category: "Racecourse", t: 1, clue: "The headquarters town.", clue2: "HQ of British flat racing, home of the Guineas." },
  { answer: "CHELTENHAM", category: "Racecourse", t: 1, clue: "Where the roar greets the jumpers.", clue2: "Home of the Gold Cup and March Festival." },
  { answer: "YORK", category: "Racecourse", t: 1, clue: "The Knavesmire, in the north.", clue2: "Yorkshire course of the Ebor." },
  { answer: "DONCASTER", category: "Racecourse", t: 2, clue: "Town Moor, the season's final Classic.", clue2: "Yorkshire home of the St Leger." },
  { answer: "SANDOWN", category: "Racecourse", t: 2, clue: "An uphill Surrey finish.", clue2: "Esher track of the Eclipse and Tingle Creek." },
  { answer: "KEMPTON", category: "Racecourse", t: 2, clue: "Sunbury floodlights, a Boxing Day showpiece.", clue2: "Hosts the King George VI Chase." },
  { answer: "HAYDOCK", category: "Racecourse", t: 2, clue: "A galloping north-west track.", clue2: "Lancashire home of the Sprint Cup." },
  { answer: "NEWBURY", category: "Racecourse", t: 2, clue: "A Berkshire track famous for big winter trials.", clue2: "Stages the Lockinge and Hennessy-history chase." },
  { answer: "CHESTER", category: "Racecourse", t: 2, clue: "Tight turns inside Roman walls.", clue2: "The Roodee — Britain's oldest racecourse." },
  { answer: "AYR", category: "Racecourse", t: 2, clue: "Scotland's biggest track.", clue2: "Home of the Scottish National and a famous Gold Cup sprint." },
  { answer: "WINDSOR", category: "Racecourse", t: 2, clue: "Monday evenings beside the Thames.", clue2: "A figure-of-eight track under a royal castle." },
  { answer: "LINGFIELD", category: "Racecourse", t: 2, clue: "Surrey's all-weather regular.", clue2: "Winter flat racing on the polytrack." },
  { answer: "CURRAGH", category: "Racecourse", t: 2, clue: "The plain where Irish Classics are run.", clue2: "County Kildare's flat HQ." },
  { answer: "LEOPARDSTOWN", category: "Racecourse", t: 2, clue: "Dublin's Christmas festival stage.", clue2: "South Dublin track, home of the Irish Champion." },
  { answer: "PUNCHESTOWN", category: "Racecourse", t: 2, clue: "Ireland's end-of-season jumps party.", clue2: "Kildare festival every late April." },
  { answer: "LONGCHAMP", category: "Racecourse", t: 2, clue: "First Sunday in October, Paris.", clue2: "Home of the Arc, in the Bois de Boulogne." },
  { answer: "FLEMINGTON", category: "Racecourse", t: 2, clue: "The race that stops a nation.", clue2: "Melbourne Cup's home track." },
  { answer: "MEYDAN", category: "Racecourse", t: 2, clue: "A desert grandstand a mile long.", clue2: "Dubai World Cup's home." },
  { answer: "CHANTILLY", category: "Racecourse", t: 3, clue: "French elegance beside a château.", clue2: "Home of the French Derby." },
  { answer: "DEAUVILLE", category: "Racecourse", t: 3, clue: "August racing by the Normandy seaside.", clue2: "France's summer holiday meeting." },
  { answer: "SARATOGA", category: "Racecourse", t: 3, clue: "America's August graveyard of champions.", clue2: "Upstate New York's historic summer track." },
  { answer: "KEENELAND", category: "Racecourse", t: 3, clue: "Bluegrass country's boutique meeting.", clue2: "Lexington, Kentucky's famous track and sales ring." },
  { answer: "MUSSELBURGH", category: "Racecourse", t: 3, clue: "Racing by the Firth of Forth.", clue2: "Edinburgh's seaside course." },
  { answer: "CHEPSTOW", category: "Racecourse", t: 3, clue: "Wales' biggest day comes here each winter.", clue2: "Home of the Welsh National." },
  { answer: "UTTOXETER", category: "Racecourse", t: 3, clue: "A Midlands marathon each March.", clue2: "Staffordshire home of the Midlands National." },
  { answer: "FONTWELL", category: "Racecourse", t: 3, clue: "Its chase course is a figure of eight.", clue2: "Small Sussex jumps track." },
  { answer: "PERTH", category: "Racecourse", t: 3, clue: "Britain's most northerly course.", clue2: "Scottish jumps track in a castle's grounds." },
  { answer: "WETHERBY", category: "Racecourse", t: 3, clue: "Yorkshire's dedicated jumps venue.", clue2: "Stages the Charlie Hall Chase." },
  { answer: "CATTERICK", category: "Racecourse", t: 3, clue: "A sharp North Yorkshire circuit by a garrison town.", clue2: "Tight, undulating northern track." },
  { answer: "GALWAY", category: "Racecourse", t: 3, clue: "Seven days of Irish summer madness.", clue2: "Ballybrit's famous festival week." },
  { answer: "FAIRYHOUSE", category: "Racecourse", t: 3, clue: "Easter Monday's big Irish chase.", clue2: "County Meath, home of the Irish Grand National." },

  // ── Jockeys ──────────────────────────────────────────────────────────
  { answer: "DETTORI", category: "Jockey", t: 1, clue: "The flying-dismount showman.", clue2: "Frankie ___, the magnificent seven man." },
  { answer: "MOORE", category: "Jockey", t: 1, clue: "Ballydoyle's quietly ruthless rider.", clue2: "Ryan ___, perennial big-race machine." },
  { answer: "MCCOY", category: "Jockey", t: 1, clue: "Twenty titles and four thousand winners.", clue2: "AP ___, champion jumps jockey every year he rode." },
  { answer: "BUICK", category: "Jockey", t: 2, clue: "First call in the royal blue.", clue2: "William ___, Godolphin's number one." },
  { answer: "DOYLE", category: "Jockey", t: 2, clue: "A record-breaking woman in the plate.", clue2: "Hollie ___, married to Tom Marquand." },
  { answer: "MURPHY", category: "Jockey", t: 2, clue: "Killarney-born, flamboyant champion.", clue2: "Oisin ___, multiple champion jockey." },
  { answer: "MARQUAND", category: "Jockey", t: 2, clue: "A globe-trotting big-race rider.", clue2: "Tom ___, partners many Gosden runners." },
  { answer: "PIGGOTT", category: "Jockey", t: 2, clue: "Nine Derbys, 'the Long Fellow'.", clue2: "Lester ___, the greatest of his age." },
  { answer: "BLACKMORE", category: "Jockey", t: 2, clue: "The first woman to win the National.", clue2: "Rachael ___, Honeysuckle's partner." },
  { answer: "WALSH", category: "Jockey", t: 2, clue: "Kauto Star's great partner.", clue2: "Ruby ___, Cheltenham's record rider." },
  { answer: "TOWNEND", category: "Jockey", t: 2, clue: "Closutton's number one.", clue2: "Paul ___, Willie Mullins' first choice." },
  { answer: "KEANE", category: "Jockey", t: 3, clue: "An Irish champion in green silks.", clue2: "Colin ___, often for Juddmonte and Ger Lyons." },
  { answer: "FALLON", category: "Jockey", t: 3, clue: "Six-time champion of a turbulent era.", clue2: "Kieren ___, rode Ouija Board." },
  { answer: "GERAGHTY", category: "Jockey", t: 3, clue: "Green and gold's long-time big-race man.", clue2: "Barry ___, rode for JP McManus." },
  { answer: "SOUMILLON", category: "Jockey", t: 3, clue: "France's flamboyant multiple champion.", clue2: "Christophe ___, Zarkava's rider." },
  { answer: "EDDERY", category: "Jockey", t: 3, clue: "Eleven championships, a legendary rhythm.", clue2: "Pat ___, rode Grundy and Dancing Brave." },
  { answer: "CARSON", category: "Jockey", t: 3, clue: "A pocket dynamo turned TV pundit.", clue2: "Willie ___, five-time champion." },
  { answer: "CAUTHEN", category: "Jockey", t: 3, clue: "The American 'Kid' who conquered Britain.", clue2: "Steve ___, US Triple Crown then UK titles." },
  { answer: "SWINBURN", category: "Jockey", t: 3, clue: "The 'Choirboy' on a Derby runaway.", clue2: "Walter ___, Shergar's jockey." },
  { answer: "SPENCER", category: "Jockey", t: 3, clue: "Famous for hold-up rides from the rear.", clue2: "Jamie ___, twice champion." },

  // ── Trainers ─────────────────────────────────────────────────────────
  { answer: "MULLINS", category: "Trainer", t: 1, clue: "Closutton's all-conquering jumps king.", clue2: "Willie ___, champion in Britain and Ireland." },
  { answer: "GOSDEN", category: "Trainer", t: 1, clue: "Clarehaven's Classic-winning handler.", clue2: "John & Thady ___, trained Enable." },
  { answer: "HENDERSON", category: "Trainer", t: 1, clue: "The Seven Barrows jumping kingpin.", clue2: "Nicky ___, trained Sprinter Sacre." },
  { answer: "APPLEBY", category: "Trainer", t: 2, clue: "Moulton Paddocks' globe-trotter.", clue2: "Charlie ___, Godolphin's flat trainer." },
  { answer: "STOUTE", category: "Trainer", t: 2, clue: "Freemason Lodge's knighted master.", clue2: "Sir Michael ___, six Derby wins." },
  { answer: "NICHOLLS", category: "Trainer", t: 2, clue: "Ditcheat's serial champion.", clue2: "Paul ___, trained Kauto Star and Denman." },
  { answer: "ELLIOTT", category: "Trainer", t: 2, clue: "Cullentra's prolific Irish jumps man.", clue2: "Gordon ___, won Nationals with Tiger Roll." },
  { answer: "HAGGAS", category: "Trainer", t: 2, clue: "Somerville Lodge, Newmarket.", clue2: "William ___, trained Baaeed." },
  { answer: "CECIL", category: "Trainer", t: 2, clue: "Warren Place's gentle genius.", clue2: "Sir Henry ___, Frankel's trainer." },
  { answer: "SKELTON", category: "Trainer", t: 2, clue: "An Alcester jumps yard on the rise.", clue2: "Dan ___, brother of jockey Harry." },
  { answer: "BALDING", category: "Trainer", t: 2, clue: "Kingsclere's big-race regular.", clue2: "Andrew ___, of Park House Stables." },
  { answer: "JOHNSTON", category: "Trainer", t: 3, clue: "'Always Trying' — and winning more than anyone.", clue2: "Mark ___, Middleham's record-setter." },
  { answer: "VARIAN", category: "Trainer", t: 3, clue: "Carlburg's quiet Classic collector.", clue2: "Roger ___, Newmarket flat trainer." },
  { answer: "BECKETT", category: "Trainer", t: 3, clue: "A Hampshire master of middle-distance fillies.", clue2: "Ralph ___, Kimpton Down Stables." },
  { answer: "FAHEY", category: "Trainer", t: 3, clue: "Musley Bank's northern powerhouse.", clue2: "Richard ___, Malton flat trainer." },
  { answer: "PIPE", category: "Trainer", t: 3, clue: "Revolutionised jumps training from Somerset.", clue2: "Martin ___, 15-time champion." },
  { answer: "TIZZARD", category: "Trainer", t: 3, clue: "A Dorset dairy farm turned Gold Cup yard.", clue2: "Colin ___, trained Native River." },
  { answer: "HANNON", category: "Trainer", t: 3, clue: "A Wiltshire dynasty of two-year-old kings.", clue2: "Richard ___, father and son champions." },
  { answer: "CHANNON", category: "Trainer", t: 3, clue: "Scored goals before training winners.", clue2: "Mick ___, ex-England footballer." },
  { answer: "PRESCOTT", category: "Trainer", t: 3, clue: "Heath House's baronet, master of the plot.", clue2: "Sir Mark ___, trained Alpinista's family line." },

  // ── Horses ───────────────────────────────────────────────────────────
  { answer: "FRANKEL", category: "Horse", t: 1, clue: "Fourteen from fourteen — simply the best.", clue2: "Henry Cecil's unbeaten superstar." },
  { answer: "ARKLE", category: "Horse", t: 1, clue: "'Himself' — the Irish chasing colossus.", clue2: "Rated the greatest steeplechaser ever." },
  { answer: "SHERGAR", category: "Horse", t: 1, clue: "A Derby romp, then gone forever.", clue2: "1981 Derby winner, famously kidnapped." },
  { answer: "ENABLE", category: "Horse", t: 1, clue: "A dual-Arc heroine.", clue2: "Gosden mare, ridden by Dettori." },
  { answer: "SECRETARIAT", category: "Horse", t: 1, clue: "Belmont by thirty-one lengths.", clue2: "America's 1973 Triple Crown legend." },
  { answer: "BAAEED", category: "Horse", t: 2, clue: "An unbeaten miling machine.", clue2: "Shadwell's champion of 2022, by Haggas." },
  { answer: "KYPRIOS", category: "Horse", t: 2, clue: "A Coolmore stayer who rules the Cup races.", clue2: "Ascot Gold Cup winner for O'Brien." },
  { answer: "GALILEO", category: "Horse", t: 2, clue: "The sire who shaped a generation.", clue2: "Coolmore champion stallion, son of Sadler's Wells." },
  { answer: "NIJINSKY", category: "Horse", t: 2, clue: "The last colt to land the Triple Crown.", clue2: "1970 Triple Crown winner for Vincent O'Brien." },
  { answer: "DENMAN", category: "Horse", t: 2, clue: "'The Tank' from Ditcheat.", clue2: "2008 Gold Cup winner, Kauto Star's great rival." },
  { answer: "STRADIVARIUS", category: "Horse", t: 2, clue: "A golden-hooped fiddle of a stayer.", clue2: "Won the Ascot Gold Cup three times." },
  { answer: "ISTABRAQ", category: "Horse", t: 2, clue: "Three Champion Hurdles in green and gold.", clue2: "JP McManus's brilliant hurdler." },
  { answer: "ALTIOR", category: "Horse", t: 2, clue: "Nineteen straight over obstacles.", clue2: "Henderson's two-mile chasing star." },
  { answer: "HONEYSUCKLE", category: "Horse", t: 2, clue: "An unbeaten mare and her history-making rider.", clue2: "Champion Hurdle winner under Blackmore." },
  { answer: "CAMELOT", category: "Horse", t: 2, clue: "A knightly name, nearly a Triple Crown.", clue2: "2012 Guineas and Derby winner." },
  { answer: "WINX", category: "Horse", t: 2, clue: "Thirty-three straight down under.", clue2: "Australia's four-time Cox Plate mare." },
  { answer: "JUSTIFY", category: "Horse", t: 2, clue: "Undefeated, wire to Triple Crown wire.", clue2: "America's 2018 Triple Crown winner." },
  { answer: "SEABISCUIT", category: "Horse", t: 2, clue: "The little underdog who lifted a nation.", clue2: "Depression-era American hero, beat War Admiral." },
  { answer: "YEATS", category: "Horse", t: 3, clue: "A poet's name, four Gold Cups.", clue2: "Ascot's greatest stayer, statue by the paddock." },
  { answer: "FAUGHEEN", category: "Horse", t: 3, clue: "'The Machine' from Closutton.", clue2: "2015 Champion Hurdle winner." },
  { answer: "DOUVAN", category: "Horse", t: 3, clue: "The brilliant one who broke hearts at short odds.", clue2: "Mullins' spectacular two-mile chaser." },
  { answer: "SHISHKIN", category: "Horse", t: 3, clue: "A composer's name over fences.", clue2: "Henderson chaser, epic duel with Energumene." },
  { answer: "ENERGUMENE", category: "Horse", t: 3, clue: "French-bred fireball of the two-mile division.", clue2: "Mullins' dual Champion Chase winner." },
  { answer: "QUEVEGA", category: "Horse", t: 3, clue: "Six in a row at the Festival.", clue2: "Mullins' record-breaking mare." },
  { answer: "VAUTOUR", category: "Horse", t: 3, clue: "A vulture by name, a swooper by style.", clue2: "Brilliant Mullins chaser, gone too soon." },
  { answer: "GOLDIKOVA", category: "Horse", t: 3, clue: "Three straight at the Breeders' Cup.", clue2: "France's champion mile mare." },
  { answer: "TREVE", category: "Horse", t: 3, clue: "Back-to-back in the Bois de Boulogne.", clue2: "Dual Arc-winning French mare." },
  { answer: "ZARKAVA", category: "Horse", t: 3, clue: "Unbeaten, imperious, retired at three.", clue2: "The Aga Khan's 2008 Arc heroine." },
  { answer: "ALLEGED", category: "Horse", t: 3, clue: "Twice around Longchamp first.", clue2: "Dual Arc winner for Vincent O'Brien." },
  { answer: "FOINAVON", category: "Horse", t: 3, clue: "The 100/1 shot who missed the pile-up.", clue2: "1967 Grand National's famous fence is named for him." },
  { answer: "ALDANITI", category: "Horse", t: 3, clue: "Half of racing's great comeback story.", clue2: "Bob Champion's 1981 National winner." },
  { answer: "CRISP", category: "Horse", t: 3, clue: "Ran the bravest losing National of all.", clue2: "Caught by Red Rum in 1973." },
  { answer: "DAYJUR", category: "Horse", t: 3, clue: "Jumped a shadow with the race won.", clue2: "1990's champion sprinter's Breeders' Cup heartbreak." },
  { answer: "LOCHSONG", category: "Horse", t: 3, clue: "Dettori called her a Ferrari.", clue2: "Champion sprint mare of the early 90s." },
  { answer: "DUBAWI", category: "Horse", t: 3, clue: "Godolphin's breed-shaping patriarch.", clue2: "Champion sire, son of Dubai Millennium." },
  { answer: "KINGMAN", category: "Horse", t: 3, clue: "A brilliant miler turned top sire.", clue2: "Juddmonte's 2014 Guineas runner-up, sire of stars." },
  { answer: "MONTJEU", category: "Horse", t: 3, clue: "Imperious Arc winner, sire of Derby winners.", clue2: "Sired Camelot and Pour Moi." },

  // ── Races ────────────────────────────────────────────────────────────
  { answer: "DERBY", category: "Race", t: 1, clue: "The blue riband on the Downs.", clue2: "Epsom's premier Classic, first Saturday in June." },
  { answer: "NATIONAL", category: "Race", t: 1, clue: "Thirty fences, the world watching.", clue2: "The Grand ___ at Aintree." },
  { answer: "OAKS", category: "Race", t: 2, clue: "The fillies' turn on Epsom's Friday.", clue2: "Epsom Classic for three-year-old fillies." },
  { answer: "GUINEAS", category: "Race", t: 2, clue: "The Rowley Mile's spring double.", clue2: "Newmarket's 1000 and 2000." },
  { answer: "LEGER", category: "Race", t: 2, clue: "The oldest Classic of them all.", clue2: "The St ___, Doncaster in September." },
  { answer: "EBOR", category: "Race", t: 2, clue: "York's famous August handicap.", clue2: "The Knavesmire's big betting race." },
  { answer: "ECLIPSE", category: "Race", t: 2, clue: "Named for an unbeaten legend, run at Esher.", clue2: "Sandown's July Group 1." },
  { answer: "SUSSEX", category: "Race", t: 3, clue: "Glorious Goodwood's mile championship.", clue2: "Frankel won it twice." },
  { answer: "NUNTHORPE", category: "Race", t: 3, clue: "Five furlongs flat out on the Knavesmire.", clue2: "York's August Group 1 sprint." },
  { answer: "CESAREWITCH", category: "Race", t: 3, clue: "An autumn marathon named for a Russian prince.", clue2: "Newmarket's long-distance October handicap." },
  { answer: "WOKINGHAM", category: "Race", t: 3, clue: "A cavalry-charge sprint at the royal meeting.", clue2: "Royal Ascot's Saturday sprint handicap." },
  { answer: "LINCOLN", category: "Race", t: 3, clue: "The flat season's traditional curtain-raiser.", clue2: "Doncaster's late-March mile handicap." },
  { answer: "DEWHURST", category: "Race", t: 3, clue: "Where next year's Guineas favourite is crowned.", clue2: "Newmarket's top two-year-old race." },
  { answer: "GIMCRACK", category: "Race", t: 3, clue: "Win it and your owner gives a speech.", clue2: "York's historic juvenile sprint." },
  { answer: "TRIUMPH", category: "Race", t: 3, clue: "The four-year-old hurdlers' Festival crown.", clue2: "Cheltenham's juvenile hurdle." },
  { answer: "SUPREME", category: "Race", t: 3, clue: "The roar that opens the Festival.", clue2: "Cheltenham's first race, a novices' hurdle." },

  // ── Racing operations & training bases ───────────────────────────────
  { answer: "GODOLPHIN", category: "Racing operation", t: 2, clue: "The royal blue army of Dubai.", clue2: "Sheikh Mohammed's global stable." },
  { answer: "COOLMORE", category: "Racing operation", t: 2, clue: "Tipperary's breeding superpower.", clue2: "The O'Brien-linked stallion empire." },
  { answer: "JUDDMONTE", category: "Racing operation", t: 3, clue: "Green, pink and white — and one perfect horse.", clue2: "Prince Khalid Abdullah's operation; bred Frankel." },
  { answer: "SHADWELL", category: "Racing operation", t: 3, clue: "Blue and white epaulettes, Arabic roots.", clue2: "The Hamdan Al Maktoum operation; raced Baaeed." },
  { answer: "BALLYDOYLE", category: "Training base", t: 2, clue: "Tipperary's gallops of champions.", clue2: "Aidan O'Brien's training base." },
  { answer: "DITCHEAT", category: "Training base", t: 3, clue: "A Somerset village of Gold Cup dreams.", clue2: "Paul Nicholls' yard." },
  { answer: "CLOSUTTON", category: "Training base", t: 3, clue: "Carlow's conveyor belt of Festival winners.", clue2: "Willie Mullins' base." },
  { answer: "LAMBOURN", category: "Training base", t: 3, clue: "The Valley of the Racehorse.", clue2: "Berkshire's famous training village." },
  { answer: "MIDDLEHAM", category: "Training base", t: 3, clue: "A Yorkshire castle town of gallops.", clue2: "Northern training centre in Wensleydale." },
  { answer: "MALTON", category: "Training base", t: 3, clue: "Yorkshire's other great training town.", clue2: "Richard Fahey's neighbourhood." },

  // ── Racing terms ─────────────────────────────────────────────────────
  { answer: "FURLONG", category: "Racing term", t: 1, clue: "Two hundred and twenty yards of it.", clue2: "An eighth of a mile." },
  { answer: "JOCKEY", category: "Racing term", t: 1, clue: "The one doing the steering.", clue2: "Rides at around nine stone." },
  { answer: "PADDOCK", category: "Racing term", t: 1, clue: "Where they parade before the off.", clue2: "The parade ring." },
  { answer: "HURDLE", category: "Racing term", t: 1, clue: "This game's namesake obstacle.", clue2: "Smaller and faster than a fence." },
  { answer: "SILKS", category: "Racing term", t: 2, clue: "What tells the colours apart.", clue2: "The jockey's racing colours." },
  { answer: "MAIDEN", category: "Racing term", t: 2, clue: "Still chasing a first success.", clue2: "A horse yet to win a race." },
  { answer: "STAYER", category: "Racing term", t: 2, clue: "Built for the trip, not the dash.", clue2: "A horse suited to long distances." },
  { answer: "GOING", category: "Racing term", t: 2, clue: "Soft, good or firm underfoot.", clue2: "The state of the ground." },
  { answer: "HANDICAP", category: "Racing term", t: 2, clue: "Weights to level the field.", clue2: "A race where horses carry different weights." },
  { answer: "TIPSTER", category: "Racing term", t: 2, clue: "Sells you the winner — allegedly.", clue2: "Someone who gives racing selections." },
  { answer: "PHOTO", category: "Racing term", t: 2, clue: "Called when it's too tight to split.", clue2: "A ___ finish." },
  { answer: "GALLOP", category: "Racing term", t: 2, clue: "Where the morning work is done.", clue2: "A horse's fastest pace." },
  { answer: "GELDING", category: "Racing term", t: 2, clue: "He won't be off to stud.", clue2: "A castrated male horse." },
  { answer: "FILLY", category: "Racing term", t: 2, clue: "She's four or younger.", clue2: "A young female horse." },
  { answer: "STALLION", category: "Racing term", t: 2, clue: "His second career pays the best.", clue2: "A breeding male horse." },
  { answer: "BLINKERS", category: "Racing term", t: 2, clue: "Headgear for the easily distracted.", clue2: "Keep a horse looking forwards." },
  { answer: "NOVICE", category: "Racing term", t: 2, clue: "New to this jumping game.", clue2: "A horse early in its career over obstacles." },
  { answer: "STALLS", category: "Racing term", t: 2, clue: "They spring open at the off.", clue2: "The starting gates on the flat." },
  { answer: "BRIDLE", category: "Racing term", t: 3, clue: "Travelling sweetly: 'on the ___'.", clue2: "The headgear that controls the horse." },
  { answer: "STEEPLE", category: "Racing term", t: 3, clue: "___chase territory.", clue2: "Racing over big fences." },
  { answer: "FAVOURITE", category: "Racing term", t: 3, clue: "The 'jolly' at the head of the market.", clue2: "The most fancied runner." },
  { answer: "YEARLING", category: "Racing term", t: 3, clue: "One candle on the cake, already at the sales.", clue2: "A one-year-old horse." },
  { answer: "BUMPER", category: "Racing term", t: 3, clue: "A jumps card's race with no jumps.", clue2: "A National Hunt flat race." },
  { answer: "NURSERY", category: "Racing term", t: 3, clue: "A handicap strictly for the babies.", clue2: "A two-year-olds' handicap." },
  { answer: "CHASER", category: "Racing term", t: 3, clue: "Tackles the biggest obstacles.", clue2: "A horse that races over fences." },
  { answer: "WALKOVER", category: "Racing term", t: 3, clue: "Win by simply turning up.", clue2: "A one-runner race." },
  { answer: "ENQUIRY", category: "Racing term", t: 3, clue: "The klaxon that freezes the payout.", clue2: "A stewards' review of the race." },
  { answer: "FETLOCK", category: "Racing term", t: 3, clue: "The ankle that takes the strain.", clue2: "The joint above a horse's hoof." },
  { answer: "FARRIER", category: "Racing term", t: 3, clue: "Racing's blacksmith.", clue2: "Fits the racing plates." },
  { answer: "APPRENTICE", category: "Racing term", t: 3, clue: "Young, hungry, and claiming off the back.", clue2: "A young flat rider with a weight allowance." },
  { answer: "CLERK", category: "Racing term", t: 3, clue: "Of the course — ground reports are their problem.", clue2: "The official who manages the track." },
];

// Deterministic daily pick: same word for everyone on a given date.
// Weekday sets the tier: Mon/Tue easy(1), Wed/Thu/Sun medium(2), Fri/Sat hard(3).
export function autoWord(day) {
  const dayNum = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000);
  const weekday = new Date(day + "T00:00:00Z").getUTCDay(); // 0=Sun..6=Sat
  const tier = weekday === 1 || weekday === 2 ? 1 : weekday === 5 || weekday === 6 ? 3 : 2;
  const candidates = POOL.filter((w) => w.t === tier);
  const pool = candidates.length ? candidates : POOL;
  return pool[((dayNum % pool.length) + pool.length) % pool.length];
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

// Personal stats from localStorage play history (hurdle_YYYY-MM-DD keys).
export function localStats() {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let played = 0, won = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!/^hurdle_\d{4}-\d{2}-\d{2}$/.test(k)) continue;
      const v = JSON.parse(localStorage.getItem(k) || "null");
      if (!v || v.status === "playing") continue;
      played++;
      if (v.status === "won") { won++; const n = (v.guesses || []).length; if (dist[n] != null) dist[n]++; }
    }
    const s = JSON.parse(localStorage.getItem("hurdle_streak") || "null") || {};
    return { played, won, pct: played ? Math.round((100 * won) / played) : 0, dist, streak: s.streak || 0, best: s.best || 0 };
  } catch {
    return { played: 0, won: 0, pct: 0, dist, streak: 0, best: 0 };
  }
}
