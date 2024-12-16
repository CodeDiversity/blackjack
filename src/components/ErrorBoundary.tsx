import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2 className="text-xl text-red-600 mb-2">Something went wrong</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 