/**
 * Purchases service — RevenueCat integration layer.
 *
 * RevenueCat handles:
 *  - iOS In-App Purchases (StoreKit 2)
 *  - Google Play Billing
 *  - Entitlement management (who has Bloom access)
 *  - Subscription lifecycle (trial, billing retry, cancellation)
 *  - Cross-platform receipt validation (server-side)
 *
 * Setup required before this code is live:
 *  1. Create a RevenueCat account at revenuecat.com
 *  2. Add your app in the RevenueCat dashboard
 *  3. Create products in App Store Connect and Google Play Console:
 *       com.flourish.bloom.monthly  — $8/month
 *       com.flourish.bloom.annual   — $69/year
 *       com.flourish.heirloom       — $79 one-time non-consumable
 *  4. Link products to RevenueCat offerings
 *  5. Add API key to EAS secrets:
 *       EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
 *       EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
 *
 * RevenueCat SDK for Expo requires a custom dev client (not Expo Go).
 * Install: npm install react-native-purchases
 * Add to app.json plugins: ["react-native-purchases"]
 *
 * This file provides the integration layer — the UI is already wired to
 * call handleSelectBloom / handleSelectHeirloom in profile.tsx.
 * Replace the showToast() stubs in those handlers with calls from here.
 */

// Product identifiers — match exactly what's set in App Store Connect / Play Console
export const PRODUCT_IDS = {
  bloomMonthly: 'com.flourish.bloom.monthly',
  bloomAnnual: 'com.flourish.bloom.annual',
  heirloom: 'com.flourish.heirloom',
} as const;

// RevenueCat entitlement identifiers — set these in the RevenueCat dashboard
export const ENTITLEMENTS = {
  bloom: 'bloom_access',
  heirloom: 'heirloom_access',
} as const;

/**
 * Initialise RevenueCat — call once at app startup, after the user is
 * identified (so entitlements are linked to the correct account).
 *
 * Uncomment when react-native-purchases is installed:
 */
export async function initializePurchases(userId: string): Promise<void> {
  // import Purchases from 'react-native-purchases';
  // import { Platform } from 'react-native';
  //
  // const apiKey = Platform.OS === 'ios'
  //   ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!
  //   : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!;
  //
  // await Purchases.configure({ apiKey, appUserID: userId });
  console.warn('[Purchases] RevenueCat not yet initialised. Add react-native-purchases and uncomment.');
}

/**
 * Purchase Bloom — monthly or annual.
 * Returns true on success, false if user cancelled, throws on error.
 */
export async function purchaseBloom(cycle: 'monthly' | 'annual'): Promise<boolean> {
  // import Purchases from 'react-native-purchases';
  //
  // const productId = cycle === 'monthly' ? PRODUCT_IDS.bloomMonthly : PRODUCT_IDS.bloomAnnual;
  // const offerings = await Purchases.getOfferings();
  // const pkg = offerings.current?.availablePackages.find(p => p.product.productIdentifier === productId);
  // if (!pkg) throw new Error('Product not found. Check RevenueCat product configuration.');
  //
  // const { customerInfo } = await Purchases.purchasePackage(pkg);
  // return !!customerInfo.entitlements.active[ENTITLEMENTS.bloom];
  throw new Error('RevenueCat not yet configured. See src/services/purchases.ts for setup instructions.');
}

/**
 * Purchase Heirloom (one-time non-consumable).
 */
export async function purchaseHeirloom(): Promise<boolean> {
  // import Purchases from 'react-native-purchases';
  //
  // const offerings = await Purchases.getOfferings();
  // const pkg = offerings.current?.availablePackages.find(p => p.product.productIdentifier === PRODUCT_IDS.heirloom);
  // if (!pkg) throw new Error('Product not found.');
  //
  // const { customerInfo } = await Purchases.purchasePackage(pkg);
  // return !!customerInfo.entitlements.active[ENTITLEMENTS.heirloom];
  throw new Error('RevenueCat not yet configured. See src/services/purchases.ts for setup instructions.');
}

/**
 * Restore purchases — required by App Store guidelines.
 * Must be accessible from the Plan page.
 */
export async function restorePurchases(): Promise<boolean> {
  // import Purchases from 'react-native-purchases';
  // const { customerInfo } = await Purchases.restorePurchases();
  // return !!customerInfo.entitlements.active[ENTITLEMENTS.bloom];
  throw new Error('RevenueCat not yet configured.');
}

/**
 * Check current entitlement status — used to gate premium features.
 */
export async function getEntitlementStatus(): Promise<'seedling' | 'bloom' | 'heirloom'> {
  // import Purchases from 'react-native-purchases';
  // const info = await Purchases.getCustomerInfo();
  // if (info.entitlements.active[ENTITLEMENTS.heirloom]) return 'heirloom';
  // if (info.entitlements.active[ENTITLEMENTS.bloom]) return 'bloom';
  return 'seedling';
}
