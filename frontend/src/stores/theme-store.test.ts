import { beforeEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, useThemeStore } from "./theme-store";

describe("theme store", () => {
  beforeEach(() => {
    useThemeStore.setState({ preference: "system", resolved: "light", ready: false });
  });

  it("applies and persists an explicit preference", () => {
    useThemeStore.getState().setPreference("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("toggle flips based on the DOM, even before init", () => {
    useThemeStore.getState().toggle();
    expect(document.documentElement).toHaveClass("dark");
    useThemeStore.getState().toggle();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("init restores the stored preference", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const dispose = useThemeStore.getState().init();
    expect(useThemeStore.getState().resolved).toBe("dark");
    expect(useThemeStore.getState().ready).toBe(true);
    dispose();
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    const dispose = useThemeStore.getState().init();
    expect(useThemeStore.getState().preference).toBe("system");
    dispose();
  });
});
