import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (process.env as any)?.GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const MapComponent: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location permission or signal unavailable, defaulting to Puthia Center:", error.message || error);
          setUserLocation({
            lat: 24.3700,
            lng: 88.8400
          });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setUserLocation({
        lat: 24.3700,
        lng: 88.8400
      });
    }
  }, []);

  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',fontFamily:'sans-serif', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '16px'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2>Google Maps API Key Required</h2>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp_mcp_codeassist_v1_aistudio" target="_blank" rel="noopener">Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8'}}>
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>VITE_GOOGLE_MAPS_API_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return <div>Loading Map...</div>;
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <Map
        defaultCenter={userLocation}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{width: '100%', height: '400px', borderRadius: '16px'}}
      >
        <AdvancedMarker position={userLocation}>
          <Pin background="#125836" glyphColor="#fff" />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
};
