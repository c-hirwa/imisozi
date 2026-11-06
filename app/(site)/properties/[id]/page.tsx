import { Suspense } from "react";
import { SEED_IDS } from "@/lib/data";
import { ListingView } from "@/components/site/ListingView";

export function generateStaticParams() {
  return SEED_IDS.map((id) => ({ id }));
}

export default async function ListingPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="h-[70vh]" />}>
      <ListingView id={id} />
    </Suspense>
  );
}
