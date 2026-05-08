import type { Metadata } from "next";
import SpotForm from "./SpotForm";

export const metadata: Metadata = {
  title: "Spot a Car",
  description: "Log a rare car sighting in 60 seconds. Earn points for photos, numberplates, and VIN identification.",
};

export default function SpotPage() {
  return <SpotForm />;
}
