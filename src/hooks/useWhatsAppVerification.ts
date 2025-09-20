"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UseWhatsAppVerificationReturn {
  shouldShowDialog: boolean;
  hideDialog: () => void;
  setDontShowAgain: () => void;
}

export const useWhatsAppVerification = (): UseWhatsAppVerificationReturn => {
  const { data: session, status } = useSession();
  const [shouldShowDialog, setShouldShowDialog] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      // Check if user has phone number linked (assuming WhatsApp uses phone number)
      const hasWhatsApp = session.user.profile?.phone;
      
      // Check if user has opted to not show the dialog again
      const dontShowAgain = localStorage.getItem('whatsapp-verification-dismissed');
      
      // Show dialog if user doesn't have WhatsApp and hasn't dismissed it
      if (!hasWhatsApp && !dontShowAgain) {
        setShouldShowDialog(true);
      }
    }
  }, [session, status]);

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