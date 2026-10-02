import React from 'react';

interface GoogleMapEmbedProps {
  locationQuery: string;
  className?: string;
  title?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ locationQuery, className = "w-full h-64 rounded-xl", title = "ম্যাপ" }) => {
  // Using Google Maps Embed API
  const encodedQuery = encodeURIComponent(locationQuery);
  const src = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={src}
        className="w-full h-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};
