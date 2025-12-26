---
title: "Vibe coding an app"
description: "A scientific experiment on the limits of AI-assisted development"
pubDate: 2025-12-10
author: "Jonas Coelho"
tags: ["AI", "coding", "android"]
---


Is it possible to vibe coding an entire functional app from scratch with no prior knowledge? In the name of science, I decided to try and you can judge it yourself!

Even though I've been coding in Python for over 10 years and experimented with different languages, I never got close to Android development.

But after 450 million tokens, 104 hours, 268 commits I finally got the app I envisioned. And now, more than ever, I'm convinced AI won't make developers obsolete. This is the detailed report.

## THE RULES:
- Done ENTIRELY by vibe coding. I wouldn't touch files if editing more than 1 line was required
- The MVP needed to be something I'd actually use
- 100% serverless

## THE FINDINGS:

**Cursor wins**

I experimented with ChatGPT, Gemini Agent in Android Studio, Claude (chat) and VS Copilot but none matched Cursor's agent. It would exceed my requests, even with confusing prompts. However, I could also notice how fast other agents were catching up. While this conclusion was true for the duration of the project, I predict it might not hold within the short term.

### Complexity slope (or slop)

The initial 60% was the easiest. I could request advanced features and Cursor delivered flawlessly. However, the final stage went downhill. Changes required surgical precision with answers provided beforehand.

### Required knowledge

Many times the agent implemented functional but non-ideal solutions because my requests were naïve. This happened despite instructions for "Always follow best practices". I realized I needed the basics, so I paused to learn Kotlin fundamentals, which helped guide prompts better.

### Prompt engineering hoax

**Major confirmation: "Prompt Engineering" isn't real.** Writing "make no mistakes" won't prevent crashes. You must understand code and programming logic. A good prompt is knowing what to ask, not how to ask.

While I didn't write code, I often asked "How do you plan to do this?" and guided it through other routes because initial choices were hallucinations. Luckily, Cursor introduced planning mode mid-project, making guardrailing easier.

### What it can't do

UI and project management are far from replaceable. Creating the logo was a headache and generated images haunted me. GenAI fails at subjective aspects (friendly, modern, motion). I made the logo in PowerPoint and was happy with it.

### Time breakdown

25% of the time was invested in debugging. Most of this time was due to the AI circling around the same mistakes. Since I couldn't intervene directly with the code, I had 2 options: understand myself the cause and guide it through the right solution or start a new conversation with a different reasoning model. The former was faster, but the latter would also work (some times).

This is how I spent the rest of the time:
- 39% Feature development
- 22% Polishing & testing
- 15% UX/UI design

## THE RESULT

<p float="left">
  <img src="https://github.com/off-lineLabs/off-lineLabs.github.io/blob/main/public/nutcracker-screenshot-1.png?raw=true" alt="Image 1" height="400" />
  <img src="https://github.com/off-lineLabs/off-lineLabs.github.io/blob/main/public/nutcracker-screenshot-2.png?raw=true" alt="Image 2" height="400" />
  <img src="https://github.com/off-lineLabs/off-lineLabs.github.io/blob/main/public/nutcracker-screenshot-3.png?raw=true" alt="Image 3" height="400" />
  <img src="https://github.com/off-lineLabs/off-lineLabs.github.io/blob/main/public/nutcracker-screenshot-4.png?raw=true" alt="Image 4" height="400" />
</p>

I got my MVP and I'm happy with it. Would I release commercially? Never. Good for a hobby project by someone unfamiliar with Kotlin, but far from professional.

**LLM cost would've been $151, but I paid only $60 for three months of Pro subscription**. Plus the time I spent instead of enjoying Sundays.

An experienced programmer could finish faster, better, using fewer tokens.

Vibe coding can make an app from scratch. We can expect faster transitions between languages, but seems naïve to think it empowers non-programmers that much.

UI designers, Project Managers and QA testers will still be around.

You can check the [source code on GitHub](https://github.com/off-lineLabs/nutcracker) and download the app from Google Play by clicking below:

<a href="https://play.google.com/store/apps/details?id=com.offlinelabs.nutcracker" target="_blank">
  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" height="100" />
</a>

*P.S.: Shout out to Open Food Facts and Wrkout for providing open source databases that made this possible.*