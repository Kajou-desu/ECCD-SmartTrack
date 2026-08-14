import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Wire this up to real error reporting (Sentry, LogRocket, etc.) before launch
    console.error("Uncaught application error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-gray-100 px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-slate-500">
            An unexpected error occurred. Try reloading the page, and contact
            support if this keeps happening.
          </p>
          <button
            onClick={this.handleReload}
            className="rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-800"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
