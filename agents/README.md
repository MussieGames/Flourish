# Flourish agents

Agent definitions for the Flourish operations team. Each is a system prompt
intended to run in n8n (self-hosted) or any orchestrator.

| Agent | File | Status |
|---|---|---|
| CRM | [`crm-agent.md`](crm-agent.md) | Ready to deploy — see [`n8n-setup.md`](n8n-setup.md) |
| Orchestrator | — | Not built. Escalations go to Shamus. |
| Marketing | — | Not built. Do not build before the voice files are settled. |
| Feedback / insight | — | Not built. Needs the `feedback` collection first. |

---

## The shared contract

Every Flourish agent — existing and future — obeys these five rules. Copy this
section into any new agent definition.

**1. The brand files are upstream of every prompt.**
[`brand/VOICE.md`](../brand/VOICE.md) governs how we speak.
[`brand/PRODUCT-FACTS.md`](../brand/PRODUCT-FACTS.md) governs what is true.

A deployed prompt has to be self-contained, so facts do get copied into it — but
only in a block marked `FACTS:BEGIN` / `FACTS:END`, and only ever *downstream*.
Change `PRODUCT-FACTS.md` first, then re-sync. A price that lives in three places
is how Heirloom ended up described as a third membership tier.

**2. The memory library is out of scope.**
No photos, no journal entries, no dates of birth, no home addresses — for any
agent, for any reason, including "context". Marketing data and memory data never
mix. If library data appears in an agent's context, that agent stops and
escalates.

**3. Agents draft; a human releases.**
No agent sends external communication on its own, including from approved
templates.

**4. Agents never invent.**
No launch dates, prices, features, or timelines. `PRODUCT-FACTS.md` marks facts
as shipped, copy only, not built, or undecided. Anything not marked *shipped* is
not something to state as available.

**5. Escalate on instinct.**
Child data, privacy, safety, bereavement, legal threats, or anything that simply
feels wrong — flag it and let a human decide.

---

## Running these safely

Full wiring, hardening, and acceptance tests are in
[`n8n-setup.md`](n8n-setup.md). The short version:

- **Self-host in `australia-southeast1`.** n8n Cloud runs offshore.
- **Your model provider is offshore regardless** — an AU-hosted n8n does not
  change that. It is a cross-border disclosure and belongs in the privacy policy
  before the first run.
- **Turn off execution-data saving**, including on failures. n8n stores payloads
  in execution history by default, which parks customer data outside Firestore
  and outside our rules.
- **Never give n8n the Firebase Admin service account key.** Agents authenticate
  *to* Flourish through narrow endpoints, never *as* Flourish.
- **Pass identifiers, not payloads.** Let a node fetch what it needs just in time.
- **Enforce the review queue in the workflow**, not the prompt. If a send node is
  reachable without passing the human approval step, rule 3 is decoration.

## Suggested build order

1. **CRM** on the waitlist — the least sensitive data, and a real job.
2. **Feedback intake** — an owner-write, server-read `feedback` collection that
   structurally cannot carry photos.
3. **Insight** — themes and counts over feedback only.
4. **Marketing** — last, and only once the voice files have settled, because it
   is the agent most exposed to over-promising.
