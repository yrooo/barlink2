import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  isLoading?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading = true,
  text = 'Loading...',
  size = 'md',
  variant = 'default',
  className,
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-background/95 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center gap-6">
        {/* Main loading animation */}
        <div className="relative">
          {/* Outer rotating square */}
          <div 
            className={cn(
              'animate-bounce',
              'relative overflow-hidden',
              sizeClasses[size]
            )}
            style={{
              animationDuration: '2s',
            }}
          >
            {/* Website Logo in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="BarLink Logo"
                className={cn(
                  'object-contain',
                  size === 'sm' ? 'w-14 h-14' : size === 'md' ? 'w-16 h-16' : 'w-18 h-18'
                )}
              />
            </div>
          </div>
          
          {/* Orbiting elements for default variant */}
          {variant === 'default' && (
            <>
              {/* <div 
                className="absolute rounded-full top-0 left-0 w-3 h-3 bg-chart-2 border-2 border-border animate-bounce"
                style={{
                  animationDuration: '1s',
                  animationDelay: '0s',
                }}
              />
              <div 
                className="absolute rounded-full bottom-0 right-0 w-3 h-3 bg-chart-3 border-2 border-border animate-bounce"
                style={{
                  animationDuration: '1s',
                  animationDelay: '0.5s',
                }}
              />
              <div 
                className="absolute rounded-full top-1/2 -left-2 w-2 h-2 bg-chart-1 border-2 border-border animate-pulse"
                style={{
                  animationDuration: '1.2s',
                  animationDelay: '0.2s',
                }}
              />
              <div 
                className="absolute rounded-full top-1/2 -right-2 w-2 h-2 bg-chart-4 border-2 border-border animate-pulse"
                style={{
                  animationDuration: '1.2s',
                  animationDelay: '0.8s',
                }}
              /> */}
            </>
          )}
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className={cn(
            'font-bold text-foreground animate-pulse',
            textSizes[size]
          )}>
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-border rounded-full animate-bounce"
                style={{
                  animationDuration: '1.4s',
                  animationDelay: `${dot * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar for default variant */}
        {variant === 'default' && (
          <div className="w-48 h-2 bg-secondary-background border-2 border-border overflow-hidden">
            <div 
              className="h-full bg-main animate-pulse"
              style={{
                width: '100%',
                animation: 'loading-progress 2s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>

      {/* Custom CSS for loading animation */}
      <style jsx>{`
        @keyframes loading-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;