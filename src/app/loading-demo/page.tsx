'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/components/LoadingProvider';

export default function LoadingScreenDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const { setLoading } = useLoading();

  const simulateLoading = () => {
    setLoading(true, 'Processing your request...');
    setIsLoading(true);
    setLoadingText('Processing your request...');
    
    // Simulate different loading scenarios
    setTimeout(() => {
      setLoadingText('Almost done...');
      setLoading(true, 'Almost done...');
    }, 2000);
    
    setTimeout(() => {
      setIsLoading(false);
      setLoading(false);
      setLoadingText('Loading...');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <LoadingScreen 
        isLoading={isLoading} 
        text={loadingText}
        size="lg"
        variant="default"
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Loading Screen Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the neobrutalism loading animation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demo Controls */}
          <div className="bg-secondary-background border-4 border-border p-6 rounded-base shadow-shadow space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Default Loading</h2>
            <p className="text-foreground/80">
              Full loading screen with animations, progress bar, and orbiting elements.
            </p>
            <Button 
              onClick={simulateLoading}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test Default Loading'}
            </Button>
          </div>

          {/* Minimal Version */}
          <div className="bg-secondary-background border-4 border-border p-6 rounded-base shadow-shadow space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Minimal Loading</h2>
            <p className="text-foreground/80">
              Clean loading screen with just the core animation.
            </p>
            <Button 
              onClick={() => {
                setLoading(true, 'Loading...');
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setLoading(false);
                }, 3000);
              }}
              className="w-full"
              disabled={isLoading}
              variant="neutral"
            >
              Test Minimal Loading
            </Button>
          </div>
        </div>

        {/* Size Variations */}
        <div className="bg-secondary-background border-4 border-border p-6 rounded-base shadow-shadow">
          <h2 className="text-2xl font-bold text-foreground mb-6">Size Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-8 h-8 animate-spin border-4 border-border bg-main shadow-shadow relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="/logo.png" 
                      alt="BarLink Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-border transform rotate-45 translate-x-1/3 -translate-y-1/3" />
                </div>
              </div>
              <p className="font-bold text-foreground">Small (sm)</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 animate-spin border-4 border-border bg-main shadow-shadow relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-main-foreground rounded-full w-3 h-3 animate-pulse" />
                  </div>
                  <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-border transform rotate-45 translate-x-1/3 -translate-y-1/3" />
                </div>
              </div>
              <p className="font-bold text-foreground">Medium (md)</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 animate-spin border-4 border-border bg-main shadow-shadow relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-main-foreground rounded-full w-4 h-4 animate-pulse" />
                  </div>
                  <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-border transform rotate-45 translate-x-1/3 -translate-y-1/3" />
                </div>
              </div>
              <p className="font-bold text-foreground">Large (lg)</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-secondary-background border-4 border-border p-6 rounded-base shadow-shadow">
          <h2 className="text-2xl font-bold text-foreground mb-4">Usage</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-2">Basic Usage:</h3>
              <pre className="bg-background border-2 border-border p-4 rounded-base overflow-x-auto">
                <code className="text-sm text-foreground">
{`import LoadingScreen from '@/components/LoadingScreen';

// In your component:
<LoadingScreen 
  isLoading={true} 
  text="Loading jobs..."
  size="lg"
  variant="default"
/>`}
                </code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-bold text-foreground mb-2">Props:</h3>
              <ul className="space-y-2 text-foreground/80">
                <li><strong>isLoading:</strong> boolean - Show/hide the loading screen</li>
                <li><strong>text:</strong> string - Custom loading text</li>
                <li><strong>size:</strong> &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; - Animation size</li>
                <li><strong>variant:</strong> 'default' | 'minimal' - Animation complexity</li>
                <li><strong>className:</strong> string - Additional CSS classes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}