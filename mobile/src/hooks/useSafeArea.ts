import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Thin wrapper so screens import a single hook for top/bottom insets. */
export function useSafeArea() {
  return useSafeAreaInsets();
}
