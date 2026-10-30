export interface Region {
  code: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
  regions: Region[];
  /** Label for the sub-national unit. */
  regionLabel: string;
}

const r = (names: string[]): Region[] => names.map((name) => ({ code: name.toLowerCase().replace(/[^a-z]+/g, "-"), name }));

export const countries: Country[] = [
  {
    code: "IN",
    name: "India",
    regionLabel: "State / UT",
    regions: r([
      "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
      "Uttar Pradesh", "West Bengal",
    ]),
  },
  {
    code: "US",
    name: "United States",
    regionLabel: "State",
    regions: r(["California", "Florida", "Illinois", "New York", "Texas", "Washington"]),
  },
  {
    code: "GB",
    name: "United Kingdom",
    regionLabel: "Nation",
    regions: r(["England", "Northern Ireland", "Scotland", "Wales"]),
  },
  {
    code: "CA",
    name: "Canada",
    regionLabel: "Province",
    regions: r(["Alberta", "British Columbia", "Ontario", "Quebec"]),
  },
];

export const DEFAULT_COUNTRY = "IN";
export const DEFAULT_REGION = "telangana";

export function getCountry(code: string): Country {
  return countries.find((c) => c.code === code) ?? countries[0];
}

export function getRegionName(countryCode: string, regionCode: string | null): string | null {
  if (!regionCode) return null;
  return getCountry(countryCode).regions.find((x) => x.code === regionCode)?.name ?? null;
}

export function formatJurisdiction(countryCode: string, regionCode: string | null): string {
  const country = getCountry(countryCode);
  const region = getRegionName(countryCode, regionCode);
  return region ? `${region}, ${country.name}` : country.name;
}
