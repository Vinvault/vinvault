import type { Metadata } from "next";
import SpotForm from "./SpotForm";

export const metadata: Metadata = {
  title: "Submit a Spotting — VinVault",
  description: "Log a car spotting. Help build the global activity map for rare and collectible cars.",
};

export default function SpotPage() {
  return <SpotForm />;
}
