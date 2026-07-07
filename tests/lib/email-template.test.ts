import { renderCampaignEmail } from '@/lib/email-template';

describe('renderCampaignEmail', () => {
  const subject = 'Test Campaign Subject';
  const body = '**Bold text** and *italic text* here.\n\n[Click here](https://example.com)\n\n## A Heading\n\n- Item one\n- Item two';

  it('returns a string containing the subject in an h1', () => {
    const html = renderCampaignEmail(subject, body);
    expect(html).toContain(`<h1`);
    expect(html).toContain('Test Campaign Subject');
  });

  it('converts **bold** to <strong>', () => {
    const html = renderCampaignEmail(subject, '**Bold text**');
    expect(html).toContain('<strong>Bold text</strong>');
  });

  it('converts *italic* to <em>', () => {
    const html = renderCampaignEmail(subject, '*italic text*');
    expect(html).toContain('<em>italic text</em>');
  });

  it('converts [links](url) to anchor tags with BMJ red', () => {
    const html = renderCampaignEmail(subject, '[Click](https://example.com)');
    expect(html).toContain('<a href="https://example.com" style="color:#C0281F">Click</a>');
  });

  it('contains "THE BLACK MALE JOURNAL" header', () => {
    const html = renderCampaignEmail(subject, 'body');
    expect(html).toContain('THE BLACK MALE JOURNAL');
  });

  it('contains unsubscribe footer text', () => {
    const html = renderCampaignEmail(subject, 'body');
    expect(html).toContain('You received this because you subscribed to The Black Male Journal.');
    expect(html).toContain('{{unsubscribe_url}}');
  });

  it('contains the inline BMJ background color', () => {
    const html = renderCampaignEmail(subject, 'body');
    expect(html).toContain('background-color:#0D0C0B');
  });

  it('converts ## heading to h2', () => {
    const html = renderCampaignEmail(subject, '## My Heading');
    expect(html).toContain('<h2>My Heading</h2>');
  });

  it('converts ### heading to h3', () => {
    const html = renderCampaignEmail(subject, '### Sub Heading');
    expect(html).toContain('<h3>Sub Heading</h3>');
  });

  it('wraps list items in <ul><li>', () => {
    const html = renderCampaignEmail(subject, '- Item one\n- Item two');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item one</li>');
    expect(html).toContain('<li>Item two</li>');
    expect(html).toContain('</ul>');
  });

  it('escapes HTML in the subject to prevent injection', () => {
    const html = renderCampaignEmail('<script>alert("xss")</script>', 'body');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
