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
        <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
          <div className="bg-green-700 p-8 rounded-xl shadow-2xl w-[500px] text-center">
            <h2 className="text-xl text-red-600 mb-4">Something went wrong</h2>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                transition-colors font-semibold"
              onClick={() => window.location.reload()}
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 