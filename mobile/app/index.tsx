import React from "react";
import { Redirect } from "expo-router";

/** Entry point — the root navigator handles redirects, this is a safe default. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
