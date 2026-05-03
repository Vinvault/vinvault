import type { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Car — VinVault Registry",
  description: "Submit a Ferrari 288 GTO chassis record to the VinVault registry. Help document every car ever produced.",
  openGraph: {
    title: "Submit a Car — VinVault",
    description: "Help complete the Ferrari 288 GTO world registry by submitting a chassis record.",
    siteName: "VinVault Registry",
  },
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ chassis?: string }>;
}) {
  const { chassis } = await searchParams;
  return <SubmitForm prefillChassis={chassis} />;
}
