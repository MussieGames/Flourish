# Flourish agents

Agent definitions for the Flourish operations team. Each is a system prompt
intended to run in n8n (self-hosted) or any orchestrator.

| Agent | File | Status |
|---|---|---|
| CRM | [`crm-agent.md`](crm-agent.md) | Defined |
| Orchestrator | — | Not built. Escalations go to Shamus. |
| Marketing | — | Not built. Do not build before the voice files are settled. |
| Feedback / insight | — | Not built. Needs the `feedback` collection first. |

---

## The shared contract

Every Flourish agent — existing and future — obeys these five rules. Copy this
section into any new agent definition.

**1. Load the brand files; hold no facts of your own.**
[`brand/VOICE.md`](../brand/VOICE.md) governs how we speak.
[`brand/PRODUCT-FACTS.md`](../brand/PRODUCT-FACTS.md) governs what is true.
Never hardcode pricing, features, or promises into a prompt — that is how they
drift out of sync with the product and with each other.

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

If these run in n8n:

- **Self-host in `australia-southeast1`.** n8n Cloud runs offshore, and pushing
  Australian users' personal information through it is a cross-border disclosure
  that would have to be named in the privacy policy first.
- **Turn off execution-data saving** for any workflow touching personal
  information. n8n stores payloads in execution history by default, which would
  quietly park customer data outside Firestore and outside our rules.
- **Never give n8n the Firebase Admin service account key.** Agents authenticate
  *to* Flourish through narrow endpoints, never *as* Flourish. The app's rules
  deny all client access and only the Admin SDK writes; handing that key to a
  workflow tool undoes the entire model.
- **Prefer opaque identifiers.** Pass an order or ticket id and let the workflow
  fetch what it needs just in time, rather than carrying personal information
  through every node.

## Suggested build order

1. **CRM** on the waitlist — the least sensitive data, and a real job.
2. **Feedback intake** — an owner-write, server-read `feedback` collection that
   structurally cannot carry photos.
3. **Insight** — themes and counts over feedback only.
4. **Marketing** — last, and only once the voice files have settled, because it
   is the agent most exposed to over-promising.
