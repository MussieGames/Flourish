/**
 * Font family constants. The actual font files are loaded in the root layout
 * via `@expo-google-fonts/*` and registered under these exact keys.
 */
export const fonts = {
  /** Cormorant Garamond — display / serif headings. */
  serif: "CormorantGaramond_300Light",
  serifRegular: "CormorantGaramond_400Regular",
  serifItalic: "CormorantGaramond_400Regular_Italic",
  serifSemiBold: "CormorantGaramond_600SemiBold",
  serifSemiBoldItalic: "CormorantGaramond_600SemiBold_Italic",
  /** DM Sans — UI / body. */
  sans: "DMSans_400Regular",
  sansLight: "DMSans_300Light",
  sansMedium: "DMSans_500Medium",
  /** Lora — handwritten-feeling journal text. */
  loraItalic: "Lora_400Regular_Italic",
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];
