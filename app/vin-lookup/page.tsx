export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import VinLookupClient from "./VinLookupClient";

export const metadata: Metadata = {
  title: "VIN Lookup Directory — VinVault",
  description: "Official and community-vetted vehicle registration lookup services by country. Find VIN check tools for Denmark, UK, USA, Germany, Italy, France, and more.",
};

const PRE_POPULATED: VinService[] = [
  { id: "pp-dk", service_name: "Motorregister (Skat)", country_name: "Denmark", country_code: "DK", service_url: "https://motorregister.skat.dk/", description: "Official Danish vehicle registration lookup. Search by registration plate or VIN.", service_type: "government", is_free: true, latitude: 55.68, longitude: 12.57, is_approved: true },
  { id: "pp-se", service_name: "Transportstyrelsen", country_name: "Sweden", country_code: "SE", service_url: "https://fu-regnr.transportstyrelsen.se/extweb/SokFordon", description: "Swedish Transport Agency vehicle register. Look up registration, tax class, and roadworthiness.", service_type: "government", is_free: true, latitude: 59.33, longitude: 18.07, is_approved: true },
  { id: "pp-no", service_name: "Statens Vegvesen", country_name: "Norway", country_code: "NO", service_url: "https://www.vegvesen.no/kjoretoy/kjop-og-salg/sjekk-kjoretoyets-historikk/", description: "Norwegian Public Roads Administration. Free vehicle history including ownership and technical data.", service_type: "government", is_free: true, latitude: 59.91, longitude: 10.75, is_approved: true },
  { id: "pp-fi", service_name: "Traficom", country_name: "Finland", country_code: "FI", service_url: "https://www.traficom.fi/fi/asioi-kanssamme/sahkoiset-palvelut/ajoneuvojen-tiedot", description: "Finnish Transport and Communications Agency vehicle data service.", service_type: "government", is_free: true, latitude: 60.17, longitude: 24.94, is_approved: true },
  { id: "pp-gb", service_name: "DVLA Vehicle Enquiry", country_name: "United Kingdom", country_code: "GB", service_url: "https://www.gov.uk/get-vehicle-information-from-dvla", description: "UK Government free vehicle enquiry service. Check tax, MOT, and basic vehicle details.", service_type: "government", is_free: true, latitude: 51.5, longitude: -0.12, is_approved: true },
  { id: "pp-nl", service_name: "RDW Voertuiginformatie", country_name: "Netherlands", country_code: "NL", service_url: "https://ovi.rdw.nl/", description: "Dutch Vehicle Authority registration lookup. Full technical and registration history.", service_type: "government", is_free: true, latitude: 52.37, longitude: 4.89, is_approved: true },
  { id: "pp-fr", service_name: "Histovec", country_name: "France", country_code: "FR", service_url: "https://histovec.interieur.gouv.fr/", description: "Official French vehicle history service from the Ministry of the Interior. Free registration and technical inspection history.", service_type: "government", is_free: true, latitude: 48.86, longitude: 2.35, is_approved: true },
  { id: "pp-de", service_name: "ADAC Fahrzeughistorie", country_name: "Germany", country_code: "DE", service_url: "https://www.adac.de/rund-ums-fahrzeug/autokauf-verkauf/gebrauchtwagen/fahrzeughistorie/", description: "ADAC vehicle history report. Check previous owners, accident history, and mileage records.", service_type: "commercial", is_free: false, latitude: 48.14, longitude: 11.58, is_approved: true },
  { id: "pp-it", service_name: "ACI Visura", country_name: "Italy", country_code: "IT", service_url: "https://www.acisport.it/it/home", description: "Italian Automobile Club vehicle registration and ownership lookup.", service_type: "government", is_free: false, latitude: 41.9, longitude: 12.5, is_approved: true },
  { id: "pp-es", service_name: "DGT Consulta de Vehículos", country_name: "Spain", country_code: "ES", service_url: "https://sede.dgt.gob.es/es/vehiculos/consulta-de-vehiculos/", description: "Spanish Directorate-General of Traffic vehicle registration database.", service_type: "government", is_free: true, latitude: 40.42, longitude: -3.7, is_approved: true },
  { id: "pp-be", service_name: "DIV Voertuigenregister", country_name: "Belgium", country_code: "BE", service_url: "https://www.mobilit.fgov.be/nl/voertuigen/registratie", description: "Belgian Directorate for Vehicle Registration services.", service_type: "government", is_free: true, latitude: 50.85, longitude: 4.35, is_approved: true },
  { id: "pp-ch", service_name: "MOFIS", country_name: "Switzerland", country_code: "CH", service_url: "https://www.bazg.admin.ch/bazg/de/home/dienstleistungen/mofis.html", description: "Swiss Federal Roads Office motor vehicle information system.", service_type: "government", is_free: false, latitude: 46.95, longitude: 7.45, is_approved: true },
  { id: "pp-us", service_name: "NHTSA VIN Decoder", country_name: "United States", country_code: "US", service_url: "https://vpic.nhtsa.dot.gov/decoder/", description: "Free US government VIN decoder from the National Highway Traffic Safety Administration. Technical specifications and recall data.", service_type: "government", is_free: true, latitude: 38.9, longitude: -77.04, is_approved: true },
  { id: "pp-au", service_name: "PPSR Vehicle Check", country_name: "Australia", country_code: "AU", service_url: "https://www.ppsr.gov.au/", description: "Australian Government Personal Property Securities Register. Check if a vehicle has money owing, is stolen, or written off.", service_type: "government", is_free: false, latitude: -33.87, longitude: 151.21, is_approved: true },
  { id: "pp-jp", service_name: "MLIT Vehicle Inspection", country_name: "Japan", country_code: "JP", service_url: "https://www.mlit.go.jp/jidosha/jidosha_fr1_000043.html", description: "Japanese Ministry of Land, Infrastructure, Transport and Tourism vehicle inspection information.", service_type: "government", is_free: true, latitude: 35.69, longitude: 139.69, is_approved: true },
];

interface VinService {
  id: string;
  service_name: string;
  country_name: string;
  country_code: string;
  service_url: string;
  description?: string;
  service_type: string;
  is_free: boolean;
  latitude?: number;
  longitude?: number;
  is_approved: boolean;
}

async function getServices(): Promise<VinService[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return PRE_POPULATED;
  try {
    const res = await fetch(
      `${url}/rest/v1/vin_lookup_services?is_approved=eq.true&order=country_name.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return PRE_POPULATED;
    const dbServices: VinService[] = await res.json();
    if (dbServices.length === 0) return PRE_POPULATED;
    return dbServices;
  } catch { return PRE_POPULATED; }
}

export default async function VinLookupPage() {
  const services = await getServices();
  return <VinLookupClient services={services} />;
}
