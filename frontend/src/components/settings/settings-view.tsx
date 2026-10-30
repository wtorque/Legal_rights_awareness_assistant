"use client";

import { Download, Monitor, Moon, RotateCcw, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { countries, getCountry } from "@/config/jurisdictions";
import { languages } from "@/config/languages";
import { clearLocalData, exportLocalData } from "@/lib/local-data";
import {
  type ConversationRetention,
  type DocumentRetention,
  type ReducedMotionPref,
  usePreferencesStore,
} from "@/stores/preferences-store";
import { type ThemePreference, useThemeStore } from "@/stores/theme-store";
import { SettingRow, SettingsSection } from "./settings-section";

export function SettingsView() {
  const prefs = usePreferencesStore();
  const themePref = useThemeStore((s) => s.preference);
  const setTheme = useThemeStore((s) => s.setPreference);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const country = getCountry(prefs.country);

  const download = () => {
    const blob = new Blob([exportLocalData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aequa-local-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to aequa-local-data.json");
  };

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader title="Settings" description="Everything here is saved in this browser only. Nothing is sent to a server." />

      <SettingsSection id="appearance" title="Appearance" description="Choose how Aequa looks. System follows your device.">
        <SegmentedControl<ThemePreference>
          label="Theme"
          value={themePref}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light", icon: <Sun className="size-4" aria-hidden /> },
            { value: "dark", label: "Dark", icon: <Moon className="size-4" aria-hidden /> },
            { value: "system", label: "System", icon: <Monitor className="size-4" aria-hidden /> },
          ]}
        />
      </SettingsSection>

      <SettingsSection id="language" title="Language" description="Interface text and the language answers are written in.">
        <SettingRow label="Preferred response language" htmlFor="set-resp" hint="Sample answers exist in English, Hindi and Telugu only; other languages fall back to English.">
          <Select id="set-resp" className="w-52" value={prefs.responseLanguage} onChange={(e) => prefs.set({ responseLanguage: e.target.value })}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.name})
              </option>
            ))}
          </Select>
        </SettingRow>
        <SettingRow label="Interface language" htmlFor="set-ui" hint="Only English interface text exists today. Your choice is saved for when translations are added.">
          <Select id="set-ui" className="w-52" value={prefs.interfaceLanguage} onChange={(e) => prefs.set({ interfaceLanguage: e.target.value })}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.name})
              </option>
            ))}
          </Select>
        </SettingRow>
      </SettingsSection>

      <SettingsSection id="jurisdiction" title="Jurisdiction" description="Rights differ by place. This is used as the default for new questions and filters.">
        <SettingRow label="Default country" htmlFor="set-country">
          <Select id="set-country" className="w-52" value={prefs.country} onChange={(e) => prefs.setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </SettingRow>
        <SettingRow label={`Default ${country.regionLabel.toLowerCase()}`} htmlFor="set-region">
          <Select id="set-region" className="w-52" value={prefs.region ?? ""} onChange={(e) => prefs.set({ region: e.target.value || null })}>
            <option value="">Not specified</option>
            {country.regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </Select>
        </SettingRow>
      </SettingsSection>

      <SettingsSection id="privacy" title="Privacy" description="How your information is handled in this prototype.">
        <div role="note" className="rounded-2xl border border-border bg-secondary/50 p-4 text-sm leading-relaxed">
          Conversations, plans, bookmarks and settings live only in this browser&apos;s storage. Files you add are not uploaded and are kept only for the current tab. There is no account and no server-side storage yet, so the retention choices below are saved preferences that will be enforced once a backend exists.
        </div>
        <SettingRow label="Keep documents" htmlFor="set-doc-ret" hint="Preference only; not enforced yet.">
          <Select id="set-doc-ret" className="w-52" value={prefs.documentRetention} onChange={(e) => prefs.set({ documentRetention: e.target.value as DocumentRetention })}>
            <option value="session">This session only</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
            <option value="manual">Until I delete them</option>
          </Select>
        </SettingRow>
        <SettingRow label="Conversation history" htmlFor="set-conv-ret" hint="Preference only; not enforced yet.">
          <Select id="set-conv-ret" className="w-52" value={prefs.conversationRetention} onChange={(e) => prefs.set({ conversationRetention: e.target.value as ConversationRetention })}>
            <option value="keep">Keep until I delete</option>
            <option value="30d">Delete after 30 days</option>
            <option value="off">Don&apos;t keep history</option>
          </Select>
        </SettingRow>
        <SettingRow label="Export your data" hint="Download everything stored in this browser as a JSON file.">
          <Button variant="outline" onClick={download}>
            <Download /> Export
          </Button>
        </SettingRow>
        <SettingRow label="Delete local data" hint="Removes conversations, plans, bookmarks, uploads records and settings from this browser.">
          <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setConfirmWipe(true)}>
            <Trash2 /> Delete all
          </Button>
        </SettingRow>
      </SettingsSection>

      <SettingsSection id="accessibility" title="Accessibility" description="Make Aequa easier to read and use.">
        <SettingRow label="Reduced motion" hint="Minimises animation. “System” follows your device setting.">
          <SegmentedControl<ReducedMotionPref>
            label="Reduced motion"
            value={prefs.reducedMotion}
            onChange={(v) => prefs.set({ reducedMotion: v })}
            options={[
              { value: "system", label: "System" },
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
          />
        </SettingRow>
        <SettingRow label="Text size" hint="Scales all text and spacing.">
          <SegmentedControl<number>
            label="Text size"
            value={prefs.fontScale}
            onChange={(v) => prefs.set({ fontScale: v })}
            options={[
              { value: 90, label: "Small" },
              { value: 100, label: "Default" },
              { value: 112, label: "Large" },
              { value: 125, label: "Extra large" },
            ]}
          />
        </SettingRow>
        <SettingRow label="Compact layout" hint="Tighter spacing in lists." htmlFor="set-compact">
          <Switch id="set-compact" checked={prefs.compactDensity} onCheckedChange={(v) => prefs.set({ compactDensity: v })} />
        </SettingRow>
        <SettingRow label="Reset preferences" hint="Restore every setting on this page to its default.">
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw /> Reset
          </Button>
        </SettingRow>
      </SettingsSection>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all preferences?"
        description="Language, jurisdiction, privacy and accessibility settings return to their defaults. Your conversations and plans are not affected."
        confirmLabel="Reset"
        onConfirm={() => {
          prefs.reset();
          setTheme("system");
          toast.success("Preferences reset");
        }}
      />
      <ConfirmDialog
        open={confirmWipe}
        onOpenChange={setConfirmWipe}
        title="Delete all local data?"
        description="This permanently removes everything Aequa stored in this browser, including conversations, plans and bookmarks, then reloads the app. It can't be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={() => {
          clearLocalData();
          window.location.reload();
        }}
      />
    </PageContainer>
  );
}
