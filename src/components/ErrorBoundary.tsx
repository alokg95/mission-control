// P1-006: Error boundaries around each panel
import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.fallbackLabel ?? "Panel"}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">
            {this.props.fallbackLabel ?? "Panel"} Error
          </h3>
          <p className="text-xs text-gray-400 max-w-xs">
            {this.state.error?.message ?? "Something went wrong"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-3 py-1 text-xs bg-brand-teal text-white rounded-lg hover:bg-brand-teal-dark"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
