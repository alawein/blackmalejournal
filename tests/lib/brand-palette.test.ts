/**
 * Verifies the expanded brand palette CSS variables are defined in brand.css.
 * This test reads the raw CSS file to ensure all expected variables exist.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const brandCSS = readFileSync(
  resolve(__dirname, "../../src/styles/brand.css"),
  "utf-8"
);

describe("Brand palette CSS variables", () => {
  const expectedVars = [
    // Core palette (existing)
    "--bmj-black",
    "--bmj-cream",
    "--bmj-red",
    "--bmj-amber",
    "--bmj-brown",
    "--bmj-tan",
    "--bmj-white",
    // Expanded accent palette (new)
    "--bmj-paper",
    "--bmj-deep-black",
    "--bmj-crimson",
    "--bmj-olive",
    "--bmj-gold",
    "--bmj-purple",
    "--bmj-medium-brown",
  ];

  test.each(expectedVars)("defines %s", (varName) => {
    expect(brandCSS).toContain(varName);
  });
});
