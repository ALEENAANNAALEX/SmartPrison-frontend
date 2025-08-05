import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong!</h1>
              <p className="text-gray-600">The application encountered an error.</p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-700 font-medium">
                    Stack Trace (click to expand)
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
