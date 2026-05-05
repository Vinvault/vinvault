import type { Metadata } from "next";
import SpotForm from "./SpotForm";

export const metadata: Metadata = {
  title: "Submit a Sighting — VinVault",
  description: "Log a car sighting. Help build the global activity map for rare and collectible cars.",
};

export default function SpotPage() {
  return <SpotForm />;
}
