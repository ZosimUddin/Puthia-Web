import React from 'react';

interface PostPhotoGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
  altText?: string;
}

export function PostPhotoGallery({ images, onImageClick, altText = "পোস্ট ছবি" }: PostPhotoGalleryProps) {
  if (!images || images.length === 0) return null;

  // ১টি ছবি (Full-width সুন্দর Image)
  if (images.length === 1) {
    return (
      <div 
        className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer group max-h-[500px] mt-3"
        onClick={() => onImageClick(0)}
      >
        <img 
          src={images[0]} 
          alt={altText} 
          className="w-full h-auto object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-[1.01]" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
      </div>
    );
  }

  // ২টি ছবি (2-column side by side)
  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-slate-100 mt-3 bg-slate-100">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative h-full overflow-hidden cursor-pointer group bg-slate-100"
            onClick={() => onImageClick(idx)}
          >
            <img 
              src={img} 
              alt={`${altText} ${idx + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
          </div>
        ))}
      </div>
    );
  }

  // ৩টি ছবি (১টি বড় + ২টি ছোট)
  if (images.length === 3) {
    return (
      <div className="grid grid-cols-3 gap-2 h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-100 mt-3 bg-slate-100">
        {/* ১টি বড় ছবি (Left side, takes 2 columns) */}
        <div 
          className="col-span-2 relative h-full overflow-hidden cursor-pointer group bg-slate-100"
          onClick={() => onImageClick(0)}
        >
          <img 
            src={images[0]} 
            alt={`${altText} 1`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
        </div>

        {/* ২টি ছোট ছবি (Right side, stacked vertically) */}
        <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
          <div 
            className="relative h-full overflow-hidden cursor-pointer group bg-slate-100"
            onClick={() => onImageClick(1)}
          >
            <img 
              src={images[1]} 
              alt={`${altText} 2`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
          </div>
          <div 
            className="relative h-full overflow-hidden cursor-pointer group bg-slate-100"
            onClick={() => onImageClick(2)}
          >
            <img 
              src={images[2]} 
              alt={`${altText} 3`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  // ৪ বা ততোধিক ছবি (Grid + +৫ ইত্যাদি)
  const remainingCount = images.length - 3; // count of remaining hidden images if more than 4 total
  const hasMore = images.length > 4;

  return (
    <div className="grid grid-cols-2 gap-2 h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-100 mt-3 bg-slate-100">
      {images.slice(0, 4).map((img, idx) => {
        const isFourth = idx === 3;
        const showOverlay = isFourth && hasMore;

        return (
          <div 
            key={idx} 
            className="relative h-full overflow-hidden cursor-pointer group bg-slate-100"
            onClick={() => onImageClick(idx)}
          >
            <img 
              src={img} 
              alt={`${altText} ${idx + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
            
            {/* +৫ ইত্যাদি Overlay on 4th image */}
            {showOverlay && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-2xl sm:text-3xl transition-all duration-300 group-hover:bg-black/70">
                <span className="tracking-wider">+{remainingCount}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
