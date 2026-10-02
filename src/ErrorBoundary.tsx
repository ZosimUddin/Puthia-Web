import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
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
    const msg = error?.message || String(error);
    if (msg.includes("INTERNAL ASSERTION FAILED") || msg.includes("ca9") || msg.includes("b815")) {
      console.warn("Root ErrorBoundary ignored transient Firestore assertion:", msg);
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error?.message || String(error);
    if (msg.includes("INTERNAL ASSERTION FAILED") || msg.includes("ca9") || msg.includes("b815")) {
      console.warn("Root ErrorBoundary caught and suppressed transient Firestore assertion:", msg);
      return;
    }
    console.error("Uncaught error:", error, errorInfo);
    if (
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("dynamically imported module")
    ) {
      const lastReload = sessionStorage.getItem("last_root_chunk_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
        sessionStorage.setItem("last_root_chunk_reload", now.toString());
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">দুঃখিত, কিছু ভুল হয়েছে</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              অ্যাপ্লিকেশনটি লোড করার সময় একটি সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>রিফ্রেশ করুন</span>
            </button>
            {this.state.error && (
              <div className="mt-8 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Error Details (For Developers)</p>
                <div className="bg-gray-100 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs text-rose-600 font-mono">
                    {this.state.error.toString()}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

