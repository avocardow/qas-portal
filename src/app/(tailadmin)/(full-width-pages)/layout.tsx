"use client";
import React from "react";
import Providers from "@/app/(pages)/providers";

export default function FullWidthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div>{children}</div>
    </Providers>
  );
}
