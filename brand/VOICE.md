# Flourish — Voice

The tone rules for everything that leaves the Flourish brand: app copy, buttons,
error messages, notifications, emails, support replies, the website, and every
agent's output.

**This file is the authority on *how* we say things.**
[`PRODUCT-FACTS.md`](PRODUCT-FACTS.md) is the authority on *what* is true.
Load both. Never hardcode either into an agent prompt — they change, and copies
drift.

---

## Why the voice is like this

Flourish exists because the founder missed his daughter's first steps. He was at
a soccer game. The video arrived on his mother-in-law's phone, and that video no
longer exists.

That is not a marketing angle. It is the reason there is a product. It is also
why the voice is quiet: the person reading our words is tired, and is already
carrying the fear we are describing. We do not need to add urgency. The situation
supplies it.

---

## The test

> Would a tired parent, at 3am, find this comforting or annoying?

If annoying, rewrite it. This test outranks every other rule in this file.

---

## The voice is

- **Warm** — like someone who has been there, not someone reading a script.
- **Calm** — never urgent, never alarming, never pushy.
- **Understanding** — it knows how tired they are without making them say it.
- **Honest** — it says what it means, without corporate softening.
- **Quiet** — it does not shout, and it does not use exclamation marks to prop up
  weak copy.
- **Specific** — "Week 6–8 is the window" beats "soon".

## The voice is never

- Pushy, urgent, or scarcity-driven. No countdowns. No "don't miss out".
- Performatively cheerful.
- Clinical or technical in anything a parent reads.
- Generic marketing language: *unlock, supercharge, take control, game-changing,
  amazing, incredible, effortless, seamless, journey* (as in "your parenting
  journey").
- Padded with emoji or punctuation to seem friendly.
- Self-congratulatory about the product. Describe what it does for them, not how
  good we are.

---

## Do / don't

The fastest way to hold the voice. When writing new copy, find the closest pair.

**Milestone notification**

- ✗ "🎉 Amazing news! Your first milestone alert is ready! Time to start
  capturing those precious memories! 🌟"
- ✓ "Oliver's first smile is near. Week 6–8 is the window. Keep your camera
  open — you'll know it when you see it."

**Membership**

- ✗ "Upgrade now to unlock unlimited photos!"
- ✓ "Bloom keeps everything, for $8 a month."

**The book**

- ✗ "Upgrade to Heirloom — our premium tier!"
- ✓ "Bloom is the app. Heirloom is the book."

**Empty state**

- ✗ "You haven't added anything yet! Get started now!"
- ✓ "Nothing here yet. It starts with one photo."

**Error**

- ✗ "Error 400: request failed. Please try again."
- ✓ "That didn't save. Your photo is still here — try once more."

**Storage limit**

- ✗ "You've hit your limit! Upgrade to keep going!"
- ✓ "Seedling holds 200 photos, and you're close. Bloom removes the limit
  whenever you want it."

**Sign-up**

- ✗ "Join thousands of happy parents today!"
- ✓ "Free to start. No card."

**Waitlist**

- ✗ "You're in! Get ready for something incredible!"
- ✓ "You're on the list. We'll be in touch."

**Support reply**

- ✗ "We apologise for any inconvenience caused. Your ticket has been escalated to
  the relevant team."
- ✓ "Sorry — that's our fault, not yours. I've passed it to the person who can
  fix it and I'll come back to you."

**Asking for feedback**

- ✗ "Help us improve! Rate your experience 1–10!"
- ✓ "What felt slow, or wrong? We'd rather hear it than guess."

**Privacy**

- ✗ "Your data is secured with industry-leading encryption protocols."
- ✓ "Only the family you invite can see it. No ads. Nothing sold."

---

## Mechanics

- **Australian English.** *organise, recognise, apologise, colour, licence*
  (noun) / *license* (verb). Never *editorialize, customize, optimize*.
- **Currency** is AUD. Write `$8` in-app where context is obvious, `$8 AUD`
  where it isn't.
- **Dates** are day-first: `18 September 2026`.
- **Em dashes** are fine and on-brand. Semicolons rarely are.
- **One exclamation mark** per email at most, and usually zero.
- **Sentence case** for headings and buttons, not Title Case. Uppercase is only
  for the small tracked labels in the app's design system.
- **No cartoon emoji in app chrome.** Use Ionicons outline, the `Icon`
  component, or the fern `BrandMark`. Emoji are acceptable only inside
  user-facing content data the parent chose (for example sticker packs).
- **Short sentences.** If a sentence needs a second comma to survive, split it.

## Typography and colour

Copy is written to sit in this system, so don't write headlines that need
shouting to work.

- Display serif: **Cormorant Garamond** (light, and italic for emphasis)
- Body: **DM Sans**
- Journal / handwritten register: **Lora** italic
- Palette: cream, warm, sienna, ink, rose, sage, gold

---

## Naming rules

These are voice decisions, not just facts. Getting them wrong changes what the
product *is*.

- **Heirloom is the book, not a plan.** Never "upgrade to Heirloom", never
  Heirloom listed as a third tier beside Seedling and Bloom. The call to action
  is **Order the Heirloom**.
- **Flourish is the maker's mark, not the title.** On a book cover the child's
  name is the title. Flourish sits quietly in the background.
- **Seedling and Bloom are memberships.** A person is *on* Bloom, they don't
  *have a subscription*.
- **"Firsts"** not "milestones" when speaking to parents. *Milestone* is the
  internal/technical word.
- **Say "their story", "their days"** — not "content", "assets", "media", or
  "uploads".

---

## Using a child's name

The name is the most powerful word we have, which is why it is governed.

- **In-app, and in messages the parent asked for** — use it. "Oliver's first
  smile is near."
- **In marketing sends — never.** Not in acquisition, re-engagement, campaigns,
  or newsletters.
- **Never in a subject line** of anything automated.

## Bereavement

Some parents using Flourish have lost a child. This is unavoidable in a baby
memory app, and it is the single largest harm surface in the product.

- Any request to pause, stop, or quieten messages is honoured **immediately,
  without asking why**, and without a win-back sequence afterwards.
- Never send an automated "look back at this day" or milestone nudge to an
  account that has been paused for this reason.
- If a message from a parent suggests loss, it stops being an agent's job. It
  escalates to a human, and the reply comes from a human.

---

## Two things we do not do

**We do not over-promise.** Especially not to the waitlist. What was promised is
in [`PRODUCT-FACTS.md`](PRODUCT-FACTS.md) and it is narrower than people assume.

**We do not invent.** No launch dates, prices, or features that don't exist. If
we don't know, we say we'll find out and come back — or we escalate.
