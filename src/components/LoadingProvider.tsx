'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

interface LoadingContextType {
  setLoading: (loading: boolean, text?: string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const setLoading = (loading: boolean, text: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  return (
    <LoadingContext.Provider value={{ setLoading, isLoading }}>
      {children}
      <LoadingScreen 
        isLoading={isLoading} 
        text={loadingText}
        size="lg"
        variant="default"
      />
    </LoadingContext.Provider>
  );
};