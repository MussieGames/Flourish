import type { PlanId } from '@/types/models';

/** Seedling is generous for chosen moments — not a daily camera roll. */
export const SEEDLING_PHOTO_LIMIT = 300;
export const SEEDLING_VIDEO_LIMIT = 20;

export function hasSharingAccess(plan: PlanId | undefined | null): boolean {
  return plan === 'bloom' || plan === 'heirloom';
}

export function hasUnlimitedMedia(plan: PlanId | undefined | null): boolean {
  return plan === 'bloom' || plan === 'heirloom';
}

export function seedlingUsage(photos: number, videos: number) {
  const photoPct = photos / SEEDLING_PHOTO_LIMIT;
  const videoPct = videos / SEEDLING_VIDEO_LIMIT;
  return {
    photos,
    videos,
    photoLimit: SEEDLING_PHOTO_LIMIT,
    videoLimit: SEEDLING_VIDEO_LIMIT,
    photoPct,
    videoPct,
    /** Quiet meter — only surface when they’re actually near the cap. */
    showMeter: photoPct >= 0.8 || videoPct >= 0.8,
  };
}
