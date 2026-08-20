/**
 * How Flourish talks about child development.
 *
 * Flourish is a memory-keeping app. Ages below are used only to time a
 * gentle "camera ready" reminder and to group firsts. They are not a
 * screening tool and never imply a child is late.
 *
 * Sources (2022 CDC revision with AAP; WHO Motor Development Study 2006):
 * - CDC Learn the Signs. Act Early. — ages when ≥75% of children can do
 *   the item. Surveillance checklists, not a substitute for AAP-recommended
 *   screening at 9, 18 and 30 months (and autism screening at 18/24).
 * - WHO MGRS Motor Development Study — 1st–99th percentile windows for six
 *   gross-motor milestones among healthy children. ~4% never crawl.
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
  | '30mo';

export const ERA_ORDER: MilestoneEra[] = [
  'newborn', '2mo', '4mo', '6mo', '9mo', '12mo', '15mo', '18mo', '24mo', '30mo',
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
};

export const SOURCE_LABELS: Record<MilestoneSource, string> = {
  cdc: 'CDC · most children by this age',
  who: 'WHO · typical window',
  aap: 'AAP · typical range',
  flourish: 'A family first',
};

export const SOURCE_SHORT: Record<MilestoneSource, string> = {
  cdc: 'CDC',
  who: 'WHO',
  aap: 'AAP',
  flourish: 'Yours',
};

export const GROWTH_DISCLAIMER =
  'Flourish is for keeping memories, not for checking development. Ages describe when many children do something — not when yours must. If anything worries you, talk to their doctor.';

/** One week of age, used as a small grace after a window ends. */
export const MISSED_GRACE_WEEKS = 2;

/** How many weeks before a window we surface "camera ready" on the dashboard. */
export const NEAR_AHEAD_WEEKS = 4;
