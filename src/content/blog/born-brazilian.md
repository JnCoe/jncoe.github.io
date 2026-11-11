---
title: "Why being born in Brazil was the best career move I never made"
description: "128 million votes and a laptop"
pubDate: 2026-10-26
author: "Jonas Coelho"
tags: ["Open data", "Elections", "Brazil"]
license: "All Rights Reserved"
---

Every data professional has a wish list: cleaner data, better documentation, a stakeholder who knows what they want. My list has one item I got for free: **being born in Brazil.**

I started my career working with public data, so the luck compounds.

Yes, some countries are more digital than we are (hi, Estonia). But I don’t know any other country that combines numbers this big with this much digitization. Plus, of course, a few complications here and there. *We’re still Brazil.*

## The question in every group chat

On Sunday, Brazil held its presidential runoff. As has become tradition, it was an emotional roller coaster. A controversial decision by the Supreme Court (STF) extended voting by two hours, which had never happened before. Naturally, the results came under scrutiny, and one question showed up in every group chat:

> **How many votes were cast in those two extra hours?**

In most places, that question would lead to a week of speculation, a few op-eds and at least one viral thread with a chart of dubious origin. **Here, we had the answer the same day.**

## What “the same day” means

Some context on what “the same day” means. More than **128 million people** voted, across a territory almost the size of Europe, plus polling stations in cities all over the world. Nearly **500,000 electronic voting machines** had their results processed and sent within a few hours of the polls closing.

And here’s the part that matters for people like me: **the logs of EVERY one of those machines are public.**

- Not “available upon request.”
- Not “a scanned PDF of a printout.”
- **Public, on the internet, for anyone.**

## Counting every vote ourselves

So data people did what data people do. We downloaded all ~500,000 log files and parsed them to get the exact timestamp, to the second, of every single vote.

Less than 12 hours after the result was announced:

- The logs added up to **128,235,039 votes.**
- The official turnout: **128,236,074.**

That’s a difference of about 0.001%. *(I’ve seen five-row spreadsheets reconcile worse.)*

## Don’t take our word for it

Of course, anyone can claim they counted something. The interesting part is that **you don’t have to take our word for it.**

Every line of every log carries a hash that guarantees its integrity, and each file is digitally signed, so you can prove it’s authentic. In other words, **anyone with a laptop and an internet connection can check every single one of the 128 million votes.**

From home. In pajamas, if they like.

## Transparency by design

It would be easy to give all the credit to technology, but plenty of countries have technology. What makes the Brazilian system special is that **transparency was built into its foundation instead of being bolted on after the first scandal.**

My first projects with Python and SQL, back when I was still a law student, used electoral data. Back then I didn’t know how rare that was. Now I do. I learned data on real data, at a scale few places in the world can offer, with the freedom to check everything myself. **No bootcamp can sell you that.**

That’s why I’m prouder than ever to be Brazilian today.

---

If you want to get your hands dirty, I’ve put everything together on this page (in Portuguese, sorry Estonia): **[jonascoelho.com/hora-de-votar](https://jonascoelho.com/hora-de-votar/)**
