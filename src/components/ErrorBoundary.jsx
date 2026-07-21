import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, remountKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-950 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Subtle error background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 pointer-events-none"></div>
          
          <div className="text-center z-10">
            <div className="w-16 h-16 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Widget Crashed</h2>
            <p className="text-sm text-red-400 mb-6 max-w-md mx-auto">
              {this.state.error?.message || "An unexpected error occurred in this module."}
            </p>
            
            <button 
              onClick={() => {
                this.setState(prev => ({ 
                  hasError: false, 
                  error: null,
                  remountKey: prev.remountKey + 1
                }));
                if (this.props.onReset) {
                  this.props.onReset();
                }
              }} 
              className="px-5 py-2 bg-zinc-800 text-white text-sm font-bold rounded-lg border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-colors shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return <React.Fragment key={this.state.remountKey}>{this.props.children}</React.Fragment>;
  }
}
