import { relativeLuminance, contrastRatio, meetsWCAG } from '../helpers/contrast';

describe('contrast utilities', () => {
  test('calculates relative luminance of black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 2);
  });
  test('calculates relative luminance of white', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 2);
  });
  test('calculates contrast ratio of black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });
  test('bmj-tan on bmj-black passes AA for large text', () => {
    expect(meetsWCAG('#B8986A', '#0D0C0B', 'AA-large')).toBe(true);
  });
  test('bmj-tan on bmj-brown passes AA for normal text', () => {
    // Actual contrast ratio is ~5.33:1, which passes AA (4.5:1 minimum)
    expect(meetsWCAG('#B8986A', '#3B2417', 'AA')).toBe(true);
  });
  test('bmj-cream on bmj-black passes AAA', () => {
    expect(meetsWCAG('#E8DCC8', '#0D0C0B', 'AAA')).toBe(true);
  });
});
