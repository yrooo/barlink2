"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface UseWhatsAppVerificationReturn {
  shouldShowDialog: boolean;
  hideDialog: () => void;
  setDontShowAgain: () => void;
}

export const useWhatsAppVerification = (): UseWhatsAppVerificationReturn => {
  const { user, userProfile, loading } = useAuth();
  const [shouldShowDialog, setShouldShowDialog] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (user && userProfile) {
      // Check if user has WhatsApp number linked
      const hasWhatsApp = userProfile.whatsappNumber;
      
      // Check if user has opted to not show the dialog again
      const dontShowAgain = localStorage.getItem('whatsapp-verification-dismissed');
      
      // Show dialog if user doesn't have WhatsApp and hasn't dismissed it
      if (!hasWhatsApp && !dontShowAgain) {
        setShouldShowDialog(true);
      }
    }
  }, [user, userProfile, loading]);

  const hideDialog = () => {
    setShouldShowDialog(false);
  };

  const setDontShowAgain = () => {
    localStorage.setItem('whatsapp-verification-dismissed', 'true');
    setShouldShowDialog(false);
  };

  return {
    shouldShowDialog,
    hideDialog,
    setDontShowAgain,
  };
};