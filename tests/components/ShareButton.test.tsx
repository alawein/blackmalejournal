import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from '@/components/ui/ShareButton';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('ShareButton', () => {
  it('renders "Copy Link" text', () => {
    render(<ShareButton />);
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('changes to "Copied!" after click', async () => {
    const user = userEvent.setup();
    render(<ShareButton />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy link to this page');
  });
});
