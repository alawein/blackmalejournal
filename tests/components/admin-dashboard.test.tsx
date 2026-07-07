import { render, screen } from '@testing-library/react';
import { DashboardSection } from '@/components/admin/dashboard/DashboardSection';

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Section render failed');
  return <div>Section content</div>;
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DashboardSection', () => {
  it('renders children when no error', () => {
    render(
      <DashboardSection title="Test Section">
        <ThrowingComponent shouldThrow={false} />
      </DashboardSection>
    );
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders error fallback when child throws', () => {
    render(
      <DashboardSection title="Key Metrics">
        <ThrowingComponent shouldThrow={true} />
      </DashboardSection>
    );
    expect(screen.getByText(/Key Metrics/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    expect(screen.getByText(/Section render failed/)).toBeInTheDocument();
  });
});
