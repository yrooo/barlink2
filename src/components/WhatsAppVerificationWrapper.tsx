"use client"

import React from 'react';
import WhatsAppVerificationDialog from './WhatsAppVerificationDialog';
import { useWhatsAppVerification } from '@/hooks/useWhatsAppVerification';

const WhatsAppVerificationWrapper: React.FC = () => {
  const { shouldShowDialog, hideDialog, setDontShowAgain } = useWhatsAppVerification();

  return (
    <WhatsAppVerificationDialog
      isOpen={shouldShowDialog}
      onClose={hideDialog}
      onDontShowAgain={setDontShowAgain}
    />
  );
};

export default WhatsAppVerificationWrapper;