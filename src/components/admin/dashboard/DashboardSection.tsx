'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class DashboardSection extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[DashboardSection:${this.props.title}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="surface-panel border-bmj-red/20 p-6">
          <p className="font-label text-xs uppercase tracking-widest text-bmj-red">
            {this.props.title} — Failed to load
          </p>
          <p className="mt-2 font-body text-sm text-bmj-cream/60">
            {this.state.errorMessage ?? 'An unexpected error occurred.'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
