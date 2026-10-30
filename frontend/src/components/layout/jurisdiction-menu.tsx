"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { countries, formatJurisdiction, getCountry } from "@/config/jurisdictions";
import { usePreferencesStore } from "@/stores/preferences-store";

export function JurisdictionMenu() {
  const country = usePreferencesStore((s) => s.country);
  const region = usePreferencesStore((s) => s.region);
  const set = usePreferencesStore((s) => s.set);
  const setCountry = usePreferencesStore((s) => s.setCountry);
  const current = getCountry(country);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Jurisdiction: ${formatJurisdiction(country, region)}`} className="max-w-56">
          <MapPin aria-hidden />
          <span className="hidden truncate xl:inline">{formatJurisdiction(country, region)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-4 p-5">
        <div>
          <p className="font-medium">Jurisdiction</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rights and procedures differ by place. This sets the default for new questions.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jx-country">Country</Label>
          <Select id="jx-country" value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jx-region">{current.regionLabel}</Label>
          <Select id="jx-region" value={region ?? ""} onChange={(e) => set({ region: e.target.value || null })}>
            <option value="">Not specified</option>
            {current.regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
