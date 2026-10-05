import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SAINIWALAA Deals Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-2xl mb-4 shadow-lg shadow-amber-500/20">
            S
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white">
            SAINIWALAA <span className="text-amber-500">DEALS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Best Deals, Smart Shopping</p>

          <div className="my-6 p-4 max-w-sm bg-slate-800 rounded-2xl border border-slate-700 text-center">
            <p className="text-amber-400 font-bold text-sm">
              Deals load nahi ho pa rahe. Retry karein.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Please refresh the page to reload the marketplace.
            </p>
          </div>

          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
