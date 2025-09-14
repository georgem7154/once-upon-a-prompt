import leoProfanity from "leo-profanity";
// Optional: Customize profanity dictionary
leoProfanity.add(['ai overlord', 'rogue']); // allow creative terms
leoProfanity.remove(['god']); // prevent false positives

export function isCleanPrompt(prompt) {
  const lower = prompt.toLowerCase();
const harmfulKeywords = [
  // Adult / Sexual Content
  "porn","xxx","sex","nude","naked","boobs","tits","cock","dick","pussy","ass","fuck","fucking","fucked","slut","whore","rape","raping","rapist","orgy","incest","fetish","erotic","masturbate","masturbation","horny","cum","cumming","sperm","anal","blowjob","handjob","clit","clitoris","dildo","vibrator","bdsm","bondage","escort","prostitute","strip","stripper","lust","kinky","hentai","onlyfans","camgirl",

  // Violence / Gore
  "murder","kill","killing","killer","stab","stabbing","shoot","shooting","gun","guns","pistol","rifle","shotgun","massacre","blood","gore","torture","slaughter","bomb","bombing","explosion","terrorist","terrorism","isis","suicide bomber","beheading","execution","grenade","landmine","napalm","sniper","gunfight",

  // Drugs / Substance Abuse
  "drug","drugs","weed","marijuana","cannabis","ganja","pot","hash","hashish","cocaine","meth","methamphetamine","ecstasy","mdma","lsd","acid","heroin","opioid","fentanyl","adderall","xanax","oxy","oxycodone","percocet","ketamine","molly","shrooms","psychedelics","inject","overdose","stoned","high","dealer","drugdeal","cartel",

  // Self-Harm / Suicide
  "suicide","kill myself","kms","selfharm","cutting","cut myself","slit wrists","bleed out","hang myself","jump off","overdose","end my life","die","death","noose","depression","i want to die","unalive","starve","anorexia","bulimia","thinspo","proana","self harm","burn myself","pills","suicidal",

  // Hate Speech / Bullying
  "hate","racist","racism","nazi","white power","kkk","klan","neo-nazi","bigot","slur","fag","faggot","dyke","tranny","retard","retarded","cripple","spic","chink","gook","nigger","negro","coon","sandnigger","islamophobic","antisemitic","holocaust denial","slave","lynch","bully","harass","harassment","troll","cyberbully",

  // Gambling / Illegal
  "gamble","casino","bet","betting","poker","lottery","blackjack","slots","wager","bookie","sportsbook","matchfix","rigged","money laundering","scam","fraud","phishing","hack","hacking","crack","keygen","pirated","torrent","warez","illegal","counterfeit","deepweb","darkweb","silkroad",

  // Unsafe / Predatory
  "pedo","pedophile","child porn","cp","underage","minor","loli","shota","groom","grooming","incest","brother and sister","father daughter","mom son","rape fantasy","molest","molestation","abduct","kidnap","child abuse","csa","sex trafficking","human trafficking","exploit","predator","perv","pervert",

  // Misc Harms
  "bomb threat","school shooting","columbine","hitler","gas chamber","9/11","terror attack","anthrax","radiation","nuclear","poison","cyanide","arsenic","chloroform","roofies","rohypnol","date rape drug","knife","blade","shiv","shank"
];


const containsHarm = harmfulKeywords.some(word => {
  const regex = new RegExp(`\\b${word}\\b`, "i"); // case-insensitive, whole word
  return regex.test(lower);
});
  const containsProfanity = leoProfanity.check(prompt);

  return !(containsHarm || containsProfanity);
}