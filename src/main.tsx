import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { FavoriteProvider } from './components/FavoriteContext.tsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.tsx';
import { UniversalReportProvider } from './context/UniversalReportContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { CallProvider } from './contexts/CallContext.tsx';
import { HelmetProvider } from 'react-helmet-async';

// Suspend Service Worker and clean Caches in development & preview to solve double-reload bug
const isDev = 
  (import.meta as any).env?.DEV ||
  window.location.hostname.includes('localhost') || 
  window.location.hostname.includes('127.0.0.1') || 
  window.location.hostname.includes('ais-dev') || 
  window.location.hostname.includes('ais-pre') ||
  window.location.hostname.includes('webcontainer') ||
  window.location.hostname.includes('.run.app');

if (isDev) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('⚡ Suspended active PWA Service Worker to ensure instant live previews in AI Studio.');
      }
    });
  }
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key);
        console.log('🧹 Purged stale preview asset cache:', key);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <FavoriteProvider>
              <NotificationProvider>
                <CallProvider>
                  <UniversalReportProvider>
                    <App />
                  </UniversalReportProvider>
                </CallProvider>
              </NotificationProvider>
            </FavoriteProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);

