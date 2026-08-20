/**
 * How Flourish talks about child development.
 *
 * Flourish is a memory-keeping app. Ages below are used only to time a
 * gentle "camera ready" reminder and to group firsts. They are not a
 * screening tool and never imply a child is late.
 *
 * Internal sources (not stamped on parent-facing hero lines):
 * - CDC Learn the Signs. Act Early. (Feb 2022, with AAP) — ages when ≥75%
 *   of children can do the item. Surveillance, not screening.
 * - WHO MGRS Motor Development Study — 1st–99th percentile windows for six
 *   gross-motor milestones among healthy children. ~4% never crawl.
 * - AAP typical ranges for teething and starting solids.
 *
 * Parent-facing copy paraphrases those windows in plain language and points
 * families to a GP or child-health nurse — Flourish’s audience is Australian
 * (and school start dates vary worldwide).
 */

export type MilestoneSource = 'cdc' | 'who' | 'aap' | 'flourish';
export type MilestoneDomain = 'memory' | 'social' | 'language' | 'cognitive' | 'motor';
export type MilestoneEra =
  | 'newborn'
  | '2mo'
  | '4mo'
  | '6mo'
  | '9mo'
  | '12mo'
  | '15mo'
  | '18mo'
  | '24mo'
  | '30mo'
  | 'school';

export const ERA_ORDER: MilestoneEra[] = [
  'newborn', '2mo', '4mo', '6mo', '9mo', '12mo', '15mo', '18mo', '24mo', '30mo', 'school',
];

export const ERA_LABELS: Record<MilestoneEra, string> = {
  newborn: 'The first weeks',
  '2mo': 'Around 2 months',
  '4mo': 'Around 4 months',
  '6mo': 'Around 6 months',
  '9mo': 'Around 9 months',
  '12mo': 'Around 1 year',
  '15mo': 'Around 15 months',
  '18mo': 'Around 18 months',
  '24mo': 'Around 2 years',
  '30mo': 'Around 2½ years',
  school: 'School years',
};

export const SOURCE_LABELS: Record<MilestoneSource, string> = {
  cdc: 'Most children by this age',
  who: 'Typical window',
  aap: 'Typical range',
  flourish: 'A family first',
};

export const SOURCE_SHORT: Record<MilestoneSource, string> = {
  cdc: 'Most children',
  who: 'Typical window',
  aap: 'Typical range',
  flourish: 'Yours',
};

export const GROWTH_DISCLAIMER =
  'Ages from WHO and national child-health guidance. Flourish is for memories, not check-ups. If anything worries you, talk to your GP or child-health nurse.';

/** One week of age, used as a small grace after a window ends. */
export const MISSED_GRACE_WEEKS = 2;

/** How many weeks before a window we surface "camera ready" on the dashboard. */
export const NEAR_AHEAD_WEEKS = 4;
