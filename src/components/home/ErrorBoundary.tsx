import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const msg = error?.message || String(error);
    if (msg.includes("INTERNAL ASSERTION FAILED") || msg.includes("ca9") || msg.includes("b815")) {
      console.warn("Home ErrorBoundary ignored transient Firestore assertion:", msg);
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidMount() {
    setTimeout(() => {
      sessionStorage.removeItem("page_reloaded_for_chunk_error");
    }, 3000);
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error?.message || String(error);
    if (msg.includes("INTERNAL ASSERTION FAILED") || msg.includes("ca9") || msg.includes("b815")) {
      console.warn("Home ErrorBoundary caught and suppressed transient Firestore assertion:", msg);
      return;
    }
    console.error("Uncaught error:", error, errorInfo);
    if (
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("dynamically imported module")
    ) {
      const lastReload = sessionStorage.getItem("last_chunk_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last_chunk_reload", now.toString());
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center mx-auto shadow-lg shadow-rose-100">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">দুঃখিত, সমস্যা হয়েছে</h1>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                অ্যাপটি লোড করার সময় একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন অথবা কিছুক্ষণ পর ফিরে আসুন।
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs sm:text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <RotateCcw size={18} /> পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
