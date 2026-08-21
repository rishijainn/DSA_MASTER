import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "DSA Master — Stop grinding. Start leveling.",
  description:
    "DSA Master turns LeetCode practice into an RPG progression system. Auto-tracked sessions, FSRS-powered recommendations, and a Hunter Rank (S/A/B) earned from real solves.",
};

export default function LandingPage() {
  return <LandingClient />;
}
