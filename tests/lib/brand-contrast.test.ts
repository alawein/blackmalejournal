import { contrastRatio, meetsWCAG } from '../helpers/contrast';

const BMJ = {
  black: '#0D0C0B', cream: '#E8DCC8', red: '#C0281F',
  amber: '#C8852A', brown: '#3B2417', tan: '#B8986A', white: '#F2EDE4',
} as const;

describe('BMJ brand color contrast — WCAG AA compliance', () => {
  describe('normal text (4.5:1 minimum)', () => {
    test('cream on black', () => { expect(meetsWCAG(BMJ.cream, BMJ.black, 'AA')).toBe(true); });
    test('white on black', () => { expect(meetsWCAG(BMJ.white, BMJ.black, 'AA')).toBe(true); });
    test('tan on black', () => { expect(meetsWCAG(BMJ.tan, BMJ.black, 'AA')).toBe(true); });
    test('white on brown', () => { expect(meetsWCAG(BMJ.white, BMJ.brown, 'AA')).toBe(true); });
    test('cream on brown', () => { expect(meetsWCAG(BMJ.cream, BMJ.brown, 'AA')).toBe(true); });
  });
  describe('large text (3:1 minimum)', () => {
    test('tan on brown (headings)', () => { expect(meetsWCAG(BMJ.tan, BMJ.brown, 'AA-large')).toBe(true); });
    test('red on black', () => { expect(meetsWCAG(BMJ.red, BMJ.black, 'AA-large')).toBe(true); });
    test('amber on black', () => { expect(meetsWCAG(BMJ.amber, BMJ.black, 'AA-large')).toBe(true); });
  });
  describe('contrast ratios — informational', () => {
    // tan on brown is ~5.33:1, which passes AA for normal text
    // Use cream/80 on brown for body copy as a design preference (more legible)
    test('tan on brown contrast ratio is above 4.5', () => {
      expect(contrastRatio(BMJ.tan, BMJ.brown)).toBeGreaterThan(4.5);
    });
    // red on black passes AA-large but not AA — use only for accents/large text
    test('red on black fails AA for normal text', () => {
      expect(meetsWCAG(BMJ.red, BMJ.black, 'AA')).toBe(false);
    });
  });
});
