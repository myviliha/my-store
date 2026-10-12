"use client";

import type { ReactNode } from "react";

import { useOpenPricing } from "./panel-store";

/**
 * A Pricing control for a server component (the footer): a button, because pricing is a panel of the
 * home screen's conversation and not a route (`panel-store.ts`).
 */
export function PricingButton({ className, children }: { className?: string; children: ReactNode }) {
  const openPricing = useOpenPricing();
  return (
    <button type="button" onClick={openPricing} className={className}>
      {children}
    </button>
  );
}
