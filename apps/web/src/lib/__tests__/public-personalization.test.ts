import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const publicSourceFiles = [
  "../../routes/index.tsx",
  "../../routes/about.tsx",
  "../../components/site-shell.tsx",
];

describe("public site personalization", () => {
  it("does not expose starter author branding in public page sources", () => {
    for (const relativePath of publicSourceFiles) {
      const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

      expect(source).not.toMatch(/01MVP|01mvp|MakerJackie|makerjackie|Jackie|hi@01mvp\.com/);
    }
  });

  it("does not show a homepage layout selector that has no alternate renderer", () => {
    const source = readFileSync(
      new URL("../../routes/_auth/admin/settings.tsx", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain('name="layoutPreset"');
    expect(source).toContain("layoutPreset: siteSettings.layoutPreset");
  });
});
