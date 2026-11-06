import type { Metadata } from "next";
import { Suspense } from "react";
import { Browse } from "@/components/site/Browse";

export const metadata: Metadata = { title: "Homes to rent and buy in Kigali" };

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="h-[70vh]" />}>
      <Browse />
    </Suspense>
  );
}
