# Flourish — Product facts

The single source of truth for what Flourish is, costs, and promises.

**Every agent loads this file. Nothing is hardcoded into an agent prompt.**
When something changes, change it here first, then let the agents pick it up.
[`VOICE.md`](VOICE.md) governs *how* we say these things.

Each fact carries a status:

| Status | Meaning for an agent |
|---|---|
| **Shipped** | True in the product. Safe to state. |
| **Copy only** | Appears in our copy but is not built yet. **Do not state as available.** |
| **Not built** | Does not exist. Never mention. |
| **Undecided** | No answer exists. Escalate rather than guess. |

---

## What Flourish is

A private baby memory and scrapbook app for new parents, Australian-built, at
**goflourish.com.au**.

- A private, beautiful scrapbook for a child's earliest years — **shipped**
- Firsts tracking, so a parent is ready before a first arrives — **shipped**
- A private journal only the parent can read, never other family — **shipped**
- Family sharing the parent controls, view-only — **shipped**
- A printed hardcover **Heirloom** book, ordered when they want it — **not built**
  (the ordering pipeline does not exist yet; see *Ordering* below)

## What Flourish is not

Say this plainly when asked. It is a differentiator, not a disclaimer.

- Not a social network
- Not a photo filing system
- Not ad-supported
- Not training AI on children's photos
- Not selling or sharing user data

---

## Membership

Two memberships. **Heirloom is not a third one** — see *The book*.

### Seedling — free forever

- 200 photos
- 25 firsts tracked
- Basic scrapbook layouts
- Just for you — **no sharing**

### Bloom — $8 AUD / month

- Unlimited photos and videos
- All firsts
- Premium scrapbook layouts
- Share with up to 10 family members
- Cancel any time, no lock-in

Positioning: less than $2 a week to keep capturing. Bloom is the app. It does
**not** include a book, and it does not include "book discounts".

---

## The book

**Heirloom — $229 AUD once.** Not a membership, not an upgrade, not a tier.
Framing: *"Bloom is the app. Heirloom is the book."* The call to action is
**Order the Heirloom**.

What $229 covers:

- Twelve months of Bloom included
- An **11 × 8.5 inch** hardcover of the pictures they choose
- HD print on **440gsm** photographic pages
- Posted to the address they approve on the proof
- After twelve months: continue Bloom at $8/month, or return to Seedling.
  Nothing else starts.

Extra pages are **$6 each** beyond the 20 included.

### The cover is fixed

Parents do not design covers.

- Always **sage**, with the child's **name in gold**
- A **date** if they want one
- **Flourish sits quietly in the background** — the child's name is the title,
  never "Flourish"
- No colour choices, no font choices, no custom titles

If asked for a custom cover: the answer is no, and the reason is that a set
design is what makes it look like an heirloom rather than a print job.

### Ordering, and the address — **not built**

Do not promise timelines. The pipeline does not exist yet. When it does, these
rules are fixed:

- **Only the account owner can order.**
- The book goes **only** to the address on the proof the owner approved.
- **No gift-post to a different address.** A book of a child's photos is a
  physical copy of the library, so a second address is a leak we won't build
  until it can be done safely.
- **No standing home address is ever saved** on a user or baby record. It is
  collected at order, shown on the proof, used for that parcel, then the street
  address is redacted after delivery (suburb and postcode retained).
- The printer receives the approved PDF and the ship-to. Never the journal, never
  a date of birth, never the raw library.

### Print supplier

**PhotobookShop**, Melbourne — HD Layflat hardcover, 440gsm Fuji lustre
photographic paper, silver-halide, minimum 20 pages, logo removal available.
Named in the privacy policy as a disclosure recipient.

There is **no public ordering API**. Trade contact is
`business@photobookshop.com.au` / `trade@photobookshop.com.au`. Treat any
"automatic ordering" as **undecided** until that is agreed.

---

## The waitlist — read this before writing to them

The site currently sells a waitlist, not the app. What people were promised is
narrow, and it is easy to over-promise by accident.

**Promised:**

- Early access
- **Three months of Bloom, free**
- **First access to the printed book *feature***
- A hand in shaping the product

**Not promised — and must never be implied:**

- A free Heirloom book. The book costs us roughly $120–130 landed per copy. A
  free book to a whole waitlist is not a discount, it is a hole.

**Consent scope.** The signup form says: *"No spam. Just a gentle note when we
launch."* That is the entire permission we hold. It covers a launch note. It
does not cover newsletters, campaigns, or re-engagement sequences. Broadening it
requires asking first — and under the Spam Act 2003 (Cth) every send needs
consent, clear sender identification, and a working unsubscribe.

Complimentary books are for the handful of people who actually sit down and mark
up the app. That is a deliberate, individual decision — never an automated offer.

---

## Claims in our copy that are not true yet

These appear in shipped copy but are **not** backed by the product. An agent must
not state them as available, and should flag them for correction.

- **"200+ milestones"** (website and Bloom feature list) — **copy only.** The app
  ships a default catalogue of **10** firsts, plus parent-added ones.
- **"Yearly video montage"** (Bloom feature list) — **not built.** Nothing in the
  codebase produces one.
- **"25 milestones tracked"** as a Seedling cap — **copy only.** Not enforced in
  code.
- **Billing** — **not built.** The plans screen explains each option and says
  payments aren't open yet; nothing is charged and no membership changes. Real
  billing will be App Store / Google Play, and `plan` is server-only — the app
  cannot set its own membership.

## Undecided — escalate, don't answer

- **Launch date.** There isn't one. This will be the most common question asked.
  Never invent, never estimate, never say "soon" with a number attached.
- Pricing beyond what is above (annual plans, regions, currencies).
- Whether the website becomes a desktop product later.
- Automated ordering with PhotobookShop.

---

## Privacy and data, in one paragraph

Every memory belongs to the parent's account. Only family members they
explicitly invite can see the scrapbook, and the **journal is owner-only** — not
even invited family can read it. There are no ads, no data sales, and no AI
training on children's photos. Family members are view-only. The app's Firestore
and Storage rules deny everything by default.

Full model: [`SECURITY.md`](../SECURITY.md).

---

## Contact and infrastructure

- Public contact: **hello@goflourish.com.au**
- Domain DNS: Cloudflare. Mail forwarding: ImprovMX.
- Marketing site + waitlist: Firebase project `flourish-7b8c8`
- Mobile app: `flourish-app` (production), `flourish-app-dev` (development)
- Waitlist confirmations are sent by the CTA Cloud Function. **Agents do not
  send transactional email.**
