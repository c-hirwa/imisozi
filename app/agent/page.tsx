import type { Metadata } from "next";
import { AgentApp } from "@/components/agent/AgentApp";

export const metadata: Metadata = { title: "Agent dashboard", robots: { index: false } };
export default function AgentPage() { return <AgentApp />; }
