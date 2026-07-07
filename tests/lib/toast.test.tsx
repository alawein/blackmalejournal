import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/lib/toast';

function TestComponent() {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast('Saved successfully', 'success')}>
        Show success
      </button>
      <button onClick={() => toast('Something went wrong', 'error')}>
        Show error
      </button>
    </>
  );
}

describe('toast', () => {
  it('shows a toast message when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Show success'));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('shows an error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Show error'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the live region for screen readers', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    expect(screen.getByRole('log')).toBeInTheDocument();
  });
});
