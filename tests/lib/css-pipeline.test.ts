/** @jest-environment node */
import postcss, { type Container, type Root } from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import nested from 'postcss-nested';
import config from '../../tailwind.config';

// Tailwind 3's selector-parser security override must preserve generated CSS,
// including the insertion/walk behavior used by variants and nested selectors.
async function compile(css: string, candidates: string[] = []): Promise<Root> {
  const result = await postcss([
    tailwindcss({
      ...config,
      content: [{ raw: candidates.join(' '), extension: 'html' }],
    }),
    autoprefixer(),
  ]).process(css, { from: undefined });
  return result.root;
}

function declarations(root: Container, selector: string, property: string): string[] {
  const values: string[] = [];
  root.walkRules((rule) => {
    if (rule.selector === selector) {
      rule.walkDecls(property, (declaration) => {
        values.push(declaration.value);
      });
    }
  });
  return values;
}

describe('BMJ compiled CSS compatibility', () => {
  test('preserves brand opacity, applied utilities, responsive and reduced-motion rules', async () => {
    const root = await compile(
      '@tailwind utilities; .sample { @apply text-bmj-cream/80 bg-bmj-red; }',
      ['sm:bg-bmj-red', 'motion-reduce:transform-none'],
    );
    expect(declarations(root, '.sample', 'color')).toEqual(['rgb(232 220 200 / 0.8)']);
    expect(declarations(root, '.sample', 'background-color')).toEqual([
      'rgb(192 40 31 / var(--tw-bg-opacity, 1))',
    ]);

    const mediaDeclarations: Record<string, string[]> = {};
    root.walkAtRules('media', (media) => {
      mediaDeclarations[media.params] = declarations(media, '.sm\\:bg-bmj-red', 'background-color');
      if (media.params === '(prefers-reduced-motion: reduce)') {
        expect(declarations(media, '.motion-reduce\\:transform-none', 'transform')).toEqual(['none']);
      }
    });
    expect(mediaDeclarations['(min-width: 640px)']).toEqual([
      'rgb(192 40 31 / var(--tw-bg-opacity, 1))',
    ]);
    expect(Object.keys(mediaDeclarations)).toContain('(prefers-reduced-motion: reduce)');
  });

  test('preserves group, peer and arbitrary pseudo variants during selector traversal', async () => {
    const root = await compile(
      '@tailwind utilities; .button { @apply [&:not(:disabled)]:bg-bmj-red; }',
      ['group-hover:text-bmj-cream', 'peer-checked:opacity-100'],
    );
    expect(declarations(root, '.group:hover .group-hover\\:text-bmj-cream', 'color')).toEqual([
      'rgb(232 220 200 / var(--tw-text-opacity, 1))',
    ]);
    expect(declarations(root, '.peer:checked ~ .peer-checked\\:opacity-100', 'opacity')).toEqual(['1']);
    expect(declarations(root, '.button:not(:disabled)', 'background-color')).toEqual([
      'rgb(192 40 31 / var(--tw-bg-opacity, 1))',
    ]);
  });

  test('preserves nested parent, attribute and compound pseudo selectors', async () => {
    const result = await postcss([nested()]).process(`
      .card, .panel {
        &:hover, &:focus-visible { color: red; }
        &[aria-expanded="true"] {
          &:is(.active, :not(.disabled)) { color: blue; }
        }
      }
    `, { from: undefined });
    const selectors: string[][] = [];
    result.root.walkRules((rule) => {
      selectors.push(rule.selectors);
    });
    expect(selectors).toEqual([
      ['.card:hover', '.card:focus-visible', '.panel:hover', '.panel:focus-visible'],
      [
        '.card[aria-expanded="true"]:is(.active, :not(.disabled))',
        '.panel[aria-expanded="true"]:is(.active, :not(.disabled))',
      ],
    ]);
    expect(result.css).not.toContain('&');
  });
});
