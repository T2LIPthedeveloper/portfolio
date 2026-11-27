"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
  () => import("@/components/layout/CustomCursor").then((mod) => mod.CustomCursor),
  { ssr: false }
);

export function DeferredCustomCursor() {
  return <CustomCursor />;
}
