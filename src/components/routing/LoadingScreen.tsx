import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Memuat Zen Internal Super-App...',
}) => {
  return (
    <div className="min-h-screen bg-zen-linen flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-2xl bg-zen-matcha/20 flex items-center justify-center animate-bounce mb-4 shadow-sm">
        <img
          src="/Logo150x150.png"
          alt="Zen Logo"
          className="w-12 h-12 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
      <p className="text-sm font-semibold text-zen-charcoal animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingScreen;
