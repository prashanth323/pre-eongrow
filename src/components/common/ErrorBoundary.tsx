import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('eongrow — Uncaught UI Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    try {
      localStorage.removeItem('supabase.auth.token');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F4F6F4] text-[#171C19] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-[#E8ECE9] p-6 sm:p-8 space-y-6">
            {/* Header Icon & Tagline */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight">
                  Something interrupted the page
                </h1>
                <p className="text-xs text-[#818A84] mt-1">
                  The application caught an issue during rendering and preserved your session.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <p className="font-semibold text-amber-950">Notice:</p>
              <p className="font-mono text-[11px] break-words">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#171C19] hover:bg-black text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] text-[#171C19] font-semibold text-sm transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset to Clean Session
              </button>
            </div>

            {/* Technical Diagnostics Accordion */}
            <div className="border-t border-[#E8ECE9] pt-4">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="w-full flex items-center justify-between text-xs font-medium text-[#818A84] hover:text-[#171C19] py-1 cursor-pointer"
              >
                <span>Diagnostic details for developers</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4 text-[#818A84]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#818A84]" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-48 space-y-2">
                  <p className="text-red-400 font-bold">
                    {this.state.error?.name}: {this.state.error?.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-neutral-400 whitespace-pre-wrap text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
