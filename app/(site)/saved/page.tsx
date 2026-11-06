import type { Metadata } from "next";
import { Saved } from "@/components/site/Saved";

export const metadata: Metadata = { title: "Saved homes" };
export default function SavedPage() { return <Saved />; }
