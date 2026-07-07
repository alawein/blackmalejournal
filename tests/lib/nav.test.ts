import { HEADER_NAV_LINKS, FOOTER_NAV_LINKS } from '@/lib/nav';

describe('Navigation constants', () => {
  describe('HEADER_NAV_LINKS', () => {
    it('contains exactly 5 links', () => {
      expect(HEADER_NAV_LINKS).toHaveLength(5);
    });

    it('contains Home, About, Academy, Downloads, Records', () => {
      const labels = HEADER_NAV_LINKS.map((l) => l.label);
      expect(labels).toEqual(['Home', 'About', 'Academy', 'Downloads', 'Records']);
    });

    it('does NOT contain Handbooks, Video, Blog, Pricing, or Contact', () => {
      const labels = HEADER_NAV_LINKS.map((l) => l.label);
      expect(labels).not.toContain('Handbooks');
      expect(labels).not.toContain('Video');
      expect(labels).not.toContain('Blog');
      expect(labels).not.toContain('Pricing');
      expect(labels).not.toContain('Contact');
    });
  });

  describe('FOOTER_NAV_LINKS', () => {
    it('contains 6 links (header links + Contact)', () => {
      expect(FOOTER_NAV_LINKS).toHaveLength(6);
    });

    it('includes Contact', () => {
      const labels = FOOTER_NAV_LINKS.map((l) => l.label);
      expect(labels).toContain('Contact');
    });
  });
});
