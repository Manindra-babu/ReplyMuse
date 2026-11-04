import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to server or monitoring service safely in production
    // (without crashing the UI)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F3E8] flex items-center justify-center p-6 text-[#2B2B2B]">
          <div className="max-w-md w-full bg-white border border-[#E5DFD3] rounded-3xl p-8 shadow-soft text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#EE6A4B]/10 text-[#EE6A4B] flex items-center justify-center mx-auto shadow-2xs">
              <AlertCircle className="w-6 h-6 text-[#EE6A4B]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#2B2B2B]">
                Something went wrong
              </h2>
              <p className="text-sm text-[#7A7468] leading-relaxed">
                An unexpected interface error occurred. Your review data is safe. Please refresh the page or return to the studio home.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="coral"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Refresh page
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Go to home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
