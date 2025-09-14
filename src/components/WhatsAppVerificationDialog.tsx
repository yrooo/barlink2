"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface WhatsAppVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

const WhatsAppVerificationDialog: React.FC<WhatsAppVerificationDialogProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const router = useRouter();

  const handleYesClick = () => {
    if (dontShowAgain) {
      onDontShowAgain();
    }
    onClose();
    router.push('/profile');
  };

  const handleNoClick = () => {
    if (dontShowAgain) {
      onDontShowAgain();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black text-black mb-2">
            📱 Verifikasi WhatsApp
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-700 font-medium">
            Tautkan nomor WhatsApp anda, kami akan mengirimkan notifikasi ke nomor WhatsApp anda.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6">
          <div className="flex items-center space-x-3 p-4 bg-yellow-100 border-2 border-yellow-400 rounded">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              className="border-2 border-black"
            />
            <label 
              htmlFor="dont-show-again" 
              className="text-sm font-medium text-gray-800 cursor-pointer"
            >
              Jangan tampilkan lagi
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleNoClick}
            variant="outline"
            className="w-full sm:w-auto border-2 border-black bg-white text-black hover:bg-gray-100 font-bold"
          >
            Tidak
          </Button>
          <Button
            onClick={handleYesClick}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Iya, Tautkan Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppVerificationDialog;