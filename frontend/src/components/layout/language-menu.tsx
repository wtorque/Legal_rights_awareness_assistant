"use client";

import { Languages } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLanguage, languages } from "@/config/languages";
import { usePreferencesStore } from "@/stores/preferences-store";

export function LanguageMenu() {
  const code = usePreferencesStore((s) => s.responseLanguage);
  const set = usePreferencesStore((s) => s.set);
  const current = getLanguage(code);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Response language: ${current.name}`}>
          <Languages aria-hidden />
          <span className="hidden xl:inline">{current.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Response language</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={code}
          onValueChange={(value) => {
            set({ responseLanguage: value });
            toast.success(`Responses will be in ${getLanguage(value).name}`);
          }}
        >
          {languages.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code}>
              {l.native}
              <span className="text-xs text-muted-foreground">{l.name !== l.native && l.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
