import { useState, useEffect, useMemo } from "react";

// ── In-memory cache (works in all environments) ───────────────────────────────
const CACHE = new Map();
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function cGet(k)    { return CACHE.get(k) || null; }
function cSet(k, v) { CACHE.set(k, v); }
function cKey(...parts) { return parts.join("|"); }

// ── Data ──────────────────────────────────────────────────────────────────────
const ALBUMS = [
  { id:"please",    year:1963, releaseDate:"1963-03-22", title:"Please Please Me",                       color:"#c0392b", tc:"#fff", songs:["I Saw Her Standing There","Misery","Anna (Go to Him)","Chains","Boys","Ask Me Why","Please Please Me","Love Me Do","P.S. I Love You","Baby It's You","Do You Want to Know a Secret","A Taste of Honey","There's a Place","Twist and Shout"] },
  { id:"with",      year:1963, releaseDate:"1963-11-22", title:"With the Beatles",                       color:"#2a2a2a", tc:"#fff", songs:["It Won't Be Long","All I've Got to Do","All My Loving","Don't Bother Me","Little Child","Till There Was You","Please Mister Postman","Roll Over Beethoven","Hold Me Tight","You Really Got a Hold on Me","I Wanna Be Your Man","Devil in Her Heart","Not a Second Time","Money (That's What I Want)"] },
  { id:"harddays",  year:1964, releaseDate:"1964-07-10", title:"A Hard Day's Night",                     color:"#d4820a", tc:"#fff", songs:["A Hard Day's Night","I Should Have Known Better","If I Fell","I'm Happy Just to Dance with You","And I Love Her","Tell Me Why","Can't Buy Me Love","Any Time at All","I'll Cry Instead","Things We Said Today","When I Get Home","You Can't Do That","I'll Be Back"] },
  { id:"forsale",   year:1964, releaseDate:"1964-12-04", title:"Beatles for Sale",                       color:"#7a4e2a", tc:"#fff", songs:["No Reply","I'm a Loser","Baby's in Black","Rock and Roll Music","I'll Follow the Sun","Mr. Moonlight","Kansas City","Eight Days a Week","Words of Love","Honey Don't","Every Little Thing","I Don't Want to Spoil the Party","What You're Doing","Everybody's Trying to Be My Baby"] },
  { id:"help",      year:1965, releaseDate:"1965-08-06", title:"Help!",                                  color:"#1a5fa8", tc:"#fff", songs:["Help!","The Night Before","You've Got to Hide Your Love Away","I Need You","Another Girl","You're Going to Lose That Girl","Ticket to Ride","Act Naturally","It's Only Love","You Like Me Too Much","Tell Me What You See","I've Just Seen a Face","Yesterday","Dizzy Miss Lizzy"] },
  { id:"rubber",    year:1965, releaseDate:"1965-12-03", title:"Rubber Soul",                            color:"#a07020", tc:"#fff", songs:["Drive My Car","Norwegian Wood (This Bird Has Flown)","You Won't See Me","Nowhere Man","Think for Yourself","The Word","Michelle","What Goes On","Girl","I'm Looking Through You","In My Life","Wait","If I Needed Someone","Run for Your Life"] },
  { id:"revolver",  year:1966, releaseDate:"1966-08-05", title:"Revolver",                               color:"#303030", tc:"#fff", songs:["Taxman","Eleanor Rigby","I'm Only Sleeping","Love You To","Here, There and Everywhere","Yellow Submarine","She Said She Said","Good Day Sunshine","And Your Bird Can Sing","For No One","Doctor Robert","I Want to Tell You","Got to Get You into My Life","Tomorrow Never Knows"] },
  { id:"sgt",       year:1967, releaseDate:"1967-06-01", title:"Sgt. Pepper's Lonely Hearts Club Band", color:"#9a1e1e", tc:"#fff", songs:["Sgt. Pepper's Lonely Hearts Club Band","With a Little Help from My Friends","Lucy in the Sky with Diamonds","Getting Better","Fixing a Hole","She's Leaving Home","Being for the Benefit of Mr. Kite!","Within You Without You","When I'm Sixty-Four","Lovely Rita","Good Morning Good Morning","A Day in the Life"] },
  { id:"mmtour",    year:1967, releaseDate:"1967-11-27", title:"Magical Mystery Tour",                   color:"#5a3090", tc:"#fff", songs:["Magical Mystery Tour","The Fool on the Hill","Flying","Blue Jay Way","Your Mother Should Know","I Am the Walrus","Hello, Goodbye","Strawberry Fields Forever","Penny Lane","Baby You're a Rich Man","All You Need Is Love"] },
  { id:"white",     year:1968, releaseDate:"1968-11-22", title:"The White Album",                        color:"#dedad2", tc:"#1a1208", songs:["Back in the U.S.S.R.","Dear Prudence","Glass Onion","Ob-La-Di, Ob-La-Da","Wild Honey Pie","The Continuing Story of Bungalow Bill","While My Guitar Gently Weeps","Happiness Is a Warm Gun","Martha My Dear","I'm So Tired","Blackbird","Piggies","Rocky Raccoon","Don't Pass Me By","Why Don't We Do It in the Road?","I Will","Julia","Birthday","Yer Blues","Mother Nature's Son","Everybody's Got Something to Hide Except Me and My Monkey","Sexy Sadie","Helter Skelter","Long, Long, Long","Revolution 1","Honey Pie","Savoy Truffle","Cry Baby Cry","Revolution 9","Good Night"] },
  { id:"yellow",    year:1969, releaseDate:"1969-01-17", title:"Yellow Submarine",                       color:"#b89000", tc:"#fff", songs:["Yellow Submarine","Only a Northern Song","All Together Now","Hey Bulldog","It's All Too Much","All You Need Is Love"] },
  { id:"abbeyroad", year:1969, releaseDate:"1969-09-26", title:"Abbey Road",                             color:"#1e6e44", tc:"#fff", songs:["Come Together","Something","Maxwell's Silver Hammer","Oh! Darling","Octopus's Garden","I Want You (She's So Heavy)","Here Comes the Sun","Because","You Never Give Me Your Money","Sun King","Mean Mr. Mustard","Polythene Pam","She Came In Through the Bathroom Window","Golden Slumbers","Carry That Weight","The End","Her Majesty"] },
  { id:"letitbe",   year:1970, releaseDate:"1970-05-08", title:"Let It Be",                              color:"#6e1212", tc:"#fff", songs:["Two of Us","Dig a Pony","Across the Universe","I Me Mine","Dig It","Let It Be","Maggie Mae","I've Got a Feeling","One After 909","The Long and Winding Road","For You Blue","Get Back"] },
];

const ALL_SONGS = ALBUMS.flatMap(a => a.songs.map(s => ({ song:s, album:a })));

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d) {
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

const MEMBERS = [
  { id:"john",   name:"John Lennon",     color:"#c0392b", emoji:"🎸" },
  { id:"paul",   name:"Paul McCartney",  color:"#d4820a", emoji:"🎵" },
  { id:"george", name:"George Harrison", color:"#1a5fa8", emoji:"🎶" },
  { id:"ringo",  name:"Ringo Starr",     color:"#1e6e44", emoji:"🥁" },
];

const ERAS = [
  { id:"hamburg",    label:"Hamburg Era",   range:"1960–1962" },
  { id:"early",      label:"Beatlemania",   range:"1963–1964" },
  { id:"mid",        label:"Studio Years",  range:"1965–1966" },
  { id:"psychedelic",label:"Psychedelic",   range:"1967–1968" },
  { id:"late",       label:"Let It Be Era", range:"1969–1970" },
];

// ── Favourites (in-memory) ────────────────────────────────────────────────────
// Note: persisting favs requires localStorage which isn't available here.
// For a standalone HTML version, favs persist across sessions.

// ── Claude API with web_search for accuracy ───────────────────────────────────
async function callClaude(prompt, maxTokens = 1500, useWebSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  // Collect all text blocks (web_search may return multiple)
  const text = data.content
    .filter(b => b.type === "text")
    .map(b => b.text || "")
    .join("")
    .replace(/```json[\s\S]*?```/g, m => m.slice(7, -3))
    .replace(/```/g, "")
    .trim();
  return text;
}
const CHORD_DATA = {
  "I Saw Her Standing There": {
    key: "E",
    sections: [
      { name: "Verse", lines: [
        { chords: ["E7","","A7","E7"], lyric: "Well she was just seventeen and you know what I mean" },
        { chords: ["","","","B7"], lyric: "And the way she looked was way beyond compare" },
        { chords: ["E","E7","A7","C7"], lyric: "So how could I dance with another oh" },
        { chords: ["E7","B7","E7",""], lyric: "When I saw her standing there" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["A7","","E7",""], lyric: "Well we danced through the night" },
        { chords: ["A7","","E7",""], lyric: "And we held each other tight" },
        { chords: ["","","","B7"], lyric: "And before too long I fell in love with her" },
        { chords: ["E","E7","A7",""], lyric: "Now I'll never dance with another" },
        { chords: ["C7","E7","B7","E7"], lyric: "Oh since I saw her standing there" },
      ]},
      { name: "Outro", lines: [
        { chords: ["A7","","",""], lyric: "Well my heart went boom when I crossed that room" },
        { chords: ["","B7","A7",""], lyric: "And I held her hand in mine" },
        { chords: ["E7","B7","E7",""], lyric: "Since I saw her standing there" },
      ]},
    ]
  },

  "Misery": {
    key: "C",
    sections: [
      { name: "Verse", lines: [
        { chords: ["F","","G",""], lyric: "The world is treating me bad" },
        { chords: ["C","Am","G",""], lyric: "Misery" },
        { chords: ["C","","F",""], lyric: "I'm the kind of guy" },
        { chords: ["C","","F",""], lyric: "Who never used to cry" },
        { chords: ["F","","G",""], lyric: "The world is treating me bad" },
        { chords: ["C","Am","",""], lyric: "Misery!" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["Am","","C",""], lyric: "I'll remember all the little things we've done" },
        { chords: ["Am","","G",""], lyric: "Can't she see she'll always be the only one" },
      ]},
      { name: "Outro", lines: [
        { chords: ["C","Am","",""], lyric: "Without her I will be in misery" },
        { chords: ["C","Am","",""], lyric: "In misery (oh oh oh)" },
        { chords: ["C","","",""], lyric: "Misery" },
      ]},
    ]
  },

  "Anna (Go to Him)": {
    key: "D",
    sections: [
      { name: "Verse", lines: [
        { chords: ["D","Bm","D","Bm"], lyric: "Anna you come and ask me girl to set you free girl" },
        { chords: ["D","Bm","Em","A7"], lyric: "You say he loves you more than me so I will set you free" },
        { chords: ["D","Bm","D","Bm"], lyric: "Go with him (Anna) go with him" },
      ]},
      { name: "Middle", lines: [
        { chords: ["G","","",""], lyric: "All of my life I've been searching for a girl" },
        { chords: ["","D","",""], lyric: "Who'll love me like I love her" },
        { chords: ["G","","Gm",""], lyric: "But every girl I've ever had breaks my heart and leave me sad" },
        { chords: ["E7","","A7",""], lyric: "What am I what am I supposed to do oh" },
      ]},
      { name: "Ending", lines: [
        { chords: ["Bm","D","Bm",""], lyric: "(Anna) go with him (Anna)" },
        { chords: ["D","Bm","D",""], lyric: "You can go with him girl (Anna) go with him" },
      ]},
    ]
  },

  "Chains": {
    key: "A",
    sections: [
      { name: "Verse", lines: [
        { chords: ["A","","","D9"], lyric: "Chains my baby's got me locked up in chains" },
        { chords: ["A","","E9",""], lyric: "That you can see woh these chains of love" },
        { chords: ["D9","A","E",""], lyric: "Got a hold on me yeah" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["D9","","A","A7"], lyric: "Please believe me when I tell you your lips are sweet" },
        { chords: ["D9","","E",""], lyric: "I'd like to kiss them but I can't break away from all of these" },
      ]},
      { name: "Outro", lines: [
        { chords: ["A","","",""], lyric: "Chains chains of love chains of love" },
        { chords: ["D","Dm","A",""], lyric: "Chains of love" },
      ]},
    ]
  },

  "Boys": {
    key: "A",
    sections: [
      { name: "Verse", lines: [
        { chords: ["A","","",""], lyric: "I've been told when a boy kiss a girl" },
        { chords: ["","D","",""], lyric: "Hey hey bop bop em bop em shoo bop" },
        { chords: ["","A","",""], lyric: "Hey hey bop bop em bop em shoo bop" },
        { chords: ["E","","D",""], lyric: "Hey hey hey hey hey" },
        { chords: ["","A","E7",""], lyric: "Yes they say you do" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["E7","","A",""], lyric: "Well I talk about boys yeah yeah" },
        { chords: ["","D","","A"], lyric: "Well I talk about boys now yeah boys" },
        { chords: ["","E7","",""], lyric: "Well I talk about boys now" },
        { chords: ["D","","A","E7"], lyric: "What a bundle of joy" },
      ]},
    ]
  },

  "Ask Me Why": {
    key: "E",
    sections: [
      { name: "Verse", lines: [
        { chords: ["G#m","F#m","","E"], lyric: "I love you cause you tell me things I want to know" },
        { chords: ["G#m","F#m","","E"], lyric: "And it's true that it really only goes to show" },
        { chords: ["C","Am","F#","B"], lyric: "That I I I I should never never never be blue" },
        { chords: ["G#m","F#m","","E"], lyric: "Now you're mine my happiness still makes me cry" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["G#m","","A",""], lyric: "Ask me why I'll say I love you" },
        { chords: ["G#m","","A",""], lyric: "And I'm always thinking of you" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["E+5","A","B","E"], lyric: "I can't believe it's happened to me" },
        { chords: ["E+5","A","B","E"], lyric: "I can't conceive of any more misery" },
      ]},
    ]
  },

  "Please Please Me": {
    key: "E",
    sections: [
      { name: "Intro", lines: [
        { chords: ["E","","",""], lyric: "♪" },
      ]},
      { name: "Verse", lines: [
        { chords: ["E","A","E","G"], lyric: "Last night I said these words to my girl" },
        { chords: ["A*","B","E","A"], lyric: "" },
        { chords: ["E","","A","E"], lyric: "I know you never even try girl" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["A","","F#m",""], lyric: "Come on come on come on come on" },
        { chords: ["C#m","","A*",""], lyric: "Come on come on come on" },
        { chords: ["E","","A",""], lyric: "Please please me whoa yeah" },
        { chords: ["B*","","E",""], lyric: "Like I please you" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["B*","","E",""], lyric: "But you know there's always rain in my heart" },
        { chords: ["A","","",""], lyric: "I do all the pleasing with you" },
        { chords: ["B*","","E",""], lyric: "It's so hard to reason with you" },
        { chords: ["A","B*","E",""], lyric: "Oh yeah why do you make me blue" },
      ]},
      { name: "Outro", lines: [
        { chords: ["E","","A",""], lyric: "Please please me whoa yeah" },
        { chords: ["B*","","",""], lyric: "Like I please you" },
        { chords: ["E","","A",""], lyric: "Please please me whoa yeah" },
        { chords: ["B*","","",""], lyric: "Like I please you" },
        { chords: ["E","","A",""], lyric: "Please please me whoa yeah" },
        { chords: ["B*","E","G","C"], lyric: "Like I please you" },
        { chords: ["B*","E","",""], lyric: "" },
      ]},
    ]
  },

  "Love Me Do": {
    key: "G",
    sections: [
      { name: "Intro", lines: [
        { chords: ["G","","C",""], lyric: "♪" },
      ]},
      { name: "Verse", lines: [
        { chords: ["G","","C",""], lyric: "Love love me do you know I love you" },
        { chords: ["G","","C",""], lyric: "I'll always be true" },
        { chords: ["C","C/G","","G"], lyric: "So pleeeease love me do" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["D","C","F","G"], lyric: "Someone to love somebody new" },
        { chords: ["D","C","F","G"], lyric: "Someone to love someone like you" },
      ]},
      { name: "Outro", lines: [
        { chords: ["G","","C",""], lyric: "Love love me do you know I love you" },
        { chords: ["G","","C",""], lyric: "I'll always be true" },
        { chords: ["C","C/G","","G"], lyric: "So pleeeease love me do" },
        { chords: ["G","C","G","C"], lyric: "Love me do yeah love me do yeah love me do" },
      ]},
    ]
  },

  "P.S. I Love You": {
    key: "D",
    sections: [
      { name: "Verse", lines: [
        { chords: ["G","Gdim","D",""], lyric: "As I write this letter" },
        { chords: ["G","Gdim","D",""], lyric: "Send my love to you" },
        { chords: ["G","Gdim","D",""], lyric: "Remember that I'll always" },
        { chords: ["D","A","D",""], lyric: "Be in love with you" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["D","","Em",""], lyric: "Treasure these few words" },
        { chords: ["","D","",""], lyric: "Till we're together" },
        { chords: ["A","","Bm",""], lyric: "Keep all my love forever" },
        { chords: ["A","","Bb",""], lyric: "P.S. I love you" },
        { chords: ["C","D","",""], lyric: "You you you" },
      ]},
      { name: "Outro", lines: [
        { chords: ["D","","Em","D"], lyric: "I'll be comin' home again to you love" },
        { chords: ["A","","Bm",""], lyric: "Until the day I do love" },
        { chords: ["A","","Bb",""], lyric: "P.S. I love you" },
        { chords: ["C","D","",""], lyric: "You you you" },
        { chords: ["Bb","C","D",""], lyric: "You you you" },
        { chords: ["Bb","C","D",""], lyric: "I love you" },
      ]},
    ]
  },

  "Baby It's You": {
    key: "G",
    sections: [
      { name: "Verse", lines: [
        { chords: ["G","","Em",""], lyric: "Sha la la la la la la" },
        { chords: ["C","","",""], lyric: "It's not the way you smile that touched my heart" },
        { chords: ["","G","",""], lyric: "It's not the way you kiss that tears apart" },
        { chords: ["","Em","",""], lyric: "But how many many many nights go by" },
        { chords: ["Am","","G","Em"], lyric: "I sit alone at home and I cry over you what can I do" },
        { chords: ["C","D","G","Em"], lyric: "Can't help myself cause baby it's you" },
        { chords: ["G","","",""], lyric: "Baby it's you" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["C","","G",""], lyric: "You should hear what they say about you cheat cheat" },
        { chords: ["C","","G",""], lyric: "They say you never never ever been true" },
        { chords: ["","Em","",""], lyric: "Wo ho it doesn't matter what they say" },
        { chords: ["Am","","",""], lyric: "I know I'm gonna love you any old way" },
        { chords: ["G","","Em",""], lyric: "What can I do then it's true" },
        { chords: ["C","","D",""], lyric: "Don't want nobody nobody" },
        { chords: ["G","Em","G",""], lyric: "Cause baby it's you baby it's you" },
      ]},
    ]
  },

  "Do You Want to Know a Secret": {
    key: "E",
    sections: [
      { name: "Intro", lines: [
        { chords: ["Em","","Am","Em"], lyric: "You'll never know how much I really love you" },
        { chords: ["G","","F","B7"], lyric: "You'll never know how much I really care" },
      ]},
      { name: "Verse", lines: [
        { chords: ["E","G#m","Gm","F#m"], lyric: "Listen" },
        { chords: ["B7","E","G#m","Gm"], lyric: "Do you want to know a secret" },
        { chords: ["F#m","B7","E","G#m"], lyric: "Do you promise not to tell" },
        { chords: ["Gm","F#m","F",""], lyric: "Whoa oh oh" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["E","G#m","Gm","F#m"], lyric: "Closer" },
        { chords: ["B7","E","G#m","Gm"], lyric: "Let me whisper in your ear" },
        { chords: ["F#m","B7","A","B7"], lyric: "Say the words you long to hear" },
        { chords: ["C#m","F#m","","B7"], lyric: "I'm in love with you oh" },
      ]},
      { name: "Outro", lines: [
        { chords: ["A","F#m","C#m","Bm"], lyric: "Nobody knows just we two" },
        { chords: ["F#m","B7","",""], lyric: "O" },
      ]},
    ]
  },

  "A Taste of Honey": {
    key: "F#m",
    sections: [
      { name: "Intro", lines: [
        { chords: ["F#m","","A","E"], lyric: "A taste of honey tasting much sweeter than wine" },
      ]},
      { name: "Verse", lines: [
        { chords: ["F#m","F5+","A","B"], lyric: "I dream of your first kiss and then" },
        { chords: ["F#m","F5+","A","B"], lyric: "I feel upon my lips again" },
        { chords: ["F#m","","A","E"], lyric: "A taste of honey tasting much sweeter than wine" },
        { chords: ["F#m","Bm","F#m","Bm"], lyric: "Ta do n doo ta do n doo" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["A","B","F#m","B"], lyric: "Oh I will return yes I will return" },
        { chords: ["A","","E","F#m"], lyric: "I'll come back for the honey and you" },
      ]},
      { name: "Outro", lines: [
        { chords: ["B","","F#m",""], lyric: "That taste of honey tasting much sweeter than wine" },
        { chords: ["F#m","Bm","F#m","Bm"], lyric: "Ta do n doo ta do n doo" },
        { chords: ["Bm","F#m","Bm","F#m"], lyric: "" },
      ]},
    ]
  },

  "There's a Place": {
    key: "E",
    sections: [
      { name: "Verse", lines: [
        { chords: ["E","","A","E"], lyric: "There is a place where I can go" },
        { chords: ["A","E","C#m","B7"], lyric: "When I feel low when I feel blue" },
        { chords: ["A","G#m7","A",""], lyric: "And it's my mind and there's no time" },
        { chords: ["B7","C#m7","",""], lyric: "When I'm alone" },
        { chords: ["E","A","","E"], lyric: "I think of you and things you do" },
        { chords: ["A","E","C#m7","B7"], lyric: "Go round my head the things you said" },
        { chords: ["C#m7","A","B7","E"], lyric: "Like I love only you" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["C#m7","","F#7",""], lyric: "In my mind there's no sorrow" },
        { chords: ["E","","G#m7",""], lyric: "Don't you know that it's so" },
        { chords: ["C#m7","","F#7",""], lyric: "There'll be no sad tomorrow" },
        { chords: ["E","G#m7","C#m7","G#m7"], lyric: "Don't you know that it's so" },
      ]},
    ]
  },

  "Twist and Shout": {
    key: "A",
    sections: [
      { name: "Verse", lines: [
        { chords: ["A7","D","G","A"], lyric: "Well shake it up baby now twist and shout" },
        { chords: ["A7","D","G","A"], lyric: "C'mon c'mon c'mon c'mon baby now" },
        { chords: ["A7","D","G","A"], lyric: "C'mon and work it on out" },
      ]},
      { name: "Chorus", lines: [
        { chords: ["A7","D","G","A"], lyric: "Well work it on out you know you look so good" },
        { chords: ["A7","D","G","A"], lyric: "You know you got me goin' now" },
        { chords: ["A7","D","G","A","A7"], lyric: "Just like I knew you would" },
      ]},
      { name: "Bridge", lines: [
        { chords: ["A7","D","G","A"], lyric: "You know you twist it little girl" },
        { chords: ["A7","D","G","A"], lyric: "You know you twist so fine" },
        { chords: ["A7","D","G","A"], lyric: "C'mon and twist a little closer now" },
        { chords: ["A7","D","G","A","A7"], lyric: "And let me know that you're mine" },
      ]},
      { name: "Outro", lines: [
        { chords: ["A7","D","G","A"], lyric: "Well shake it shake it shake it baby now" },
        { chords: ["A","G","G","G"], lyric: "Ahh ahh ahh ahh" },
      ]},
    ]
  },
};

const INSTRUMENT_DATA = {
  "I Saw Her Standing There": { original:true, writer:"Lennon=McCartney", leadVocal:"Paul McCartney", john:{instruments:["Rickenbacker 325"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gretsch Duo Jet"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Misery": { original:true, writer:"Lennon=McCartney", leadVocal:"John Lennon, Paul McCartney", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Anna (Go to Him)": { original:false, writer:"Arthur Alexander", leadVocal:"John Lennon", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Chains": { original:false, writer:"Gerry Goffin, Carole King", leadVocal:"George Harrison", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Boys": { original:false, writer:"Luther Dixon, Wes Farrell", leadVocal:"Ringo Starr", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gretsch Duo Jet"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Ask Me Why": { original:true, writer:"Lennon=McCartney", leadVocal:"John Lennon", john:{instruments:["Rickenbacker 325"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Please Please Me": { original:true, writer:"Lennon=McCartney", leadVocal:"John Lennon, Paul McCartney", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Love Me Do": { original:true, writer:"Lennon=McCartney", leadVocal:"Paul McCartney, John Lennon", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "P.S. I Love You": { original:true, writer:"Lennon=McCartney", leadVocal:"Paul McCartney", john:{instruments:[]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Baby It's You": { original:false, writer:"Mack David, Barney Williams, Burt Bacharach", leadVocal:"John Lennon", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Do You Want to Know a Secret": { original:true, writer:"Lennon=McCartney", leadVocal:"George Harrison", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "A Taste of Honey": { original:false, writer:"Bobby Scott, Ric Marlow", leadVocal:"Paul McCartney", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "There's a Place": { original:true, writer:"Lennon=McCartney", leadVocal:"John Lennon, Paul McCartney", john:{instruments:["Gibson J-160E"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
  "Twist and Shout": { original:false, writer:"Phil Medley, Bert Russell", leadVocal:"John Lennon", john:{instruments:["Rickenbacker 325"]}, paul:{instruments:["Höfner 500/1 Bass"]}, george:{instruments:["Gibson J-160E"]}, ringo:{instruments:["Premier 58/54 Mahogany"]} },
};

async function getChords(song, album) {
  if (CHORD_DATA[song]) return { data: CHORD_DATA[song], fromCache: false };
  const k = cKey("chords", song, album);
  const cached = cGet(k);
  if (cached) return { data: cached, fromCache: true };

  const raw = await callClaude(
    `Search for and provide the accurate chord progression for the Beatles song "${song}" from the album "${album}".
Use web search to find the most accurate chord chart from sources like Ultimate Guitar, Beatles chords references, or music theory sites.
Return ONLY a JSON object (no markdown, no explanation):
{"key":"G","sections":[{"name":"Verse","lines":[{"chords":["G","Em","C","D"],"lyric":"first few words of that line"}]}]}
Include 2-4 sections (Intro/Verse/Chorus/Bridge/Outro as applicable). Use real lyric snippets. Be musically accurate.`,
    1500,
    false // use web search
  );

  const data = JSON.parse(raw);
  cSet(k, data);
  return { data, fromCache: false };
}

async function getTab(song, album, key, instr) {
  const k = cKey("tab", instr, song, album);
  const cached = cGet(k);
  if (cached) return { data: cached, fromCache: true };

  const instrDesc =
    instr === "guitar" ? "rhythm guitar (strumming/chord patterns)"
    : instr === "bass"  ? "bass guitar (Paul McCartney's bass line, 4 strings G D A E top to bottom)"
    :                     "lead guitar (George Harrison's lead melody, riffs, and solos)";

  const raw = await callClaude(
    `Search for and provide the accurate ${instrDesc} TAB for the Beatles song "${song}" from "${album}" (key: ${key || "?"}).
Use web search to find accurate TAB from sources like Ultimate Guitar, 911tabs, or Beatles TAB references.
Return ONLY a JSON object (no markdown):
{
  "instrument": "${instr}",
  "tuning": "Standard",
  "sections": [
    {
      "name": "Intro",
      "tab": "e|--0--2--3--0--|\\nB|--0--3--0--0--|\\nG|--0--2--0--0--|\\nD|--2--0--2--2--|\\nA|--2-----3--2--|\\nE|--0-----1--0--|"
    }
  ]
}
${instr === "bass" ? "4 strings only: G D A E (top to bottom). Show Paul's actual bass notes." : ""}
Include 2-4 sections. Use real notes from the actual recording. Newlines in tab strings must be \\n.`,
    2000,
    true
  );

  const data = JSON.parse(raw);
  cSet(k, data);
  return { data, fromCache: false };
}

async function getInstruments(song, album) {
  if (INSTRUMENT_DATA[song]) return { data: INSTRUMENT_DATA[song], fromCache: false };
  const k = cKey("inst", song, album);
  const cached = cGet(k);
  if (cached) return { data: cached, fromCache: true };

  const raw = await callClaude(
    `Search for and provide the studio recording instruments used by each Beatle in "${song}" from "${album}".
Use web search to find accurate information from sources like Beatles recording session books, Mark Lewisohn's records, or musicology sites.
Return ONLY JSON (no markdown):
{"john":{"instruments":["Rhythm Guitar","Lead Vocals"]},"paul":{"instruments":["Höfner 500/1 Bass","Vocals"]},"george":{"instruments":["Lead Guitar"]},"ringo":{"instruments":["Ludwig Drum Kit"]}}
Use specific model names where known (e.g. Rickenbacker 325, Höfner 500/1).`,
    1000,
    true
  );

  const data = JSON.parse(raw);
  cSet(k, data);
  return { data, fromCache: false };
}

async function getHistory(eraId) {
  const k = cKey("hist", eraId);
  const cached = cGet(k);
  if (cached) return { data: cached, fromCache: true };

  const era = ERAS.find(e => e.id === eraId);
  const raw = await callClaude(
    `Search for and provide accurate Beatles history events during the ${era.label} period (${era.range}).
Use web search to find historically accurate dates for albums, singles, and major live concerts/tours.
Return ONLY a JSON array of 12-20 events sorted by date (no markdown):
[
  {"type":"album","date":"1963-03-22","title":"Please Please Me","note":"Recorded in a single 585-minute session at EMI Studios, Abbey Road"},
  {"type":"single","date":"1963-01-11","title":"Please Please Me / Ask Me Why","note":"Second single, reached #1 in NME chart"},
  {"type":"live","date":"1963-02-02","venue":"Cavern Club","city":"Liverpool, UK","setlist":["Some Other Guy","Love Me Do","Please Please Me"],"note":"One of their final Cavern Club performances"}
]
Be historically accurate with real dates and details.`,
    2500,
    true
  );

  const data = JSON.parse(raw);
  cSet(k, data);
  return { data, fromCache: false };
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&family=Share+Tech+Mono&display=swap');

:root {
  --cream:#fdf6e3; --dark:#1a1208; --red:#c0392b; --yellow:#f5c518;
  --ink:#2a1a08; --muted:#7a6e5e; --green:#1e6e44; --blue:#1a5fa8;
}
* { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
body { background:var(--cream); color:var(--ink); font-family:'Nunito',sans-serif; max-width:430px; margin:0 auto; min-height:100vh; }

.hdr { background:var(--dark); padding:13px 18px 11px; position:sticky; top:0; z-index:50; border-bottom:4px solid var(--yellow); display:flex; align-items:center; justify-content:space-between; }
.hdr-logo { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:3px; color:var(--yellow); line-height:1; }
.hdr-logo em { color:#ff8080; font-style:normal; }
.hdr-sub { font-size:9px; letter-spacing:3px; color:#888; text-transform:uppercase; margin-top:1px; }
.hdr-fav { background:var(--red); color:#fff; font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:1px; padding:2px 9px; border-radius:20px; }

.pg { padding-bottom:80px; }
.pg-ttl { font-family:'Bebas Neue',sans-serif; font-size:34px; letter-spacing:2px; padding:18px 18px 10px; color:var(--dark); }

/* Albums */
.alb-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 14px; }
.alb-card { border-radius:14px; border:3px solid rgba(0,0,0,0.18); padding:16px 14px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.1s; }
.alb-card:active { transform:scale(0.96); }
.alb-card::after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(0,0,0,0.05) 5px,rgba(0,0,0,0.05) 10px); pointer-events:none; }
.alb-yr { display:inline-block; background:rgba(0,0,0,0.32); color:#fff; font-family:'Bebas Neue',sans-serif; font-size:12px; letter-spacing:1px; padding:1px 8px; border-radius:20px; margin-bottom:8px; position:relative; z-index:1; }
.alb-name { font-weight:900; font-size:12px; line-height:1.3; position:relative; z-index:1; }
.alb-cnt { font-size:10px; margin-top:4px; position:relative; z-index:1; opacity:0.75; }
.alb-date { font-size:9px; margin-top:3px; position:relative; z-index:1; opacity:0.6; letter-spacing:0.5px; font-weight:700; }

/* Search */
.sw { padding:12px 14px 6px; position:sticky; top:64px; z-index:40; background:var(--cream); border-bottom:2px solid rgba(0,0,0,0.08); }
.si { position:relative; }
.sinput { width:100%; padding:11px 14px 11px 38px; border:3px solid var(--dark); border-radius:10px; font-family:'Nunito',sans-serif; font-size:14px; font-weight:700; background:var(--cream); color:var(--ink); outline:none; }
.sinput::placeholder { color:#bbb; font-weight:600; }
.sico { position:absolute; left:13px; top:50%; transform:translateY(-50%); font-size:16px; pointer-events:none; }
.chip-row { display:flex; gap:6px; padding:8px 0 2px; overflow-x:auto; }
.chip-row::-webkit-scrollbar { display:none; }
.chip { padding:5px 12px; border:2px solid var(--dark); border-radius:20px; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; cursor:pointer; white-space:nowrap; background:transparent; font-family:'Nunito',sans-serif; color:var(--ink); transition:all 0.12s; }
.chip.on { background:var(--dark); color:var(--yellow); }
.rcnt { font-size:11px; font-weight:700; color:var(--muted); padding:6px 18px 4px; letter-spacing:1px; }

/* Song rows */
.br { display:flex; align-items:center; gap:10px; padding:14px 18px; cursor:pointer; border-bottom:2px solid rgba(0,0,0,0.08); }
.bi { font-size:20px; } .bl { font-weight:800; font-size:14px; }
.ahero { padding:18px 18px 14px; }
.ahero-t { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:1px; line-height:1.1; }
.ahero-y { font-size:12px; color:var(--muted); font-weight:700; margin-top:3px; }
.divider { height:3px; background:repeating-linear-gradient(90deg,var(--dark) 0,var(--dark) 6px,transparent 6px,transparent 12px); margin:0 18px 4px; }
.srow { display:flex; align-items:center; padding:12px 18px; border-bottom:1px solid rgba(0,0,0,0.07); cursor:pointer; transition:background 0.1s; }
.srow:active { background:rgba(0,0,0,0.04); }
.snum { font-family:'Bebas Neue',sans-serif; font-size:17px; color:#bbb; min-width:30px; }
.sname { flex:1; font-weight:700; font-size:14px; padding:0 8px; }
.salb { font-size:10px; font-weight:700; color:var(--muted); margin-top:2px; }
.sbadges { display:flex; align-items:center; gap:5px; }
.fico { font-size:16px; padding:2px; cursor:pointer; transition:transform 0.12s; background:none; border:none; }
.fico:active { transform:scale(1.35); }
.sarr { color:#bbb; font-size:18px; margin-left:4px; }
.empty { text-align:center; padding:60px 20px; }
.empty-i { font-size:48px; margin-bottom:14px; }
.empty-t { font-weight:800; font-size:15px; color:var(--muted); }
.empty-s { font-size:12px; color:#bbb; margin-top:6px; }

/* Song detail */
.sdb { display:flex; align-items:center; gap:10px; padding:14px 18px; cursor:pointer; border-bottom:2px solid rgba(0,0,0,0.08); }
.sdh { padding:18px 18px 14px; }
.sda { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
.sdtr { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.sdt { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:1px; line-height:1; }
.sdf { font-size:28px; cursor:pointer; padding:4px; transition:transform 0.15s; background:none; border:none; margin-top:2px; }
.sdf:active { transform:scale(1.25); }
.sdk { display:inline-block; margin-top:10px; background:var(--dark); color:var(--yellow); font-family:'Bebas Neue',sans-serif; font-size:15px; letter-spacing:3px; padding:4px 14px; border-radius:20px; }

/* Tabs */
.tabs { display:flex; border-bottom:4px solid var(--dark); background:var(--dark); padding:3px 3px 0; gap:2px; }
.tab { flex:1; padding:10px 2px; background:none; border:none; font-family:'Nunito',sans-serif; font-weight:800; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; color:#888; cursor:pointer; border-radius:7px 7px 0 0; transition:all 0.15s; }
.tab.on { background:var(--cream); color:var(--dark); }
.vtog { display:flex; gap:6px; padding:12px 18px 4px; }
.vchip { padding:5px 14px; border:2px solid var(--dark); border-radius:20px; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; cursor:pointer; background:transparent; font-family:'Nunito',sans-serif; color:var(--ink); transition:all 0.12s; }
.vchip.on { background:var(--dark); color:var(--yellow); }

/* Chord sheet */
.csh { padding:14px 18px 18px; }
.lw { text-align:center; padding:44px 20px; }
.vinyl { width:68px; height:68px; border-radius:50%; margin:0 auto 14px; background:conic-gradient(#1a1a1a 0%,#383838 25%,#1a1a1a 50%,#383838 75%,#1a1a1a 100%); animation:spin 1s linear infinite; position:relative; }
.vinyl::after { content:''; position:absolute; inset:30%; border-radius:50%; background:var(--cream); }
@keyframes spin { to{transform:rotate(360deg);} }
.lbl { font-weight:800; font-size:12px; color:#aaa; letter-spacing:2px; text-transform:uppercase; }
.lbl-sub { font-size:10px; color:#bbb; margin-top:6px; }
.cbadge { display:inline-flex; align-items:center; gap:5px; background:#e6f4ea; color:var(--green); font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:4px 12px; border-radius:20px; margin-bottom:14px; }
.wsrc { display:inline-flex; align-items:center; gap:4px; background:#fff8e1; color:#806000; font-size:10px; font-weight:800; letter-spacing:1px; padding:3px 10px; border-radius:20px; margin-bottom:12px; }
.sec { margin-bottom:24px; }
.slbl { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:4px; color:var(--red); border-bottom:2px dotted rgba(192,57,43,0.3); padding-bottom:5px; margin-bottom:12px; }
.cl { margin-bottom:14px; }
.cr { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:5px; }
.cp { background:var(--dark); color:#fff; font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:1px; padding:4px 12px; border-radius:8px; min-width:42px; text-align:center; }
.lt { font-size:13px; color:var(--muted); font-style:italic; line-height:1.5; }
.err { background:#fff0ef; border:2px solid var(--red); color:var(--red); padding:12px 14px; border-radius:10px; font-size:13px; font-weight:700; margin-bottom:12px; }
.prep{background:#fffbe6;border:2px solid #f5c518;color:#806000;padding:20px;border-radius:10px;font-size:14px;font-weight:800;text-align:center;margin:20px 0;}
/* TAB */
.tirow { display:flex; gap:6px; padding:12px 18px 4px; }
.tib { padding:6px 14px; border:2px solid var(--dark); border-radius:20px; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; cursor:pointer; background:transparent; font-family:'Nunito',sans-serif; color:var(--ink); transition:all 0.12s; white-space:nowrap; }
.tib.on.guitar { background:#c0392b; border-color:#c0392b; color:#fff; }
.tib.on.bass   { background:#d4820a; border-color:#d4820a; color:#fff; }
.tib.on.lead   { background:#1a5fa8; border-color:#1a5fa8; color:#fff; }
.tsh { padding:6px 18px 18px; }
.tsec { margin-bottom:20px; }
.tslbl { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:4px; color:var(--red); border-bottom:2px dotted rgba(192,57,43,0.3); padding-bottom:4px; margin-bottom:10px; }
.tpre { font-family:'Share Tech Mono','Courier New',monospace; font-size:13px; line-height:1.75; color:var(--ink); background:#f5efe0; border:2px solid rgba(0,0,0,0.1); border-radius:8px; padding:12px 14px; overflow-x:auto; white-space:pre; display:block; }
.ttun { font-size:10px; font-weight:700; color:var(--muted); letter-spacing:2px; text-transform:uppercase; padding:0 18px 6px; margin-top:4px; }

/* Instruments */
.iw { padding:18px; }
.fbtn { width:100%; padding:14px; background:var(--dark); color:var(--yellow); border:none; border-radius:12px; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:18px; transition:opacity 0.15s; }
.fbtn:disabled { opacity:0.5; cursor:default; } .fbtn:active { opacity:0.85; }
.mc { border:3px solid var(--dark); border-radius:14px; overflow:hidden; margin-bottom:12px; }
.mh { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:2px solid var(--dark); }
.me { font-size:20px; } .mn { font-weight:900; font-size:15px; color:#fff; }
.mi { padding:10px 14px; display:flex; flex-wrap:wrap; gap:6px; }
.ich { background:var(--cream); border:2px solid var(--dark); font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; color:var(--ink); }

/* History */
.hpg { padding-bottom:80px; }
.erascroll { display:flex; gap:8px; padding:12px 14px 10px; overflow-x:auto; background:var(--cream); position:sticky; top:64px; z-index:40; border-bottom:2px solid rgba(0,0,0,0.08); }
.erascroll::-webkit-scrollbar { display:none; }
.erabtn { flex-shrink:0; padding:7px 12px; border:2px solid var(--dark); border-radius:10px; cursor:pointer; background:var(--cream); font-family:'Nunito',sans-serif; text-align:left; transition:all 0.12s; min-width:90px; }
.erabtn.on { background:var(--dark); }
.erabtn-l { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:1px; display:block; color:var(--ink); }
.erabtn.on .erabtn-l { color:var(--yellow); }
.erabtn-r { font-size:10px; font-weight:700; color:var(--muted); display:block; margin-top:1px; }
.erabtn.on .erabtn-r { color:#aaa; }
.frow { display:flex; gap:6px; padding:10px 14px 6px; }
.fbf { padding:4px 12px; border:2px solid var(--dark); border-radius:20px; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; cursor:pointer; background:transparent; font-family:'Nunito',sans-serif; color:var(--ink); transition:all 0.12s; }
.fbf.on.all    { background:var(--dark); color:var(--yellow); }
.fbf.on.album  { background:var(--blue); border-color:var(--blue); color:#fff; }
.fbf.on.single { background:var(--red);  border-color:var(--red);  color:#fff; }
.fbf.on.live   { background:var(--green);border-color:var(--green);color:#fff; }
.tline { padding:16px 18px 8px; position:relative; }
.tline::before { content:''; position:absolute; left:36px; top:0; bottom:0; width:2px; background:repeating-linear-gradient(to bottom,var(--dark) 0,var(--dark) 6px,transparent 6px,transparent 12px); }
.tev { display:flex; gap:12px; margin-bottom:18px; }
.tdot { width:20px; height:20px; border-radius:50%; border:3px solid var(--dark); flex-shrink:0; margin-top:3px; z-index:1; position:relative; }
.tdot.album{background:var(--blue);} .tdot.single{background:var(--red);} .tdot.live{background:var(--green);}
.tcard { flex:1; background:#fff; border:2px solid rgba(0,0,0,0.1); border-radius:12px; overflow:hidden; }
.tch { padding:10px 12px 8px; border-bottom:1px solid rgba(0,0,0,0.07); }
.tdate { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:2px; color:var(--muted); }
.tbadge { display:inline-block; font-size:9px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; padding:2px 8px; border-radius:20px; margin-left:6px; }
.tbadge.album{background:#dbeafe;color:var(--blue);} .tbadge.single{background:#fee2e2;color:var(--red);} .tbadge.live{background:#dcfce7;color:var(--green);}
.ttitle { font-weight:800; font-size:14px; margin-top:4px; color:var(--dark); }
.tvenue { font-size:12px; color:var(--muted); font-weight:700; margin-top:2px; }
.tnote { font-size:12px; color:var(--muted); padding:8px 12px; line-height:1.5; border-top:1px solid rgba(0,0,0,0.06); }
.tset { padding:6px 12px 10px; }
.tsetl { font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:5px; }
.tsets { display:flex; flex-wrap:wrap; gap:4px; }
.tss { font-size:11px; font-weight:700; background:#f5f0e8; border:1.5px solid #ddd; padding:3px 8px; border-radius:10px; color:var(--ink); }
.texbtn { width:100%; padding:6px; background:none; border:none; border-top:1px solid rgba(0,0,0,0.07); font-size:11px; font-weight:800; color:var(--muted); cursor:pointer; letter-spacing:1px; text-transform:uppercase; }

/* Bottom nav */
.bnav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:430px; background:var(--dark); border-top:4px solid var(--yellow); display:flex; z-index:50; }
.nb { flex:1; padding:11px 4px 9px; background:none; border:none; cursor:pointer; color:#666; font-family:'Nunito',sans-serif; font-weight:800; font-size:10px; letter-spacing:1px; text-transform:uppercase; display:flex; flex-direction:column; align-items:center; gap:2px; transition:color 0.15s; }
.nb.on { color:var(--yellow); }
.nb .ico { font-size:20px; }

mark { background:rgba(245,197,24,0.45); border-radius:2px; font-style:normal; color:var(--ink); }
`;

// ── Sub-components ────────────────────────────────────────────────────────────
function Hi({ text, q }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

function TlEvent({ ev }) {
  const [open, setOpen] = useState(false);
  const expandable = (ev.type === "live" && ev.setlist?.length > 0) || !!ev.note;
  return (
    <div className="tev">
      <div className={`tdot ${ev.type}`} />
      <div className="tcard">
        <div className="tch">
          <div>
            <span className="tdate">{ev.date}</span>
            <span className={`tbadge ${ev.type}`}>
              {ev.type === "album" ? "💿 Album" : ev.type === "single" ? "🎵 Single" : "🎤 Live"}
            </span>
          </div>
          <div className="ttitle">{ev.title || ev.venue}</div>
          {ev.type === "live" && ev.city && <div className="tvenue">📍 {ev.city}</div>}
        </div>
        {open && <>
          {ev.note && <div className="tnote">{ev.note}</div>}
          {ev.type === "live" && ev.setlist?.length > 0 && (
            <div className="tset">
              <div className="tsetl">Setlist</div>
              <div className="tsets">{ev.setlist.map((s, i) => <span key={i} className="tss">{s}</span>)}</div>
            </div>
          )}
        </>}
        {expandable && <button className="texbtn" onClick={() => setOpen(o => !o)}>{open ? "▲ 閉じる" : "▼ 詳細を見る"}</button>}
      </div>
    </div>
  );
}

function HistoryPage() {
  const [era, setEra] = useState(ERAS[1].id);
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 useEffect(()=>{},[era]);

  const filtered = useMemo(() => {
    if (!events) return [];
    return filter === "all" ? events : events.filter(e => e.type === filter);
  }, [events, filter]);

  return (
    <div className="hpg">
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, letterSpacing: 2, padding: "18px 18px 4px", color: "var(--dark)" }}>HISTORY</div>
      <div className="erascroll" style={{display:"none"}}>
        {ERAS.map(e => (
          <button key={e.id} className={`erabtn${era === e.id ? " on" : ""}`} onClick={() => setEra(e.id)}>
            <span className="erabtn-l">{e.label}</span>
            <span className="erabtn-r">{e.range}</span>
          </button>
        ))}
      </div>
      <div className="frow" style={{display:"none"}}>
        {[{ id: "all", l: "ALL" }, { id: "album", l: "💿" }, { id: "single", l: "🎵" }, { id: "live", l: "🎤" }].map(({ id, l }) => (
          <button key={id} className={`fbf${filter === id ? " on " + id : ""}`} onClick={() => setFilter(id)}>{l}</button>
        ))}
      </div>
      <div className="prep" style={{margin:20}}>🎵 Historyページは準備中です</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [nav, setNav]   = useState("albums");
  const [page, setPage] = useState("albums");
  const [album, setAlbum] = useState(null);
  const [song, setSong]   = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort]   = useState("album");
  const [favs, setFavs]   = useState([]);

  const [detTab, setDetTab] = useState("chords");
  const [view, setView]     = useState("chords");
  const [tinstr, setTinstr] = useState("guitar");

  const [chords, setChords] = useState(null);
  const [tabs, setTabs]     = useState({});
  const [inst, setInst]     = useState(null);

  const [lc, setLc] = useState(false);
  const [lt, setLt] = useState({});
  const [li, setLi] = useState(false);

  const [ec, setEc] = useState(null);
  const [et, setEt] = useState({});
  const [ei, setEi] = useState(null);

  const isFavSong = (s, aid) => favs.some(f => f.song === s && f.albumId === aid);
  const toggleFavSong = (s, aid, at) => setFavs(prev =>
    isFavSong(s, aid) ? prev.filter(f => !(f.song === s && f.albumId === aid)) : [...prev, { song: s, albumId: aid, albumTitle: at }]
  );

  const results = useMemo(() => {
    let list = ALL_SONGS;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(({ song: s, album: a }) => s.toLowerCase().includes(q));
    }
    if (sort === "az") list = [...list].sort((a, b) => a.song.localeCompare(b.song));
    else if (sort === "za") list = [...list].sort((a, b) => b.song.localeCompare(a.song));
    else if (sort === "fav") list = list.filter(({ song: s, album: a }) => isFavSong(s, a.id));
    return list;
  }, [query, sort, favs]);

  async function openSong(a, s) {
    setAlbum(a); setSong(s);
    setChords(null); setTabs({}); setInst(null);
    setEc(null); setEt({}); setEi(null);
    setDetTab("chords"); setView("chords"); setTinstr("guitar");
    setPage("song");
    if (!CHORD_DATA[s]) { setEc("準備中"); return; }
    setLc(true);
    try { const { data } = await getChords(s, a.title); setChords(data); }
    catch { setEc("コードの取得に失敗しました"); }
    setLc(false);
  }

  async function doTab(instr) {
    if (!song || !album) return;
    setLt(p => ({ ...p, [instr]: true })); setEt(p => ({ ...p, [instr]: null }));
    try { const { data } = await getTab(song, album.title, chords?.key, instr); setTabs(p => ({ ...p, [instr]: data })); }
    catch { setEt(p => ({ ...p, [instr]: "TAB譜の取得に失敗しました" })); }
    setLt(p => ({ ...p, [instr]: false }));
  }

  async function doInst() {
    if (!song || !album) return;
    setLi(true); setEi(null);
    try { const { data } = await getInstruments(song, album.title); setInst(data); }
    catch { setEi("楽器情報の取得に失敗しました"); }
    setLi(false);
  }

  function switchDetTab(t) { setDetTab(t); if (t === "inst" && !inst && !li) doInst(); }
  function switchView(v)   { setView(v);   if (v === "tabs" && !tabs[tinstr] && !lt[tinstr]) doTab(tinstr); }
  function switchInstr(i)  { setTinstr(i); if (!tabs[i] && !lt[i]) doTab(i); }
  function goBack() {
    if (page === "song") setPage(nav === "search" ? "search" : nav === "favs" ? "favs" : nav === "history" ? "history" : "songs");
    else if (page === "songs") setPage("albums");
  }
  function switchNav(p) {
    setNav(p);
    if (p === "albums") setPage("albums");
    else if (p === "search") setPage("search");
    else if (p === "favs") setPage("favs");
    else if (p === "history") setPage("history");
  }

  function SongRow({ s, a, idx, sub = false }) {
    const faved = isFavSong(s, a.id);
    return (
      <div className="srow">
        {idx !== undefined && <span className="snum">{String(idx + 1).padStart(2, "0")}</span>}
        <span className="sname" onClick={() => openSong(a, s)}>
          <Hi text={s} q={query} />{sub && <div className="salb">{a.title} · {a.year}</div>}
        </span>
        <span className="sbadges">
          <button className="fico" onClick={e => { e.stopPropagation(); toggleFavSong(s, a.id, a.title); }}>
            {faved ? "❤️" : "🤍"}
          </button>
        </span>
        <span className="sarr" onClick={() => openSong(a, s)}>›</span>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="hdr">
        <div>
          <div className="hdr-logo">THE <em>BEATLES</em></div>
          <div className="hdr-sub">Chord &amp; Instruments Reference</div>
        </div>
        {favs.length > 0 && <span className="hdr-fav">❤️ {favs.length}</span>}
      </div>

      {/* Albums */}
      {page === "albums" && <div className="pg">
        <div className="pg-ttl">DISCOGRAPHY</div>
        <div className="alb-grid">
          {ALBUMS.map(a => (
            <div key={a.id} className="alb-card" style={{ background: a.color }} onClick={() => { setAlbum(a); setPage("songs"); }}>
              <div className="alb-yr">{a.year}</div>
              <div className="alb-name" style={{ color: a.tc }}>{a.title}</div>
              <div className="alb-cnt" style={{ color: a.tc }}>{a.songs.length} tracks</div>
              <div className="alb-date" style={{ color: a.tc }}>{fmtDate(a.releaseDate)}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* Songs */}
      {page === "songs" && album && <div className="pg">
        <div className="br" onClick={() => setPage("albums")}><span className="bi">←</span><span className="bl">Discography</span></div>
        <div className="ahero">
          <div className="ahero-t">{album.title}</div>
          <div className="ahero-y">{fmtDate(album.releaseDate)} · {album.songs.length} tracks</div>
        </div>
        <div className="divider" />
        {album.songs.map((s, i) => <SongRow key={i} s={s} a={album} idx={i} />)}
      </div>}

      {/* Search */}
      {page === "search" && <div className="pg">
        <div className="pg-ttl" style={{ paddingBottom: 4 }}>SEARCH</div>
        <div className="sw">
          <div className="si"><span className="sico">🔍</span>
            <input className="sinput" placeholder="曲名で検索" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          </div>
          <div className="chip-row">
            {[{ id: "album", l: "アルバム順" }, { id: "az", l: "A→Z" }, { id: "za", l: "Z→A" }, { id: "fav", l: "❤️ お気に入り" }].map(({ id, l }) => (
              <button key={id} className={`chip${sort === id ? " on" : ""}`} onClick={() => setSort(id)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="rcnt">{results.length} 曲</div>
        {results.length === 0
          ? <div className="empty"><div className="empty-i">🎼</div><div className="empty-t">見つかりませんでした</div></div>
          : results.map(({ song: s, album: a }, i) => <SongRow key={i} s={s} a={a} sub />)
        }
      </div>}

      {/* Favs */}
      {page === "favs" && <div className="pg">
        <div className="pg-ttl">FAVOURITES</div>
        {favs.length === 0
          ? <div className="empty"><div className="empty-i">🤍</div><div className="empty-t">まだお気に入りがありません</div><div className="empty-s">ハートをタップして追加</div></div>
          : favs.map((f, i) => { const a = ALBUMS.find(x => x.id === f.albumId); return a ? <SongRow key={i} s={f.song} a={a} sub /> : null; })
        }
      </div>}

      {/* History */}
      {page === "history" && <HistoryPage />}

      {/* Song detail */}
      {page === "song" && album && song && <div className="pg">
        <div className="sdb" onClick={goBack}><span className="bi">←</span><span className="bl">{album.title}</span></div>
        <div className="sdh" style={{ borderBottom: `4px solid ${album.color}` }}>
          <div className="sda">{album.title} · {album.year}</div>
          <div className="sdtr">
            <div className="sdt">{song}</div>
            <button className="sdf" onClick={() => toggleFavSong(song, album.id, album.title)}>
              {isFavSong(song, album.id) ? "❤️" : "🤍"}
            </button>
          </div>
          {chords?.key && <div className="sdk">KEY OF {chords.key}</div>}
{INSTRUMENT_DATA[song] && (
  <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
    <span style={{background:INSTRUMENT_DATA[song].original?"#1a5fa8":"#c0392b",color:"#fff",fontSize:10,fontWeight:800,letterSpacing:1,padding:"3px 10px",borderRadius:20}}>
      {INSTRUMENT_DATA[song].original ? "ORIGINAL" : "COVER"}
    </span>
    <span style={{background:"#f5f0e8",border:"2px solid #ddd",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,color:"var(--ink)"}}>
      ✍️ {INSTRUMENT_DATA[song].writer}
    </span>
    <span style={{background:"#f5f0e8",border:"2px solid #ddd",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,color:"var(--ink)"}}>
      🎤 {INSTRUMENT_DATA[song].leadVocal}
    </span>
  </div>
)}
        </div>

        <div className="tabs">
          <button className={`tab${detTab === "chords" ? " on" : ""}`} onClick={() => switchDetTab("chords")}>🎵 コード / TAB</button>
          <button className={`tab${detTab === "inst" ? " on" : ""}`}   onClick={() => switchDetTab("inst")}>🎸 使用楽器</button>
        </div>

        {detTab === "chords" && <>
          <div className="vtog">
            <button className={`vchip${view === "chords" ? " on" : ""}`} onClick={() => switchView("chords")}>🎵 コード進行</button>
            <button className={`vchip${view === "tabs" ? " on" : ""}`}   onClick={() => switchView("tabs")}>🎸 TAB譜</button>
          </div>

          {view === "chords" && <div className="csh">
            {lc && <div className="lw"><div className="vinyl" /><div className="lbl">Loading chords...</div><div className="lbl-sub">Web検索で精度を上げています</div></div>}
            {ec && <div className={ec==="準備中"?"prep":"err"}>{ec==="準備中"?"🎵 このアルバムは準備中です":"⚠️ "+ec}</div>}
            {chords && !lc && <>
              <div className="wsrc">🔍 Web検索ベース</div>
              {chords.sections?.map((s, si) => (
                <div key={si} className="sec">
                  {s.name && <div className="slbl">{s.name}</div>}
                  {s.lines?.map((l, li) => (
                    <div key={li} className="cl">
                      <div className="cr">{l.chords?.filter(Boolean).map((c, ci) => <span key={ci} className="cp">{c}</span>)}</div>
                      {l.lyric && <div className="lt">"{l.lyric}"</div>}
                    </div>
                  ))}
                </div>
              ))}
            </>}
          </div>}

          {view === "tabs" && <>
            <div className="tirow">
              {[{ id: "guitar", l: "🎸 Guitar" }, { id: "bass", l: "🎵 Bass" }, { id: "lead", l: "🎶 Lead" }].map(({ id, l }) => (
                <button key={id} className={`tib ${id}${tinstr === id ? " on" : ""}`} onClick={() => switchInstr(id)}>{l}</button>
              ))}
            </div>
            {lt[tinstr] && <div className="lw"><div className="vinyl" /><div className="lbl">Loading TAB...</div><div className="lbl-sub">Web検索で精度を上げています</div></div>}
            {et[tinstr] && <div className="csh"><div className="err">⚠️ {et[tinstr]}</div><button className="fbtn" onClick={() => doTab(tinstr)}>再試行</button></div>}
            {tabs[tinstr] && !lt[tinstr] && <div className="tsh">
              <div className="wsrc">🔍 Web検索ベース</div>
              <div className="ttun">{tinstr === "bass" ? "Bass (G D A E)" : "Guitar"} — Tuning: {tabs[tinstr].tuning || "Standard"}</div>
              {tabs[tinstr].sections?.map((s, si) => (
                <div key={si} className="tsec">
                  {s.name && <div className="tslbl">{s.name}</div>}
                  <div style={{ overflowX: "auto" }}><pre className="tpre">{s.tab}</pre></div>
                </div>
              ))}
            </div>}
          </>}
        </>}

        {detTab === "inst" && <div className="iw">
          {!inst && !li && !ei && <button className="fbtn" onClick={doInst}>🎸 楽器情報を取得する</button>}
          {li && <div className="lw"><div className="vinyl" /><div className="lbl">Researching...</div><div className="lbl-sub">Web検索で精度を上げています</div></div>}
          {ei && <><div className="err">⚠️ {ei}</div><button className="fbtn" onClick={doInst}>再試行</button></>}
          {inst && <>
            <div className="wsrc">🔍 Web検索ベース</div>
            {MEMBERS.map(m => {
              const info = inst[m.id]; if (!info?.instruments?.length) return null;
              return (
                <div key={m.id} className="mc">
                  <div className="mh" style={{ background: m.color }}><span className="me">{m.emoji}</span><span className="mn">{m.name}</span></div>
                  <div className="mi">{info.instruments.map((x, i) => <span key={i} className="ich">{x}</span>)}</div>
                </div>
              );
            })}
          </>}
        </div>}
      </div>}

      <div className="bnav">
        <button className={`nb${nav === "albums" && page !== "song" ? " on" : ""}`} onClick={() => switchNav("albums")}><span className="ico">💿</span>ALBUMS</button>
        <button className={`nb${nav === "search" ? " on" : ""}`} onClick={() => switchNav("search")}><span className="ico">🔍</span>SEARCH</button>
        <button className={`nb${nav === "favs" ? " on" : ""}`} onClick={() => switchNav("favs")}>
          <span className="ico">{favs.length > 0 ? "❤️" : "🤍"}</span>FAVS
          {favs.length > 0 && <span style={{ fontSize: 9, color: "#e8433a", fontWeight: 900 }}>{favs.length}</span>}
        </button>
        <button className={`nb${nav === "history" ? " on" : ""}`} onClick={() => switchNav("history")}><span className="ico">📅</span>HISTORY</button>
      </div>
    </>
  );
}
