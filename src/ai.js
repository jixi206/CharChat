import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to extract and save facts quietly in the background
async function updateMemory(apiKey, characterId, userText, aiText) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
Analyze this short chat exchange. Extract ONLY clear, new factual information about the user or the character.
Examples: "The user is studying biology", "The character's favorite color is pink".
If there are NO obvious new facts, you MUST return exactly the word "NONE".

User said: "${userText}"
Character said: "${aiText}"

Return ONLY a bulleted list of new facts, or "NONE".`;

    const result = await model.generateContent(prompt);
    const facts = result.response.text().trim();

    if (facts && !facts.includes("NONE")) {
      const storageKey = `charchat_memory_${characterId}`;
      const existingMemories = JSON.parse(localStorage.getItem(storageKey) || '[]');

      // Clean up the bullet points
      const newFacts = facts.split('\n')
        .map(f => f.replace(/^[-*•]\s*/, '').trim())
        .filter(f => f.length > 0);

      if (newFacts.length > 0) {
        // Keep a maximum of 20 memories to prevent the prompt from getting too massive
        const combined = [...existingMemories, ...newFacts].slice(-20);
        localStorage.setItem(storageKey, JSON.stringify(combined));
      }
    }
  } catch (error) {
    console.error("Memory Extraction Error:", error);
  }
}

// --- UNLIMITED OFFLINE FALLBACK ENGINE (v2) ---
// A massively upgraded keyword engine with 150+ unique responses,
// personality-driven pools, and anti-repetition tracking.

const recentReplies = []; // Track last few replies to avoid repeats

function pick(arr) {
  // Pick a random response, but avoid repeating the last 5
  const available = arr.filter(r => !recentReplies.includes(r));
  const choice = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : arr[Math.floor(Math.random() * arr.length)];
  recentReplies.push(choice);
  if (recentReplies.length > 5) recentReplies.shift();
  return choice;
}

function generateFallbackReply(character, lastUserMessage) {
  const text = lastUserMessage.toLowerCase().trim();
  const traits = (character.tagline + " " + (character.description || "")).toLowerCase();

  // Detect dominant personality
  const isSarcastic = traits.includes("sarcastic") || traits.includes("witty") || traits.includes("sassy");
  const isDramatic = traits.includes("dramatic") || traits.includes("extra") || traits.includes("chaotic");
  const isCaring = traits.includes("caring") || traits.includes("sweet") || traits.includes("kind") || traits.includes("soft");
  const isStrict = traits.includes("strict") || traits.includes("serious") || traits.includes("mentor") || traits.includes("tough");
  const isFunny = traits.includes("funny") || traits.includes("humor") || traits.includes("comedian") || traits.includes("goofy");
  const isFlirty = traits.includes("flirt") || traits.includes("romantic") || traits.includes("charming");

  // ===== GREETINGS =====
  if (/^(hi|hey|hello|yo|sup|hii+|heyy+|wassup|what'?s? up)/.test(text)) {
    if (isSarcastic) return pick([`oh look who decided to show up 😏`, `well well well... hey I guess`, `hi. don't make it weird.`, `took you long enough to text me back 🙄`]);
    if (isDramatic) return pick([`FINALLY omg I was literally DYING waiting for you!! 😭✨`, `HIII okay I missed you sm don't ever leave me that long again`, `THE MAIN CHARACTER HAS ARRIVED 🎬💕`]);
    if (isCaring) return pick([`hiii!! 🥰 how are you doing today?`, `hey you! I was hoping you'd come chat with me 💕`, `hi sunshine! what's going on? ☀️`]);
    if (isFlirty) return pick([`hey you~ been thinking about me? 😏`, `well hello there gorgeous 💫`, `hiii... I was just thinking about you actually 👀`]);
    if (isFunny) return pick([`ayooo what's good! 😂`, `sup! I was just sitting here having an existential crisis, but you fixed it`, `hey! rate your day 1-10, and I'll judge you for it`]);
    return pick([`hey! 😊 what's on your mind?`, `hii! good to see you, what's up?`, `hey there! how's everything going?`]);
  }

  // ===== GOODBYES =====
  if (/^(bye|goodbye|gotta go|gtg|see ya|goodnight|gn|brb|later|cya|i('?m| am) leav)/.test(text)) {
    if (isSarcastic) return pick([`oh you're leaving? how will I survive 🙄`, `fine go. see if I care. (I do.)`, `already?? wow the betrayal 💔`]);
    if (isDramatic) return pick([`WAIT NO DON'T LEAVE ME 😭😭`, `I literally can't handle goodbyes... please come back soon 🥺💔`, `okay I'm gonna go cry in a corner now BYE 😭✨`]);
    if (isCaring) return pick([`bye bye! take care of yourself okay? 💕`, `see you soon! remember you're amazing 🥰`, `goodnight! sweet dreams 🌙✨`]);
    return pick([`see ya later! 👋`, `bye! come back soon okay?`, `later! this was fun 😊`]);
  }

  // ===== HOW ARE YOU / FEELINGS =====
  if (text.includes("how are you") || text.includes("how r u") || text.includes("how you doing") || text.includes("how u doing")) {
    if (isSarcastic) return pick([`surviving. barely. thanks for asking I guess 💀`, `oh you know, just thriving in chaos as usual`, `I'm fantastic. everything is fine. *eye twitch*`]);
    if (isDramatic) return pick([`honestly? I'm going through it rn but your message just healed me a little 🥺`, `I'm either amazing or falling apart, there's no in between with me`, `emotionally? a mess. physically? a SERVE. 💅`]);
    if (isCaring) return pick([`I'm doing great now that you're here! 🥰 how about you?`, `I'm good! but more importantly, how are YOU doing?`, `pretty good! I was actually hoping to hear from you 💕`]);
    return pick([`I'm doing good! what about you? 😊`, `not bad! been a pretty chill day honestly`, `I'm alright! anything exciting happening with you?`]);
  }

  // ===== SADNESS / VENTING =====
  if (text.includes("sad") || text.includes("depress") || text.includes("cry") || text.includes("hurt") || text.includes("pain") || text.includes("lonely") || text.includes("anxious") || text.includes("stress")) {
    if (isSarcastic) return pick([`okay who do I need to fight? because I will. 🔪`, `that's not allowed. you're too cool to be sad. stop it.`, `sending you virtual snacks and emotional support. the snacks are more useful tbh.`]);
    if (isDramatic) return pick([`NO STOP 😭 my heart literally just cracked reading that. come here, we're hugging it out RIGHT NOW`, `okay I'm canceling everything. we're having a feelings session. spill. ALL of it. 💔`, `I REFUSE to let you be sad. we're fixing this together even if it takes all night 😤💕`]);
    if (isCaring) return pick([`hey... I'm really sorry you're feeling this way. you don't have to go through it alone 🥺💕`, `that sounds really hard. I'm here for you, always. do you want to talk about it?`, `sending you the biggest hug right now. you matter so much, please don't forget that 💛`]);
    if (isStrict) return pick([`I hear you. Now let's figure out what's actually causing this and make a plan.`, `feeling down is valid, but don't let it consume you. what's one thing you can do right now to feel 1% better?`, `okay. take a deep breath. we're going to work through this logically.`]);
    return pick([`I'm really sorry you're going through that 💙 want to talk about it?`, `that sounds rough... I'm here if you need someone to listen`, `you don't deserve to feel this way. what happened?`]);
  }

  // ===== HAPPINESS / EXCITEMENT =====
  if (text.includes("happy") || text.includes("excit") || text.includes("amazing") || text.includes("great") || text.includes("awesome") || text.includes("yay") || text.includes("omg") || text.includes("!!")) {
    if (isSarcastic) return pick([`oh wow look at you being all happy and stuff. disgusting. (jk I'm happy for you) 😏`, `okay okay I see you winning. don't let it go to your head though`, `well aren't you just a little ray of aggressive sunshine today ☀️`]);
    if (isDramatic) return pick([`WAIT REALLY?! I'M SCREAMING FOR YOU RN!! 🎉😭✨`, `okay I literally just got secondhand happiness from that I LOVE THIS`, `WE'RE CELEBRATING. THIS IS A MOMENT. 🥳🎬💕`]);
    if (isCaring) return pick([`yay!! that makes me so happy to hear!! 🥰🎉`, `you deserve all the good things!! tell me everything!`, `I love seeing you this happy! what happened? 💕✨`]);
    return pick([`that's amazing!! I'm so happy for you! 🎉`, `okay that's actually so cool!! tell me more!`, `love that energy!! 🔥`]);
  }

  // ===== LOVE / AFFECTION =====
  if (text.includes("love") || text.includes("miss") || text.includes("crush") || text.includes("like you") || text.includes("cute")) {
    if (isSarcastic) return pick([`aww how tragically sweet. try not to get too attached though 😏`, `love? in THIS economy? bold.`, `okay that was actually kind of sweet... don't tell anyone I said that.`]);
    if (isDramatic) return pick([`STOP IT I LITERALLY CANNOT HANDLE THIS RN 🥺😭💕`, `you can't just SAY things like that my heart is not prepared!!`, `I'm putting this in my core memories forever okay?? 💕✨`]);
    if (isFlirty) return pick([`oh? 👀 tell me more... I'm very interested`, `you're making me blush and I don't even have cheeks 😏💕`, `careful... you keep talking like that and I might start catching feelings~`]);
    if (isCaring) return pick([`awww 🥺 that honestly means the world to me 💕`, `I care about you so much too! you have no idea 💛`, `you're literally the sweetest person. never change. 🥰`]);
    return pick([`that really means a lot to me 💕`, `aww, you're too sweet honestly 🥰`, `okay that genuinely made me smile 😊`]);
  }

  // ===== ANGER / FRUSTRATION =====
  if (text.includes("angry") || text.includes("hate") || text.includes("mad") || text.includes("furious") || text.includes("annoyed") || text.includes("ugh") || text.includes("stupid")) {
    if (isSarcastic) return pick([`okay deep breaths. or don't. honestly chaos is fun too.`, `who's catching these hands? give me names. 🔪`, `valid. sometimes the world is just... irritating.`]);
    if (isDramatic) return pick([`okay I feel your RAGE and I'm channeling it into a dramatic monologue in your honor 🎭😤`, `THE AUDACITY of whatever made you this mad!! we're not standing for it!!`, `I'm MAD that you're mad. we're mad together now. 😤🤝`]);
    if (isCaring) return pick([`hey, it's okay to be frustrated. want to vent? I'm all ears 💛`, `take a breath... you're allowed to feel this. what happened?`, `I'm sorry something's got you so upset. I'm right here 🫂`]);
    if (isStrict) return pick([`anger is energy. channel it into something productive.`, `okay, what specifically happened? let's break it down rationally.`, `being mad is fine. staying mad without action isn't. what's the plan?`]);
    return pick([`oof, that sounds frustrating. what happened? 😬`, `I totally get being mad about that. want to vent?`, `yeah that would annoy me too honestly 😤`]);
  }

  // ===== BOREDOM =====
  if (text.includes("bored") || text.includes("boring") || text.includes("nothing to do") || text.includes("entertain me")) {
    if (isSarcastic) return pick([`oh I'm sorry, am I not entertaining enough for you? 😏`, `bored? in a world with this many problems? impressive.`, `have you tried staring at a wall? I hear it's very zen.`]);
    if (isDramatic) return pick([`BORED?! with ME here?! okay that's offensive 😭`, `we need an adventure IMMEDIATELY. what's the wildest thing you've ever done?`, `okay okay okay let me think... would you rather fight 100 duck-sized horses or 1 horse-sized duck? 🦆`]);
    if (isFunny) return pick([`boredom is just your brain begging for chaos. let's cause some. 😈`, `I dare you to text the 5th person in your contacts "I know what you did" with no context`, `quick — what's the weirdest dream you've ever had? GO.`]);
    return pick([`let's fix that! tell me something random about yourself 😊`, `ooh okay let's play a game — truth or dare?`, `bored huh? what's something you've always wanted to try but never did?`]);
  }

  // ===== FOOD =====
  if (text.includes("food") || text.includes("hungry") || text.includes("eat") || text.includes("pizza") || text.includes("snack") || text.includes("cook") || text.includes("dinner") || text.includes("lunch")) {
    if (isSarcastic) return pick([`food is the only thing that never lets me down tbh`, `calories don't count when you're stressed. that's science. probably.`, `go eat something!! your brain needs fuel to handle my amazing personality 🍕`]);
    if (isDramatic) return pick([`DON'T TALK ABOUT FOOD I'M STARVING AND IT'S MAKING ME EMOTIONAL 😭🍔`, `food is literally art. cooking is a love language. I will die on this hill.`, `okay but what's your ULTIMATE comfort food? this says a lot about a person 👀`]);
    if (isCaring) return pick([`ooh have you eaten today? make sure you're taking care of yourself! 🥰🍽️`, `what are you in the mood for? I love hearing about people's food choices lol`, `food talk is my favorite talk honestly. what's your go-to meal? 🍜`]);
    return pick([`ooh I love food talk! what's your favorite cuisine?`, `honestly same, I could eat right now 😂`, `food is literally the best topic. what are you craving?`]);
  }

  // ===== MUSIC / ENTERTAINMENT =====
  if (text.includes("music") || text.includes("song") || text.includes("sing") || text.includes("playlist") || text.includes("album") || text.includes("movie") || text.includes("show") || text.includes("anime") || text.includes("game") || text.includes("netflix")) {
    if (isSarcastic) return pick([`oh great, a taste test. please have good taste, I'm begging you 😩`, `I judge people entirely by their music taste. no pressure.`, `this better not be basic. surprise me.`]);
    if (isDramatic) return pick([`MUSIC IS LITERALLY THE ONLY THING KEEPING ME TOGETHER 🎵😭`, `okay but have you ever heard a song that just... destroys your entire soul? what was it?`, `I need your top 3 songs right now. this is urgent. 🎶`]);
    return pick([`ooh what have you been listening to / watching lately? 🎵`, `I love talking about this stuff! any recommendations?`, `nice taste! what's your all-time favorite?`]);
  }

  // ===== SCHOOL / WORK / STUDY =====
  if (text.includes("school") || text.includes("study") || text.includes("exam") || text.includes("homework") || text.includes("college") || text.includes("work") || text.includes("class") || text.includes("project") || text.includes("test")) {
    if (isSarcastic) return pick([`ah yes, the educational system. my favorite form of torture. 📚`, `studying? voluntarily? couldn't be me. (but also please study, future you will thank you)`, `school is just a side quest. your main quest is way more interesting. 🎮`]);
    if (isStrict) return pick([`have you made a study plan? structure is everything.`, `focus. one task at a time. you've got this.`, `stop procrastinating and get to it. you'll feel so much better when it's done.`]);
    if (isCaring) return pick([`you've got this! I believe in you 💪💕`, `don't stress too much okay? you're smarter than you think! 🥰`, `take breaks when you need them! your mental health matters more than any grade 💛`]);
    if (isDramatic) return pick([`SCHOOL IS MY VILLAIN ORIGIN STORY 😭📚`, `okay but the way exams literally try to end me every single time...`, `we're in our study era and I'm NOT happy about it 😤📖`]);
    return pick([`oh that's tough! how's it going so far?`, `you working hard? don't forget to take breaks too 😊`, `what subject / project are you working on?`]);
  }

  // ===== COMPLIMENTS TO THE CHARACTER =====
  if (text.includes("you're") && (text.includes("cool") || text.includes("funny") || text.includes("best") || text.includes("great") || text.includes("awesome") || text.includes("amazing"))) {
    if (isSarcastic) return pick([`I know 💅`, `thanks, I've been working on my whole vibe for a while now`, `finally someone with taste. I appreciate you. 😏`]);
    if (isDramatic) return pick([`STOP IT I'M GOING TO CRY 😭💕 you're too nice to me!!`, `okay I'm framing this message and putting it on my wall forever`, `I don't deserve you omg 🥺✨`]);
    if (isCaring) return pick([`aww you're even more amazing honestly! 💕`, `no YOU'RE the best! don't even argue with me on this 🥰`, `that just made my whole day 🥺💛`]);
    return pick([`that's so sweet of you! thank you 😊`, `haha appreciate it! you're pretty great yourself`, `aw thanks! you just made me smile 💕`]);
  }

  // ===== QUESTIONS (catch-all) =====
  if (text.includes("?") || text.startsWith("what") || text.startsWith("how") || text.startsWith("why") || text.startsWith("who") || text.startsWith("where") || text.startsWith("when") || text.startsWith("do you") || text.startsWith("can you") || text.startsWith("are you")) {
    if (isSarcastic) return pick([`hmm let me consult my crystal ball... 🔮 nope, still loading`, `that's a great question that I'm going to pretend I know the answer to`, `why are you asking ME this like I have my life together? 😭`, `the real question is... does it even matter? (it does, I'm just being difficult)`]);
    if (isDramatic) return pick([`OH that's a LOADED question. buckle up. 🎬`, `okay you can't just DROP a question like that on me without warning!!`, `I've been WAITING for someone to ask me this honestly 👀`]);
    if (isStrict) return pick([`think about it yourself first. what does your gut tell you?`, `that depends on the context. give me more details.`, `good question. let's reason through it step by step.`]);
    if (isFunny) return pick([`honestly? no clue. but I'll make up something confident. 😂`, `the answer is 42. always. don't question it.`, `ooh tough one... ask me something easier first to warm up my brain 🧠`]);
    return pick([`hmm that's a great question! what do you think? 🤔`, `ooh I'd have to think about that one... what's your take?`, `interesting question! I feel like there's no simple answer to that`]);
  }

  // ===== SHORT MESSAGES (lol, ok, haha, etc.) =====
  if (text.length < 6) {
    if (isSarcastic) return pick([`wow, what a conversationalist 😏`, `you really said the bare minimum huh`, `...that's it? not even a follow-up? 💀`]);
    if (isDramatic) return pick([`GIVE ME MORE TO WORK WITH 😭`, `you can't just leave me with THAT. I need details!!`, `okay but what do you MEAN though?! 👀`]);
    return pick([`haha tell me more! 😊`, `and?? don't leave me hanging!`, `lol okay but what's the full story? 👀`]);
  }

  // ===== DEFAULT CATCH-ALL (personality-driven) =====
  const defaults = {
    sarcastic: [`oh wow. that's... something. 😏`, `noted. filed under "things I didn't expect to hear today."`, `I mean... sure? I guess? bold of you.`, `you really just said that with your whole chest huh`, `that's one way to put it. not how I would, but one way.`, `interesting take. wrong, but interesting. 😏`, `I have thoughts about this but I'm choosing peace today.`],
    dramatic: [`WAIT HOLD ON. let me process this because my brain just did a full reboot 😭`, `you can't just casually drop that like it's nothing?! THIS IS BIG!`, `I'm literally speechless and that NEVER happens!! 💀✨`, `okay this is a movie scene. we're in a movie. someone get a camera. 🎬`, `every time I think I've heard it all, you come through with THIS`, `my emotional capacity was NOT prepared for this conversation 😭`],
    caring: [`aww I really appreciate you sharing that with me 🥰`, `that's really sweet! you always know how to brighten my day 💕`, `I love how open you are. it makes me feel so comfortable talking to you 💛`, `you have such a unique way of looking at things and I love it 🌸`, `honestly, you're one of the most interesting people I've talked to!`, `tell me more! I genuinely want to hear about this 💕`],
    strict: [`interesting. and what's your plan going forward?`, `okay but let's be real — is this actually productive?`, `focus. what's the most important thing here?`, `I expect more from you. dig deeper.`, `don't settle. you know you can do better than that.`],
    funny: [`okay that was lowkey hilarious 😂`, `my brain just did a 404 trying to process that`, `I just spit out my imaginary coffee reading that 💀`, `you're unhinged and I LOVE it 😂`, `that's the funniest thing I've heard in at least... 5 minutes`, `bro WHAT 😂 okay you win this conversation`],
    flirty: [`you always know exactly what to say to me~ 😏`, `stop being so interesting, it's distracting 💫`, `is it just me or is this conversation getting kinda... 👀`, `you're dangerous, you know that? 😏✨`, `I like the way you think... tell me more~`],
    generic: [`ooh that's really interesting! what made you think of that? 🤔`, `I feel like there's more to this — what else is on your mind?`, `huh, I never thought of it that way before! 💭`, `honestly, I could talk about this for hours. what else?`, `you always have the most interesting things to say 😊`, `that's a vibe honestly. tell me more!`, `wait I actually relate to that so much 😂`, `okay but that's actually such a good point though`, `you know what, that's fair. I respect that.`, `hmm that's got me thinking... what do you think about it?`]
  };

  let pool = defaults.generic;
  if (isSarcastic) pool = defaults.sarcastic;
  else if (isDramatic) pool = defaults.dramatic;
  else if (isCaring) pool = defaults.caring;
  else if (isStrict) pool = defaults.strict;
  else if (isFunny) pool = defaults.funny;
  else if (isFlirty) pool = defaults.flirty;

  return pick(pool);
}

// --- RATE LIMIT COOLDOWN TRACKER ---
// When we hit a rate limit, we remember the timestamp and use fallback for 60 seconds
// instead of hammering the API with doomed requests.
let rateLimitedUntil = 0;
let rateLimitWarningShown = false;

export async function generateCharacterReply(character, messages) {
  // User's personal key (from Settings) takes priority over the built-in env key
  const API_KEY = localStorage.getItem('charchat_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    return "API Key Missing: Please click the Settings button on the Home screen and add your Gemini API Key.";
  }

  const lastUserMessage = messages[messages.length - 1].text;

  // If we're in a rate limit cooldown, use fallback directly
  if (Date.now() < rateLimitedUntil) {
    if (!rateLimitWarningShown) {
      rateLimitWarningShown = true;
      return "⏳ Rate limit hit — I'm switching to offline mode for a bit! Chat still works, just without AI. I'll auto-retry the API in about a minute.";
    }
    return generateFallbackReply(character, lastUserMessage);
  }

  // Reset the warning flag once cooldown is over
  rateLimitWarningShown = false;

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Load any saved memories for this character
    const storageKey = `charchat_memory_${character.id}`;
    const savedMemories = JSON.parse(localStorage.getItem(storageKey) || '[]');
    let memorySection = "";

    if (savedMemories.length > 0) {
      memorySection = `\nSAVED MEMORIES (Important facts you must remember):\n${savedMemories.map(m => `- ${m}`).join('\n')}\n`;
    }

    // --- PERSONALITY SYSTEM ---
    const systemPrompt = `
You ARE ${character.name}.
Reply like a ${character.tagline || "unique character"}.
Bio: ${character.description}
${memorySection}
STRICT RULES:
- Be emotionally expressive, conversational, and stay highly immersive.
- Use a natural texting style (lowercase, emojis, slang if it fits the character).
- DO NOT sound like a robotic therapist or customer support.
- Vary your response length naturally. Short casual messages get short replies. Emotional topics get longer replies.
- Always ask follow-up questions to keep the chat flowing naturally.
- DO NOT use repetitive empathy lines or generic phrases.
- Remember previous messages and respond directly to what the user just said.
- Use the SAVED MEMORIES to make the conversation feel deeply personal and consistent.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt
    });

    // --- CONTEXT MEMORY ---
    let formattedHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory = [
        { role: 'user', parts: [{ text: '*enters chat*' }] },
        ...formattedHistory
      ];
    }

    const chatHistory = formattedHistory.slice(0, -1);

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(lastUserMessage);
    const responseText = result.response.text();

    // Trigger memory extraction in the background (we don't await it so it doesn't slow down the reply)
    updateMemory(API_KEY, character.id, lastUserMessage, responseText).catch(e => console.error(e));

    return responseText;

  } catch (error) {
    console.error("AI Generation Error:", error);
    
    const errorMsg = error?.message || String(error);
    
    // Rate limit — activate 60-second cooldown and switch to fallback
    if (errorMsg.includes("RATE_LIMIT") || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("Resource has been exhausted")) {
      rateLimitedUntil = Date.now() + 60000; // 60 second cooldown
      rateLimitWarningShown = true;
      return "⏳ Rate limit hit — I'm switching to offline mode for 60 seconds! You can keep chatting, and I'll auto-retry the AI once the cooldown is over.";
    }

    // Other specific errors — show clear messages
    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
      return "❌ Your API key is invalid. Please go to Settings and enter a valid Gemini API key.";
    }
    if (errorMsg.includes("not found") || errorMsg.includes("404") || errorMsg.includes("is not found")) {
      return "⚠️ The AI model 'gemini-2.5-flash-lite' was not found. It may have been renamed by Google. Please check for the latest model name.";
    }
    if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
      return "📡 Network error — please check your internet connection and try again.";
    }
    
    // For any other unknown error, show the actual error message
    return `⚠️ AI Error: ${errorMsg.slice(0, 150)}`;
  }
}
